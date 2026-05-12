import { useState, useEffect, useMemo } from "react"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function PantallaAdmin() {
  const [datos, setDatos] = useState([])
  const [tabActiva, setTabActiva] = useState(0)
  const [filtroCat, setFiltroCat] = useState("")
  const [filtroClasif, setFiltroClasif] = useState("")
  const [busqueda, setBusqueda] = useState("")
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
    return [...new Set(ubicacion.lineas.filter(l => !filtroCat || l.categoria === filtroCat).map(l => l.clasificacion).filter(Boolean))].sort()
  }, [ubicacion, filtroCat])

  const lineasFiltradas = useMemo(() => {
    if (!ubicacion) return []
    return ubicacion.lineas.filter(l => {
      if (filtroCat && l.categoria !== filtroCat) return false
      if (filtroClasif && l.clasificacion !== filtroClasif) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        if (!l.sku.toLowerCase().includes(q) && !l.descripcion.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [ubicacion, filtroCat, filtroClasif, busqueda])

  if (loading) return (
    <div className="min-h-svh flex items-center justify-center" style={{ background: "#f0f4f8" }}>
      <div className="text-sm font-medium" style={{ color: "#90a4ae" }}>Cargando...</div>
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#f0f4f8" }}>

      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "#00ACC1" }}>
        <p className="text-xs font-bold uppercase tracking-widest text-white opacity-70 mb-1">CandyMovil</p>
        <h1 className="text-2xl font-bold text-white">Panel de Relevamientos</h1>
        {ubicacion?.fecha && (
          <p className="text-xs mt-1" style={{ color: "#b2ebf2" }}>
            {new Date(ubicacion.fecha).toLocaleString("es-AR")} — Vendedor {ubicacion.operario}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto bg-white shadow-sm" style={{ borderBottom: "2px solid #e0f7fa" }}>
        <div className="flex px-2">
          {datos.map((d, i) => (
            <button
              key={d.ubicacion_id}
              onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda("") }}
              className="px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderColor: tabActiva === i ? "#00ACC1" : "transparent",
                color: tabActiva === i ? "#00ACC1" : "#90a4ae",
              }}
            >
              {d.ubicacion}
              {d.lineas.length > 0 && (
                <span className="ml-1 text-xs rounded-full px-2 py-0.5 font-bold" style={{ background: tabActiva === i ? "#e0f7fa" : "#f0f4f8", color: tabActiva === i ? "#00ACC1" : "#90a4ae" }}>
                  {d.lineas.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 py-3 bg-white flex flex-wrap gap-2" style={{ borderBottom: "1px solid #e0f7fa" }}>
        <input
          type="text" placeholder="Buscar SKU o producto..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium flex-1 min-w-40 focus:outline-none"
          style={{ background: "#f0f4f8", border: "2px solid #e0f7fa", color: "#1a2332" }}
          onFocus={e => e.target.style.borderColor = "#00ACC1"}
          onBlur={e => e.target.style.borderColor = "#e0f7fa"}
        />
        <select
          value={filtroCat} onChange={e => { setFiltroCat(e.target.value); setFiltroClasif("") }}
          className="rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
          style={{ background: "#f0f4f8", border: "2px solid #e0f7fa", color: filtroCat ? "#1a2332" : "#90a4ae" }}
        >
          <option value="">Categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filtroClasif} onChange={e => setFiltroClasif(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-medium focus:outline-none"
          style={{ background: "#f0f4f8", border: "2px solid #e0f7fa", color: filtroClasif ? "#1a2332" : "#90a4ae" }}
        >
          <option value="">Clasificación</option>
          {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto">
        {!ubicacion || lineasFiltradas.length === 0 ? (
          <div className="text-center mt-16 text-sm font-medium" style={{ color: "#b0bec5" }}>
            {!ubicacion || ubicacion.lineas.length === 0
              ? "No hay relevamiento cargado para esta ubicación"
              : "Sin resultados con estos filtros"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white" style={{ position: "sticky", top: 0, borderBottom: "2px solid #e0f7fa" }}>
              <tr>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style={{ color: "#90a4ae" }}>SKU</th>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide" style={{ color: "#90a4ae" }}>Descripción</th>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide hidden md:table-cell" style={{ color: "#90a4ae" }}>Categoría</th>
                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wide hidden md:table-cell" style={{ color: "#90a4ae" }}>Clasificación</th>
                <th className="text-right px-4 py-3 font-bold text-xs uppercase tracking-wide" style={{ color: "#90a4ae" }}>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {lineasFiltradas.map((l, i) => (
                <tr key={l.sku} className={i % 2 === 0 ? "bg-white" : ""} style={{ background: i % 2 !== 0 ? "#f0f4f8" : "white", borderBottom: "1px solid #e0f7fa" }}>
                  <td className="px-4 py-3 font-bold text-xs font-mono" style={{ color: "#00ACC1" }}>{l.sku}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "#1a2332" }}>{l.descripcion}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "#607d8b" }}>{l.categoria}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "#607d8b" }}>{l.clasificacion}</td>
                  <td className="px-4 py-3 text-right font-bold text-xl" style={{ color: "#FFC107" }}>{l.cantidad}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-white" style={{ position: "sticky", bottom: 0, borderTop: "2px solid #e0f7fa" }}>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm font-semibold" style={{ color: "#90a4ae" }}>
                  {lineasFiltradas.length} artículos
                </td>
                <td className="px-4 py-3 text-right font-bold text-lg" style={{ color: "#00ACC1" }}>
                  {lineasFiltradas.reduce((s, l) => s + l.cantidad, 0).toLocaleString("es-AR")}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
