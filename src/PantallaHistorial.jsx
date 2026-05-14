import { useState, useEffect } from "react"
import { T } from "./theme"
import { getStockLogHoy, deleteStockLog } from "./api"
import { getPendingLogs, deleteLog } from "./offlineQueue"

const IcTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/>
  </svg>
)
const IcLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IcCal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>
  </svg>
)

function HeaderBlock({ children }) {
  return (
    <div style={{
      background: T.header, color: T.headerInk,
      padding: "10px 20px 20px", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: "50%", background: T.headerDecor }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  )
}

export default function PantallaHistorial({ sesion, pendingCount, refreshCount }) {
  const [entradas, setEntradas] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    Promise.all([
      getStockLogHoy(sesion.vendedor).catch(() => []),
      getPendingLogs().catch(() => []),
    ]).then(([servidor, cola]) => {
      setEntradas(servidor)
      // Sin filtro de operario: cada celu es de un solo operario
      setPendientes(cola)
    }).finally(() => setCargando(false))
  }, [sesion.vendedor, pendingCount])

  async function handleEliminar(id) {
    try {
      await deleteStockLog(id, sesion.vendedor)
      setEntradas(prev => prev.filter(e => e.id !== id))
    } catch {}
  }

  async function handleEliminarPendiente(id) {
    try {
      await deleteLog(id)
      setPendientes(prev => prev.filter(p => p.id !== id))
      refreshCount?.()
    } catch {}
  }

  const total = entradas.reduce((a, b) => a + b.cantidad, 0) + pendientes.reduce((a, b) => a + b.cantidad, 0)

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HeaderBlock>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "2.5px", fontWeight: 700, opacity: 0.8 }}>HISTORIAL</div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: T.brand, letterSpacing: "-0.8px" }}>Mis cargas</div>
          </div>
          <div style={{ color: T.headerInk, display: "inline-flex", opacity: 0.85 }}><IcCal /></div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.18)", borderRadius: 999, padding: "3px 3px",
          display: "flex", marginTop: 16,
        }}>
          <div style={{
            flex: 1, height: 34, borderRadius: 999, background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.primary, fontWeight: 800, fontSize: 13,
          }}>
            Hoy · <span style={{ opacity: 0.65, marginLeft: 4 }}>{entradas.length + pendientes.length}</span>
          </div>
        </div>
      </HeaderBlock>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Total banner */}
        <div style={{
          background: T.accent, color: T.accentInk, borderRadius: 20,
          padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", opacity: 0.75 }}>TOTAL HOY</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.brand, letterSpacing: "-0.8px", lineHeight: 1 }}>
              {total} unidades
            </div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: 12, padding: "8px 12px", fontSize: 12, fontWeight: 800 }}>
            {entradas.length} ítems
          </div>
        </div>

        {/* Items pendientes de sincronizar */}
        {pendientes.map((p, i) => (
          <div key={`p-${i}`} style={{
            background: "#fffbeb", border: "1.5px solid #fcd34d", borderRadius: 18,
            padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: "#fef3c7", color: "#d97706",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 12, fontFamily: T.brand, flexShrink: 0,
            }}>{p.sku}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.sku}
              </div>
              <div style={{ fontSize: 11, color: "#b45309", marginTop: 2 }}>
                ⏳ Pendiente de sincronizar
              </div>
            </div>
            <div style={{
              background: "#fcd34d", color: "#92400e",
              fontWeight: 800, fontSize: 14, padding: "6px 12px", borderRadius: 999,
              fontFamily: T.brand, minWidth: 44, textAlign: "center",
            }}>×{p.cantidad}</div>
            <button onClick={() => handleEliminarPendiente(p.id)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#b45309", padding: 4, display: "inline-flex",
            }}><IcTrash /></button>
          </div>
        ))}

        {cargando ? (
          <div style={{ textAlign: "center", padding: 40, color: T.muted, fontSize: 14 }}>Cargando...</div>
        ) : entradas.length === 0 && pendientes.length === 0 ? (
          <div style={{
            background: T.card, border: T.cardBorder, borderRadius: 20,
            padding: "32px 22px", textAlign: "center", color: T.muted,
          }}>
            <div style={{ fontSize: 38, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>Sin cargas todavía</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Empezá un relevamiento desde la pantalla principal.</div>
          </div>
        ) : entradas.map(e => (
          <div key={e.id} style={{
            background: T.card, border: T.cardBorder, borderRadius: 18,
            padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: T.skuBg, color: T.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 12, fontFamily: T.brand, flexShrink: 0,
            }}>{e.sku}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.descripcion}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                {e.ubicacion_nombre || ""} · {formatHora(e.created_at)}
              </div>
            </div>
            <div style={{
              background: T.accent, color: T.accentInk,
              fontWeight: 800, fontSize: 14, padding: "6px 12px", borderRadius: 999,
              fontFamily: T.brand, minWidth: 44, textAlign: "center",
            }}>×{e.cantidad}</div>
            {e.bloqueado ? (
              <div title="Ajustado por admin" style={{
                padding: 4, display: "inline-flex", color: "#f59e0b", opacity: 0.8,
              }}><IcLock /></div>
            ) : (
              <button onClick={() => handleEliminar(e.id)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: T.muted, padding: 4, display: "inline-flex",
              }}><IcTrash /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatHora(iso) {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  } catch { return "" }
}
