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
const IcSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
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

const CACHE_KEY = v => `cm_historial_${v}`

const hoy = () => new Date().toISOString().slice(0, 10)
const ayer = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10) }
const lunesDeEstaSemana = () => {
  const d = new Date(); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff); return d.toISOString().slice(0, 10)
}

const FILTROS = [
  { id: "hoy",    label: "Hoy",        desde: () => hoy(),              hasta: () => hoy() },
  { id: "ayer",   label: "Ayer",       desde: () => ayer(),             hasta: () => ayer() },
  { id: "semana", label: "Esta semana", desde: () => lunesDeEstaSemana(), hasta: () => hoy() },
]

export default function PantallaHistorial({ sesion, pendingCount, refreshCount, entradas, setEntradas }) {
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(entradas.length === 0)
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState("hoy")
  const [mostrarTeclado, setMostrarTeclado] = useState(false)

  function onKeyBusqueda(k) {
    if (k === "del") setBusqueda(v => v.slice(0, -1))
    else if (k === "clr") setBusqueda("")
    else setBusqueda(v => v + k)
  }

  useEffect(() => {
    if (entradas.length === 0) setCargando(true)
    const f = FILTROS.find(f => f.id === filtro)

    const cargarServidor = navigator.onLine
      ? getStockLogHoy(sesion.vendedor, f.desde(), f.hasta()).catch(() => null)
      : Promise.resolve(null)

    Promise.all([cargarServidor, getPendingLogs().catch(() => [])
    ]).then(([servidor, cola]) => {
      if (servidor !== null && (servidor.length > 0 || cola.length === 0)) {
        setEntradas(servidor)
        localStorage.setItem(CACHE_KEY(sesion.vendedor), JSON.stringify(servidor))
      }
      setPendientes(cola)
    }).finally(() => setCargando(false))
  }, [sesion.vendedor, pendingCount, filtro])

  async function handleEliminar(id) {
    try {
      await deleteStockLog(id, sesion.vendedor)
      const nuevas = entradas.filter(e => e.id !== id)
      setEntradas(nuevas)
      localStorage.setItem(CACHE_KEY(sesion.vendedor), JSON.stringify(nuevas))
    } catch {}
  }

  async function handleEliminarPendiente(id) {
    try {
      await deleteLog(id)
      setPendientes(prev => prev.filter(p => p.id !== id))
      refreshCount?.()
    } catch {}
  }

  const q = busqueda.trim().toLowerCase()
  const entradasFiltradas = q ? entradas.filter(e => e.sku?.toLowerCase().includes(q) || e.descripcion?.toLowerCase().includes(q)) : entradas
  const pendientesFiltrados = q ? pendientes.filter(p => p.sku?.toLowerCase().includes(q)) : pendientes

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
        {/* Filtros de fecha */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)} style={{
              flex: 1, height: 30, borderRadius: 999, border: "none", cursor: "pointer",
              background: filtro === f.id ? "#fff" : "rgba(255,255,255,0.18)",
              color: filtro === f.id ? T.primary : "rgba(255,255,255,0.85)",
              fontSize: 12, fontWeight: 700,
            }}>{f.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <div style={{
            background: "rgba(255,255,255,0.18)", borderRadius: 999, padding: "3px 3px",
            display: "flex", flex: "0 0 auto",
          }}>
            <div style={{
              height: 34, borderRadius: 999, background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.primary, fontWeight: 800, fontSize: 13, padding: "0 16px",
            }}>
              Hoy · <span style={{ opacity: 0.65, marginLeft: 4 }}>{entradas.length + pendientes.length}</span>
            </div>
          </div>
          <div onClick={() => setMostrarTeclado(true)} style={{
            flex: 1, background: mostrarTeclado ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)",
            borderRadius: 999, display: "flex", alignItems: "center", padding: "0 14px", gap: 8,
            cursor: "pointer", height: 40,
          }}>
            <span style={{ color: "rgba(255,255,255,0.7)", display: "inline-flex" }}><IcSearch /></span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: busqueda ? "#fff" : "rgba(255,255,255,0.5)" }}>
              {busqueda || "Buscar SKU..."}
            </span>
            {busqueda && (
              <button onClick={e => { e.stopPropagation(); setBusqueda(""); setMostrarTeclado(false) }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
            )}
          </div>
        </div>
      </HeaderBlock>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Teclado numérico de búsqueda */}
        {mostrarTeclado && (
          <div style={{ background: T.keypadBg, borderRadius: 20, padding: "12px 12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 4px" }}>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: T.brand, color: T.ink, letterSpacing: 2 }}>
                {busqueda || <span style={{ opacity: 0.3, fontSize: 16 }}>Buscar SKU...</span>}
              </span>
              <button onClick={() => setMostrarTeclado(false)} style={{
                background: T.primary, color: "#fff", border: "none", borderRadius: 999,
                padding: "6px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer",
              }}>Listo</button>
            </div>
            <div style={{ display: "grid", gridTemplateRows: "repeat(4,1fr)", gap: 6 }}>
              {[["1","2","3"],["4","5","6"],["7","8","9"],["clr","0","del"]].map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {row.map(k => (
                    <button key={k} onClick={() => onKeyBusqueda(k)} style={{
                      height: 50, borderRadius: 12, border: "none", cursor: "pointer",
                      background: k === "clr" || k === "del" ? T.keySpecialBg : T.keyBg,
                      color: k === "clr" || k === "del" ? T.keySpecialInk : T.ink,
                      fontSize: k === "del" ? 20 : k === "clr" ? 15 : 22,
                      fontWeight: 800, fontFamily: T.brand,
                    }}>{k === "del" ? "⌫" : k === "clr" ? "C" : k}</button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

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
        {pendientesFiltrados.map((p, i) => (
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
        ) : entradasFiltradas.map(e => (
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
            ) : filtro === "hoy" ? (
              <button onClick={() => handleEliminar(e.id)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: T.muted, padding: 4, display: "inline-flex",
              }}><IcTrash /></button>
            ) : null}
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
