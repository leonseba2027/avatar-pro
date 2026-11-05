"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck, Smartphone, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  cancelarSolicitud, estadoAprobacion, registrarDispositivo, reenviarCodigo,
  resolverAprobacion, solicitarAprobacion, verificarCodigo, type RespuestaResolucion,
} from "@/app/(app)/aprobaciones/actions";

type Pendiente = { id: string; descripcion: string; solicitado_session: string; vence_at: string; accion: string };
type EstadoPedido =
  | { fase: "enviando" }
  | { fase: "esperando"; id: string; otros: string[] }
  | { fase: "codigo"; id: string; email: string; error?: string }
  | { fase: "ejecutando"; texto: string; id?: string }
  | { fase: "fin"; ok: boolean; texto: string };

const Ctx = createContext<(accion: string, detalle: unknown) => void>(() => {});
export const usePedirAprobacion = () => useContext(Ctx);

async function regenerar(servicioId: string, aprobacionId: string): Promise<{ ok: boolean; texto: string }> {
  try {
    const r = await fetch("/api/avatar/generar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ servicioId, modo: "regenerar", aprobacionId }) });
    const j = await r.json();
    return r.ok ? { ok: true, texto: `Avatar regenerado (versión ${j.version}).` } : { ok: false, texto: j.error ?? "Error" };
  } catch { return { ok: false, texto: "Se cortó la conexión mientras se regeneraba." }; }
}

export function Sincronizacion({ userId, sessionId, pendientesIniciales, children }: {
  userId: string; sessionId: string; pendientesIniciales: Pendiente[]; children: React.ReactNode;
}) {
  const router = useRouter();
  const [pedido, setPedido] = useState<EstadoPedido | null>(null);
  const [entrantes, setEntrantes] = useState<Pendiente[]>(pendientesIniciales);
  const [resolviendo, setResolviendo] = useState<{ fase: "trabajando" | "fin"; ok?: boolean; texto: string } | null>(null);
  const [codigo, setCodigo] = useState("");
  const pedidoRef = useRef(pedido); pedidoRef.current = pedido;
  const dlgPedido = useRef<HTMLDialogElement>(null);
  const dlgEntrante = useRef<HTMLDialogElement>(null);
  const refrescar = useRef<ReturnType<typeof setTimeout> | null>(null);

  const salir = useCallback(async () => {
    await createClient().auth.signOut({ scope: "local" });
    window.location.href = "/login?desconectado=1";
  }, []);

  // Latido del dispositivo
  useEffect(() => { registrarDispositivo().then((r) => { if (r.revocado) salir(); }).catch(() => {}); }, [salir]);

  // Resultado de una solicitud propia
  const alResolverse = useCallback((id: string, estado: string, resultado: string | null) => {
    const p = pedidoRef.current;
    if (!p || !("id" in p) || p.id !== id) return;
    if (estado === "rechazada") setPedido({ fase: "fin", ok: false, texto: "La solicitud fue rechazada desde tu otro dispositivo." });
    else if (estado === "vencida") setPedido({ fase: "fin", ok: false, texto: "La solicitud venció. Pedila de nuevo." });
    else if (estado === "fallida") setPedido({ fase: "fin", ok: false, texto: resultado ?? "Falló al ejecutarse." });
    else if (estado === "aprobada" && p.fase === "esperando") setPedido({ fase: "ejecutando", id, texto: "Aprobada en tu otro dispositivo. Ejecutando…" });
    else if (estado === "ejecutada" && resultado && p.fase !== "codigo") setPedido({ fase: "fin", ok: true, texto: resultado });
  }, []);

  // Tiempo real: cambios de datos, solicitudes entrantes y desconexión remota
  useEffect(() => {
    const supabase = createClient();
    const programarRefresco = () => {
      if (refrescar.current) clearTimeout(refrescar.current);
      refrescar.current = setTimeout(() => router.refresh(), 700);
    };
    const filtro = `user_id=eq.${userId}`;
    const canal = supabase.channel(`sync-${userId}-${sessionId}`);
    for (const tabla of ["servicios", "avatares", "fuentes_datos"])
      canal.on("postgres_changes", { event: "*", schema: "public", table: tabla, filter: filtro }, programarRefresco);
    canal.on("postgres_changes", { event: "INSERT", schema: "public", table: "aprobaciones", filter: filtro }, (p) => {
      const n = p.new as Pendiente;
      if (n.solicitado_session !== sessionId) setEntrantes((xs) => [...xs.filter((x) => x.id !== n.id), n]);
    });
    canal.on("postgres_changes", { event: "UPDATE", schema: "public", table: "aprobaciones", filter: filtro }, (p) => {
      const n = p.new as Pendiente & { estado: string; resultado: string | null };
      if (n.estado !== "pendiente") setEntrantes((xs) => xs.filter((x) => x.id !== n.id));
      alResolverse(n.id, n.estado, n.resultado);
    });
    canal.on("postgres_changes", { event: "UPDATE", schema: "public", table: "dispositivos", filter: filtro }, (p) => {
      const d = p.new as { session_id: string; revocado: boolean };
      if (d.session_id === sessionId && d.revocado) salir();
      else programarRefresco();
    });
    canal.subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [userId, sessionId, router, salir, alResolverse]);

  // Respaldo por si el tiempo real se corta: consultar cada 4 s mientras se espera
  const idEspera = pedido && "id" in pedido && (pedido.fase === "esperando" || pedido.fase === "ejecutando") ? pedido.id : undefined;
  useEffect(() => {
    if (!idEspera) return;
    const t = setInterval(async () => {
      const e = await estadoAprobacion(idEspera).catch(() => null);
      if (e) alResolverse(idEspera, e.estado, e.resultado);
    }, 4000);
    return () => clearInterval(t);
  }, [idEspera, alResolverse]);

  useEffect(() => { if (pedido) dlgPedido.current?.showModal(); else dlgPedido.current?.close(); }, [pedido]);
  const entrante = entrantes.find((e) => new Date(e.vence_at).getTime() > Date.now());
  useEffect(() => { if (entrante || resolviendo) dlgEntrante.current?.showModal(); else dlgEntrante.current?.close(); }, [entrante, resolviendo]);

  const terminar = (r: RespuestaResolucion) => {
    setPedido({ fase: "fin", ok: r.ok, texto: r.mensaje });
    router.refresh();
  };

  const pedir = useCallback(async (accion: string, detalle: unknown) => {
    setCodigo("");
    setPedido({ fase: "enviando" });
    const r = await solicitarAprobacion(accion, detalle);
    if (!r.ok) return setPedido({ fase: "fin", ok: false, texto: r.error });
    setPedido(r.modo === "dispositivo" ? { fase: "esperando", id: r.id, otros: r.otros } : { fase: "codigo", id: r.id, email: r.email });
  }, []);

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (pedido?.fase !== "codigo") return;
    const id = pedido.id;
    setPedido({ fase: "ejecutando", texto: "Verificando código…" });
    const r = await verificarCodigo(id, codigo);
    if (!r.ok) return setPedido({ fase: "codigo", id, email: (pedido as { email: string }).email, error: r.mensaje });
    if (r.regenerar) {
      setPedido({ fase: "ejecutando", texto: "Regenerando el avatar… puede tardar hasta 2 minutos." });
      const g = await regenerar(r.regenerar.servicioId, r.regenerar.aprobacionId);
      return terminar({ ok: g.ok, mensaje: g.texto });
    }
    terminar(r);
  }

  async function decidir(id: string, decision: "aprobar" | "rechazar") {
    setResolviendo({ fase: "trabajando", texto: decision === "aprobar" ? "Aprobando…" : "Rechazando…" });
    const r = await resolverAprobacion(id, decision);
    setEntrantes((xs) => xs.filter((x) => x.id !== id));
    if (r.ok && r.regenerar) {
      setResolviendo({ fase: "trabajando", texto: "Regenerando el avatar… puede tardar hasta 2 minutos." });
      const g = await regenerar(r.regenerar.servicioId, r.regenerar.aprobacionId);
      setResolviendo({ fase: "fin", ok: g.ok, texto: g.texto });
    } else setResolviendo({ fase: "fin", ok: r.ok, texto: r.mensaje });
    router.refresh();
  }

  const cerrarPedido = async () => {
    if (pedido && "id" in pedido && (pedido.fase === "esperando" || pedido.fase === "codigo")) await cancelarSolicitud(pedido.id);
    setPedido(null);
  };

  return (
    <Ctx.Provider value={pedir}>
      {children}

      {/* Diálogo de quien pide la acción */}
      <dialog ref={dlgPedido} onCancel={(e) => { e.preventDefault(); cerrarPedido(); }} aria-labelledby="t-pedido"
        className="m-auto w-[min(100%-2rem,28rem)] rounded-2xl bg-tarjeta p-6 text-texto backdrop:bg-black/50">
        <h2 id="t-pedido" className="mb-3 flex items-center gap-2 text-xl font-bold"><ShieldCheck aria-hidden="true" /> Acción protegida</h2>
        <div role="status" aria-live="polite">
          {pedido?.fase === "enviando" && <p className="flex items-center gap-2"><Loader2 className="animate-spin" aria-hidden="true" /> Enviando solicitud…</p>}
          {pedido?.fase === "esperando" && (
            <div className="space-y-3">
              <p>Abrí Avatar Pro en tu otro dispositivo y tocá <strong>Aprobar</strong>.</p>
              <ul className="space-y-1 text-sm text-tenue">{pedido.otros.map((o) => <li key={o} className="flex items-center gap-2"><Smartphone size={16} aria-hidden="true" /> {o}</li>)}</ul>
              <p className="flex items-center gap-2 text-tenue"><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Esperando… (vence en 15 minutos)</p>
            </div>
          )}
          {pedido?.fase === "codigo" && (
            <form onSubmit={enviarCodigo} className="space-y-3">
              <p>No tenés otro dispositivo conectado. Te enviamos un código a <strong>{pedido.email}</strong>.</p>
              <label htmlFor="codigo" className="block font-medium">Código del email</label>
              <input id="codigo" inputMode="numeric" autoComplete="one-time-code" className="campo text-center text-2xl tracking-[0.4em]" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))} maxLength={10} autoFocus />
              {pedido.error && <p role="alert" className="text-peligro">{pedido.error}</p>}
              <button className="boton-primario w-full" disabled={codigo.length < 6}>Confirmar</button>
              <button type="button" onClick={() => reenviarCodigo()} className="w-full text-sm text-tenue underline">Reenviar código</button>
            </form>
          )}
          {pedido?.fase === "ejecutando" && <p className="flex items-center gap-2"><Loader2 className="animate-spin" aria-hidden="true" /> {pedido.texto}</p>}
          {pedido?.fase === "fin" && (
            <p className={`flex items-start gap-2 ${pedido.ok ? "text-exito" : "text-peligro"}`}>
              {pedido.ok ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />} {pedido.texto}
            </p>
          )}
        </div>
        {pedido?.fase !== "ejecutando" && (
          <button onClick={cerrarPedido} className="boton-secundario mt-5 w-full">{pedido?.fase === "fin" ? "Cerrar" : "Cancelar"}</button>
        )}
      </dialog>

      {/* Diálogo del dispositivo que aprueba */}
      <dialog ref={dlgEntrante} onCancel={(e) => e.preventDefault()} aria-labelledby="t-entrante"
        className="m-auto w-[min(100%-2rem,28rem)] rounded-2xl bg-tarjeta p-6 text-texto backdrop:bg-black/50">
        <h2 id="t-entrante" className="mb-3 flex items-center gap-2 text-xl font-bold"><ShieldCheck aria-hidden="true" /> Solicitud de aprobación</h2>
        {resolviendo ? (
          <div role="status" aria-live="polite">
            {resolviendo.fase === "trabajando"
              ? <p className="flex items-center gap-2"><Loader2 className="animate-spin" aria-hidden="true" /> {resolviendo.texto}</p>
              : <p className={resolviendo.ok ? "text-exito" : "text-peligro"}>{resolviendo.texto}</p>}
            {resolviendo.fase === "fin" && <button onClick={() => setResolviendo(null)} className="boton-secundario mt-5 w-full">Cerrar</button>}
          </div>
        ) : entrante && (
          <>
            <p className="mb-1 text-tenue">Otro de tus dispositivos quiere:</p>
            <p className="mb-5 text-lg font-semibold">{entrante.descripcion}</p>
            <p className="mb-5 text-sm text-tenue">Si no fuiste vos, tocá Rechazar y revisá tus dispositivos conectados.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => decidir(entrante.id, "rechazar")} className="boton bg-peligro text-white"><XCircle size={20} aria-hidden="true" /> Rechazar</button>
              <button onClick={() => decidir(entrante.id, "aprobar")} className="boton bg-exito text-white dark:text-gray-900"><CheckCircle2 size={20} aria-hidden="true" /> Aprobar</button>
            </div>
          </>
        )}
      </dialog>
    </Ctx.Provider>
  );
}
