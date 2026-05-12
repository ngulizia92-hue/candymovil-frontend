import { useState, useEffect, useMemo } from "react"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const T = "#00ACC1"   // turquesa principal
const TL = "#e0f7fa"  // turquesa claro

export default function PantallaAdmin() {
  const [datos, setDatos] = useState([])
  const [tabActiva, setTabActiva] = useState(0)
  const [filtroCat, setFiltroCat] = useState("")
  const [filtroClasif, setFiltroClasif] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [soloRelevados, setSoloRelevados] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/admin/resumen`)
      .then(r => r.json())
      .then(d => { setDatos(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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

  return (
    <div style={{ minHeight: "100vh", background: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Top nav — igual que CandyPanel */}
      <div style={{ background: "#1a1f2e", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>🍬 CandyMovil</span>
        <span style={{ color: "#9ca3af", fontSize: 13 }}>Panel de Relevamientos</span>
      </div>

      {/* Contenido */}
      <div style={{ padding: "32px 40px 0" }}>

        {/* Título */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>Relevamiento de Stock</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {ubicacion?.lineas.length || 0} SKUs · {totalRelevados} relevados
            {ubicacion?.fecha && ` · Último: ${new Date(ubicacion.fecha).toLocaleString("es-AR")} — Vendedor ${ubicacion.operario}`}
          </p>
        </div>

        {/* Tabs ubicaciones — igual estilo que CandyPanel */}
        <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex", gap: 0, marginBottom: 0 }}>
          {datos.map((d, i) => (
            <button key={d.ubicacion_id}
              onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda(""); setSoloRelevados(false) }}
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


        {/* Buscador + contador */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}>
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
            <select
              value={filtroCat}
              onChange={e => { setFiltroCat(e.target.value); setFiltroClasif("") }}
              style={{ padding: "7px 12px", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8, color: filtroCat ? "#111827" : "#9ca3af", outline: "none", cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = T}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="">Categoría</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filtroClasif}
              onChange={e => setFiltroClasif(e.target.value)}
              style={{ padding: "7px 12px", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8, color: filtroClasif ? "#111827" : "#9ca3af", outline: "none", cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = T}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="">Clasificación</option>
              {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => setSoloRelevados(!soloRelevados)}
              style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                background: soloRelevados ? T : "white",
                border: `1px solid ${soloRelevados ? T : "#e5e7eb"}`,
                color: soloRelevados ? "white" : "#6b7280",
              }}
            >
              Solo relevados
            </button>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{lineasFiltradas.length} productos</span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
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
              <tr key={l.sku} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "11px 40px", fontFamily: "monospace", fontSize: 13, color: "#374151", fontWeight: 500 }}>{l.sku}</td>
                <td style={{ padding: "11px 16px", color: l.relevado ? T : "#111827", fontWeight: l.relevado ? 600 : 400 }}>{l.descripcion}</td>
                <td style={{ padding: "11px 16px", color: "#6b7280" }}>{l.categoria}</td>
                <td style={{ padding: "11px 16px", color: "#6b7280" }}>{l.clasificacion}</td>
                <td style={{ padding: "11px 40px 11px 16px", textAlign: "right", fontWeight: 700, color: l.relevado ? T : "#d1d5db", fontSize: l.relevado ? 15 : 13 }}>
                  {l.relevado ? l.cantidad : "—"}
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
                {lineasFiltradas.filter(l => l.relevado).reduce((s, l) => s + l.cantidad, 0).toLocaleString("es-AR")} u.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
