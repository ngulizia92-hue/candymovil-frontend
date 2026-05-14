import { useState, useEffect, useMemo } from "react"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const T = "#00ACC1"
const TL = "#e0f7fa"

const IcPencil = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export default function PantallaAdmin() {
  const [seccion, setSeccion] = useState("relevamiento")
  const [datos, setDatos] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [tabActiva, setTabActiva] = useState(0)
  const [filtroCat, setFiltroCat] = useState("")
  const [filtroClasif, setFiltroClasif] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [soloRelevados, setSoloRelevados] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modalLinea, setModalLinea] = useState(null)
  const [subTab, setSubTab] = useState("productos")
  const [observaciones, setObservaciones] = useState([])
  const [loadingObs, setLoadingObs] = useState(false)

  const cargarDatos = () => {
    fetch(`${API}/admin/resumen`)
      .then(r => r.json())
      .then(d => { setDatos(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    cargarDatos()
    fetch(`${API}/vendedores/`).then(r => r.json()).then(setVendedores).catch(() => {})
  }, [])

  const vendedoresMap = useMemo(() =>
    Object.fromEntries(vendedores.map(v => [v.numero, v.nombre])),
    [vendedores]
  )

  useEffect(() => {
    if (subTab !== "observaciones") return
    const ubicacion = datos[tabActiva]
    if (!ubicacion) return
    setLoadingObs(true)
    fetch(`${API}/observaciones/?ubicacion_id=${ubicacion.ubicacion_id}`)
      .then(r => r.json())
      .then(setObservaciones)
      .catch(() => setObservaciones([]))
      .finally(() => setLoadingObs(false))
  }, [subTab, tabActiva, datos])

  const ubicacion = datos[tabActiva]

  const categorias = useMemo(() => {
    if (!ubicacion) return []
    return [...new Set(ubicacion.lineas.map(l => l.categoria).filter(Boolean))].sort()
  }, [ubicacion])

  const clasificaciones = useMemo(() => {
    if (!ubicacion) return []
    return [...new Set(
      ubicacion.lineas.filter(l => !filtroCat || l.categoria === filtroCat)
        .map(l => l.clasificacion).filter(Boolean)
    )].sort()
  }, [ubicacion, filtroCat])

  const lineasFiltradas = useMemo(() => {
    if (!ubicacion) return []
    return ubicacion.lineas.filter(l => {
      if (soloRelevados && !l.relevado) return false
      if (filtroCat && l.categoria !== filtroCat) return false
      if (filtroClasif && l.clasificacion !== filtroClasif) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        if (!l.sku.toLowerCase().includes(q) && !l.descripcion.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [ubicacion, filtroCat, filtroClasif, busqueda, soloRelevados])

  const totalRelevados = useMemo(() => ubicacion?.lineas.filter(l => l.relevado).length || 0, [ubicacion])

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
      <span style={{ color: "#9ca3af", fontSize: 14 }}>Cargando relevamientos...</span>
    </div>
  )

  if (seccion === "vendedores") return <SeccionVendedores setSeccion={setSeccion} seccion={seccion} />

  return (
    <div style={{ minHeight: "100vh", background: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: "#1a1f2e", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>🍬 CandyMovil</span>
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {[["relevamiento", "Relevamientos"], ["vendedores", "Vendedores"]].map(([id, label]) => (
            <button key={id} onClick={() => setSeccion(id)} style={{
              padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: seccion === id ? T : "transparent",
              color: seccion === id ? "white" : "#9ca3af",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: "32px 40px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>Relevamiento de Stock</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {ubicacion?.lineas.length || 0} SKUs · {totalRelevados} relevados
          </p>
        </div>

        <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex", gap: 0, marginBottom: 0 }}>
          {datos.map((d, i) => (
            <button key={d.ubicacion_id}
              onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda(""); setSoloRelevados(false); setSubTab("productos") }}
              style={{
                padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                background: "none", border: "none",
                borderBottom: tabActiva === i ? `3px solid ${T}` : "3px solid transparent",
                color: tabActiva === i ? T : "#6b7280",
                marginBottom: -1,
              }}
            >
              {d.ubicacion}
            </button>
          ))}
        </div>

        {/* Sub-tabs: Productos | Observaciones */}
        <div style={{ display: "flex", gap: 4, padding: "12px 0 0", borderBottom: "1px solid #e5e7eb", marginBottom: 0 }}>
          {[["productos", "Productos"], ["observaciones", "Observaciones 💬"]].map(([id, label]) => (
            <button key={id} onClick={() => setSubTab(id)} style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: "none", border: "none",
              borderBottom: subTab === id ? `3px solid ${T}` : "3px solid transparent",
              color: subTab === id ? T : "#6b7280",
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {subTab === "observaciones" ? (
          <div style={{ padding: "16px 0" }}>
            {loadingObs ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 }}>Cargando observaciones...</div>
            ) : observaciones.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 }}>Sin observaciones para esta ubicación</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {observaciones.map(obs => (
                  <div key={obs.id} style={{
                    background: obs.resuelta ? "#f9fafb" : "#fffbeb",
                    border: obs.resuelta ? "1px solid #e5e7eb" : "1.5px solid #fcd34d",
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", alignItems: "flex-start", gap: 16,
                  }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>💬</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: obs.resuelta ? "#6b7280" : "#111827", marginBottom: 4 }}>{obs.texto}</div>
                      {obs.sku && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>SKU: <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{obs.sku}</span></div>}
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {resolveNombre(obs.operario, vendedoresMap)} · {new Date(obs.created_at).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      {obs.resuelta && (
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                          Resuelta por {resolveNombre(obs.resuelta_por, vendedoresMap)} · {new Date(obs.resuelta_en).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {obs.resuelta ? (
                        <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, border: "1px solid #86efac" }}>✓ Resuelta</span>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await fetch(`${API}/observaciones/${obs.id}/resolver?por=ADMIN`, { method: "PATCH" })
                              setObservaciones(prev => prev.map(o => o.id === obs.id ? { ...o, resuelta: true, resuelta_por: "ADMIN", resuelta_en: new Date().toISOString() } : o))
                            } catch {}
                          }}
                          style={{
                            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                            background: "#16a34a", color: "white", fontSize: 13, fontWeight: 700,
                          }}
                        >Resolver</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {subTab === "productos" && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" placeholder="Buscar SKU, nombre..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{
                paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                fontSize: 14, border: "1px solid #e5e7eb", borderRadius: 8,
                outline: "none", width: 280, color: "#111827",
              }}
              onFocus={e => e.target.style.borderColor = T}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select value={filtroCat} onChange={e => { setFiltroCat(e.target.value); setFiltroClasif("") }}
              style={{ padding: "7px 12px", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8, color: filtroCat ? "#111827" : "#9ca3af", outline: "none", cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="">Categoría</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filtroClasif} onChange={e => setFiltroClasif(e.target.value)}
              style={{ padding: "7px 12px", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8, color: filtroClasif ? "#111827" : "#9ca3af", outline: "none", cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="">Clasificación</option>
              {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setSoloRelevados(!soloRelevados)} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: soloRelevados ? T : "white",
              border: `1px solid ${soloRelevados ? T : "#e5e7eb"}`,
              color: soloRelevados ? "white" : "#6b7280",
            }}>Solo relevados</button>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{lineasFiltradas.length} productos</span>
          </div>
        </div>}
      </div>

      {/* Modal log */}
      {modalLinea && (
        <LogModal
          linea={modalLinea}
          ubicacion={ubicacion}
          vendedoresMap={vendedoresMap}
          onClose={() => setModalLinea(null)}
          onRefresh={() => {
            cargarDatos()
            // Actualizar también el modal con los nuevos datos
            setModalLinea(null)
          }}
        />
      )}

      {/* Tabla — solo en subTab productos */}
      {subTab === "productos" && <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
              <th style={{ textAlign: "left", padding: "12px 40px 12px 40px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>SKU</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nombre</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Categoría</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Clasificación</th>
              <th style={{ textAlign: "right", padding: "12px 40px 12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unidades</th>
            </tr>
          </thead>
          <tbody>
            {lineasFiltradas.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "80px", color: "#9ca3af", fontSize: 14 }}>Sin resultados</td></tr>
            ) : lineasFiltradas.map((l, i) => (
              <tr key={l.sku}
                onClick={() => l.relevado && setModalLinea(l)}
                style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f9fafb", cursor: l.relevado ? "pointer" : "default" }}
              >
                <td style={{ padding: "11px 40px", fontFamily: "monospace", fontSize: 13, color: "#374151", fontWeight: 500 }}>{l.sku}</td>
                <td style={{ padding: "11px 16px", color: l.relevado ? T : "#111827", fontWeight: l.relevado ? 600 : 400 }}>{l.descripcion}</td>
                <td style={{ padding: "11px 16px", color: "#6b7280" }}>{l.categoria}</td>
                <td style={{ padding: "11px 16px", color: "#6b7280" }}>{l.clasificacion}</td>
                <td style={{ padding: "11px 40px 11px 16px", textAlign: "right", fontWeight: 700, color: l.relevado ? T : "#d1d5db", fontSize: l.relevado ? 15 : 13 }}>
                  {l.relevado ? l.total : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #f3f4f6", background: "#fafafa" }}>
              <td colSpan={4} style={{ padding: "12px 40px", fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
                {lineasFiltradas.length} artículos · {lineasFiltradas.filter(l => l.relevado).length} relevados
              </td>
              <td style={{ padding: "12px 40px 12px 16px", textAlign: "right", fontWeight: 700, color: T, fontSize: 15 }}>
                {lineasFiltradas.filter(l => l.relevado).reduce((s, l) => s + l.total, 0).toLocaleString("es-AR")} u.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>}
    </div>
  )
}

function resolveNombre(operario, vendedoresMap) {
  if (!operario || operario === "ADMIN") return "Admin"
  return vendedoresMap[operario] || `#${operario}`
}

function LogModal({ linea, ubicacion, vendedoresMap, onClose, onRefresh }) {
  const [ajustando, setAjustando] = useState(false)
  const [nuevaCantidad, setNuevaCantidad] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [liberando, setLiberando] = useState(false)
  const [errorAjuste, setErrorAjuste] = useState("")

  const fmtFecha = iso => new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })

  const esBloqueado = linea.entradas.some(e => e.operario === "ADMIN" && !e.eliminado)
  const delta = nuevaCantidad !== "" ? Number(nuevaCantidad) - linea.total : null

  async function handleLiberar() {
    if (!window.confirm("¿Liberar este SKU? Los operarios podrán volver a editarlo.")) return
    setLiberando(true)
    try {
      await fetch(`${API}/admin/liberar/${linea.sku}/${ubicacion.ubicacion_id}`, { method: "POST" })
      onRefresh()
    } finally {
      setLiberando(false)
    }
  }

  async function handleAjustar() {
    if (!nuevaCantidad || Number(nuevaCantidad) < 0) return
    if (delta === 0) { setAjustando(false); return }
    setGuardando(true); setErrorAjuste("")
    try {
      const r = await fetch(`${API}/stock-log/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ubicacion_id: ubicacion.ubicacion_id,
          sku: linea.sku,
          cantidad: delta,
          operario: "ADMIN",
        }),
      })
      if (!r.ok) throw new Error("Error al guardar")
      setAjustando(false)
      setNuevaCantidad("")
      onRefresh()
    } catch (err) {
      setErrorAjuste("No se pudo guardar el ajuste")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "white", borderRadius: 12, width: 700, maxWidth: "95vw", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
      >
        {/* Header oscuro */}
        <div style={{ background: "#1a1f2e", padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 4 }}>{linea.sku} · {ubicacion?.ubicacion}</div>
            <div style={{ color: "white", fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{linea.descripcion}</div>
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>{linea.categoria}{linea.clasificacion ? ` · ${linea.clasificacion}` : ""}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {/* Resumen + ajuste */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6" }}>
          {!ajustando ? (
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>Total relevado</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: T }}>{linea.total} u.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>Movimientos</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
                  {linea.entradas.length}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {esBloqueado && (
                  <button onClick={handleLiberar} disabled={liberando} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 16px", borderRadius: 8, border: "1px solid #fde68a",
                    background: "#fffbeb", color: "#92400e", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    opacity: liberando ? 0.6 : 1,
                  }}>🔓 {liberando ? "Liberando..." : "Liberar SKU"}</button>
                )}
                <button
                  onClick={() => { setAjustando(true); setNuevaCantidad(String(linea.total)) }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 16px", borderRadius: 8, border: `1px solid #e5e7eb`,
                    background: "white", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <IcPencil /> Ajustar unidades
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                  Nueva cantidad total
                </div>
                <input
                  type="number" min="0"
                  value={nuevaCantidad}
                  onChange={e => setNuevaCantidad(e.target.value)}
                  autoFocus
                  style={{
                    width: 120, height: 42, padding: "0 14px", fontSize: 20, fontWeight: 700,
                    border: `2px solid ${T}`, borderRadius: 8, outline: "none", color: "#111827",
                  }}
                />
              </div>
              {delta !== null && delta !== 0 && (
                <div style={{ paddingBottom: 8 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                    background: delta > 0 ? "#f0fdf4" : "#fef2f2",
                    color: delta > 0 ? "#16a34a" : "#ef4444",
                  }}>
                    {delta > 0 ? `+${delta}` : delta} u. vs. actual ({linea.total} u.)
                  </span>
                </div>
              )}
              {delta === 0 && nuevaCantidad !== "" && (
                <div style={{ paddingBottom: 8, fontSize: 13, color: "#9ca3af" }}>Sin cambios</div>
              )}
              <div style={{ display: "flex", gap: 8, paddingBottom: 2 }}>
                <button
                  onClick={handleAjustar}
                  disabled={guardando || nuevaCantidad === "" || Number(nuevaCantidad) < 0 || delta === 0}
                  style={{
                    height: 38, padding: "0 18px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: T, color: "white", fontSize: 13, fontWeight: 700,
                    opacity: (guardando || nuevaCantidad === "" || delta === 0) ? 0.5 : 1,
                  }}
                >{guardando ? "Guardando..." : "Confirmar"}</button>
                <button
                  onClick={() => { setAjustando(false); setNuevaCantidad(""); setErrorAjuste("") }}
                  style={{ height: 38, padding: "0 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", color: "#6b7280", fontSize: 13, cursor: "pointer" }}
                >Cancelar</button>
              </div>
              {errorAjuste && <p style={{ margin: 0, fontSize: 12, color: "#ef4444", alignSelf: "center" }}>{errorAjuste}</p>}
            </div>
          )}
        </div>

        {/* Tabla de logs */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "white" }}>
              <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                {["Fecha y hora", "Operario", "Unidades", "Estado"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linea.entradas.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Sin registros</td></tr>
              ) : linea.entradas.map(e => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "10px 16px", color: e.eliminado ? "#9ca3af" : "#6b7280" }}>{fmtFecha(e.fecha)}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600, color: e.eliminado ? "#9ca3af" : "#111827" }}>
                        {resolveNombre(e.operario, vendedoresMap)}
                      </span>
                      {e.operario !== "ADMIN" && (
                        <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>#{e.operario}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: 700, textDecoration: e.eliminado ? "line-through" : "none",
                    color: e.eliminado ? "#9ca3af" : e.cantidad < 0 ? "#ef4444" : T }}>
                    {e.cantidad > 0 ? `+${e.cantidad}` : e.cantidad}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {e.eliminado ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, display: "inline-block", width: "fit-content" }}>ANULADO</span>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>
                          por {resolveNombre(e.eliminado_por, vendedoresMap)} · {fmtFecha(e.eliminado_en)}
                        </span>
                      </div>
                    ) : e.operario === "ADMIN" ? (
                      <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>AJUSTE ADMIN</span>
                    ) : (
                      <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>ACTIVO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SeccionVendedores({ seccion, setSeccion }) {
  const [vendedores, setVendedores] = useState([])
  const [numero, setNumero] = useState("")
  const [nombre, setNombre] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    fetch(`${API}/vendedores/`).then(r => r.json()).then(setVendedores).catch(() => {})
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    if (!numero.trim() || !nombre.trim() || !pin.trim()) { setError("Completá todos los campos"); return }
    setGuardando(true); setError("")
    try {
      const r = await fetch(`${API}/vendedores/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: numero.trim(), nombre: nombre.trim(), pin: pin.trim() }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.detail || "Error") }
      const v = await r.json()
      setVendedores(prev => [...prev, v])
      setNumero(""); setNombre(""); setPin("")
    } catch (err) { setError(err.message) }
    finally { setGuardando(false) }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Dar de baja este vendedor?")) return
    await fetch(`${API}/vendedores/${id}`, { method: "DELETE" })
    setVendedores(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div style={{ minHeight: "100vh", background: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "#1a1f2e", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>🍬 CandyMovil</span>
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {[["relevamiento", "Relevamientos"], ["vendedores", "Vendedores"]].map(([id, label]) => (
            <button key={id} onClick={() => setSeccion(id)} style={{
              padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: seccion === id ? T : "transparent",
              color: seccion === id ? "white" : "#9ca3af",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 800 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Vendedores</h1>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 32 }}>Alta y baja de operarios que usan CandyMóvil</p>

        <form onSubmit={handleCrear} style={{
          background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12,
          padding: "24px", marginBottom: 32,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T, letterSpacing: "0.05em", marginBottom: 16, textTransform: "uppercase" }}>
            Nuevo vendedor
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 120 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Número</label>
              <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ej: 22"
                style={inputStyle} onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Nombre completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: María García"
                style={inputStyle} onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>PIN</label>
              <input value={pin} onChange={e => setPin(e.target.value)} placeholder="Ej: 1234" type="password"
                style={inputStyle} onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <button type="submit" disabled={guardando} style={{
                height: 38, padding: "0 20px", borderRadius: 8, border: "none", cursor: "pointer",
                background: T, color: "white", fontSize: 13, fontWeight: 700,
                opacity: guardando ? 0.6 : 1,
              }}>{guardando ? "Guardando..." : "Dar de alta"}</button>
            </div>
          </div>
          {error && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#e53935" }}>{error}</p>}
        </form>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
              {["#", "Número", "Nombre", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendedores.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>No hay vendedores dados de alta</td></tr>
            ) : vendedores.map((v, i) => (
              <tr key={v.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "11px 16px", color: "#9ca3af", fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: "11px 16px", fontFamily: "monospace", fontWeight: 700, color: T }}>{v.numero}</td>
                <td style={{ padding: "11px 16px", color: "#111827" }}>{v.nombre}</td>
                <td style={{ padding: "11px 16px", textAlign: "right" }}>
                  <button onClick={() => handleEliminar(v.id)} style={{
                    padding: "5px 14px", borderRadius: 6, border: "1px solid #fecaca",
                    background: "white", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>Dar de baja</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputStyle = {
  height: 38, padding: "0 12px", borderRadius: 8,
  border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
  background: "white", color: "#111827",
}
