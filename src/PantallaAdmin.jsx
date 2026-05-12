import { useState, useEffect, useMemo } from "react"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

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
    <div className="min-h-svh flex items-center justify-center bg-white">
      <div className="text-sm font-medium text-gray-400">Cargando relevamientos...</div>
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col bg-white">

      {/* Top nav */}
      <div className="px-8 py-4 flex items-center gap-3 border-b border-gray-100">
        <span className="font-bold text-gray-800" style={{ fontSize: 15 }}>CandyMovil</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500 text-sm">Panel de Relevamientos</span>
      </div>

      {/* Page header */}
      <div className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Relevamiento de Stock</h1>
        <p className="text-sm text-gray-400 mt-1">
          {ubicacion?.lineas.length || 0} SKUs · {totalRelevados} relevados
          {ubicacion?.fecha && ` · Último: ${new Date(ubicacion.fecha).toLocaleString("es-AR")} — Vendedor ${ubicacion.operario}`}
        </p>
      </div>

      {/* Tabs ubicaciones */}
      <div style={{ display: "flex", padding: "16px 32px 0", borderBottom: "2px solid #e5e7eb", gap: 4 }}>
        {datos.map((d, i) => (
          <button
            key={d.ubicacion_id}
            onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda(""); setSoloRelevados(false) }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px",
              fontSize: 14, fontWeight: 600,
              border: "none", borderBottom: tabActiva === i ? "3px solid #00ACC1" : "3px solid transparent",
              background: "none", cursor: "pointer", whiteSpace: "nowrap",
              color: tabActiva === i ? "#00ACC1" : "#6b7280",
              marginBottom: -2,
            }}
          >
            {d.ubicacion}
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: tabActiva === i ? "#e0f7fa" : "#f3f4f6",
              color: tabActiva === i ? "#00ACC1" : "#9ca3af",
              borderRadius: 999, padding: "2px 8px",
            }}>
              {d.lineas?.filter(l => l.relevado).length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-tabs categorías */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 32px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
        {["", ...categorias].map(c => (
          <button key={c || "__all__"}
            onClick={() => { setFiltroCat(c); setFiltroClasif("") }}
            style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: filtroCat === c ? "#00ACC1" : "white",
              color: filtroCat === c ? "white" : "#6b7280",
              boxShadow: filtroCat === c ? "none" : "0 0 0 1px #e5e7eb",
            }}
          >
            {c || "Ver todos"}
          </button>
        ))}
      </div>

      {/* Sub-tabs clasificaciones */}
      {filtroCat && clasificaciones.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 32px", borderBottom: "1px solid #f3f4f6", background: "white" }}>
          {["", ...clasificaciones].map(c => (
            <button key={c || "__all__"}
              onClick={() => setFiltroClasif(c)}
              style={{
                padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                cursor: "pointer",
                background: filtroClasif === c ? "#e0f7fa" : "white",
                color: filtroClasif === c ? "#00ACC1" : "#9ca3af",
                border: filtroClasif === c ? "2px solid #00ACC1" : "2px solid #e5e7eb",
              }}
            >
              {c || "Todas"}
            </button>
          ))}
        </div>
      )}

      {/* Search + count */}
      <div className="px-8 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar SKU, nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-teal-400 w-64"
            style={{ color: "#1a2332" }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoloRelevados(!soloRelevados)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2"
            style={soloRelevados
              ? { background: "#FFC107", color: "#1a2332", borderColor: "#FFC107" }
              : { background: "white", color: "#6b7280", borderColor: "#e5e7eb" }
            }
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: soloRelevados ? "#1a2332" : "#d1d5db", display: "inline-block" }}/>
            Solo relevados
          </button>
          <span className="text-sm text-gray-400 font-medium">{lineasFiltradas.length} productos</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "white", position: "sticky", top: 0, borderBottom: "2px solid #f3f4f6" }}>
            <tr>
              <th className="text-left px-8 py-3 font-bold text-xs uppercase tracking-wider" style={{ color: "#00ACC1" }}>SKU</th>
              <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider" style={{ color: "#00ACC1" }}>Nombre</th>
              <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider" style={{ color: "#00ACC1" }}>Categoría</th>
              <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider" style={{ color: "#00ACC1" }}>Clasificación</th>
              <th className="text-right px-8 py-3 font-bold text-xs uppercase tracking-wider" style={{ color: "#00ACC1" }}>Unidades</th>
            </tr>
          </thead>
          <tbody>
            {lineasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 text-sm text-gray-400">
                  {!ubicacion || ubicacion.lineas.length === 0 ? "No hay datos para esta ubicación" : "Sin resultados"}
                </td>
              </tr>
            ) : lineasFiltradas.map((l, i) => (
              <tr key={l.sku} className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                <td className="px-8 py-3 font-mono text-xs font-semibold" style={{ color: "#374151" }}>{l.sku}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{l.descripcion}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "#00ACC1" }}>{l.categoria}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{l.clasificacion}</td>
                <td className="px-8 py-3 text-right font-bold" style={{ color: l.relevado ? "#FFC107" : "#d1d5db", fontSize: l.relevado ? 16 : 14 }}>
                  {l.relevado ? l.cantidad : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: "#f9fafb", borderTop: "2px solid #e5e7eb", position: "sticky", bottom: 0 }}>
            <tr>
              <td colSpan={4} className="px-8 py-3 text-sm font-semibold text-gray-500">
                {lineasFiltradas.length} artículos · {lineasFiltradas.filter(l => l.relevado).length} relevados
              </td>
              <td className="px-8 py-3 text-right font-bold text-base" style={{ color: "#00ACC1" }}>
                {lineasFiltradas.filter(l => l.relevado).reduce((s, l) => s + l.cantidad, 0).toLocaleString("es-AR")} u.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
