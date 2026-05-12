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
    const base = ubicacion.lineas.filter(l => !filtroCat || l.categoria === filtroCat)
    return [...new Set(base.map(l => l.clasificacion).filter(Boolean))].sort()
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
    <div className="min-h-svh flex items-center justify-center" style={{ background: "#0f1623" }}>
      <div className="text-sm" style={{ color: "#64748b" }}>Cargando...</div>
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#0f1623" }}>

      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "linear-gradient(160deg, #1a2540 0%, #0f1623 100%)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#3b82f6" }}>CandyMovil</p>
        <h1 className="text-2xl font-bold text-white">Panel de Relevamientos</h1>
        {ubicacion?.fecha && (
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Último: {new Date(ubicacion.fecha).toLocaleString("es-AR")} — {ubicacion.operario}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto" style={{ background: "#1a2332", borderBottom: "1px solid #243044" }}>
        <div className="flex px-2">
          {datos.map((d, i) => (
            <button
              key={d.ubicacion_id}
              onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda("") }}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
              style={{
                borderColor: tabActiva === i ? "#3b82f6" : "transparent",
                color: tabActiva === i ? "#3b82f6" : "#64748b",
              }}
            >
              {d.ubicacion}
              {d.lineas.length > 0 && (
                <span className="ml-2 text-xs rounded-full px-2 py-0.5" style={{ background: tabActiva === i ? "#1e3a5f" : "#243044", color: tabActiva === i ? "#3b82f6" : "#64748b" }}>
                  {d.lineas.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 py-3 flex flex-wrap gap-2" style={{ background: "#1a2332", borderBottom: "1px solid #243044" }}>
        <input
          type="text"
          placeholder="Buscar SKU o producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm text-white focus:outline-none flex-1 min-w-40"
          style={{ background: "#0f1623", border: "1px solid #243044" }}
        />
        <select
          value={filtroCat}
          onChange={e => { setFiltroCat(e.target.value); setFiltroClasif("") }}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={{ background: "#0f1623", border: "1px solid #243044", color: filtroCat ? "#f1f5f9" : "#64748b" }}
        >
          <option value="">Categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filtroClasif}
          onChange={e => setFiltroClasif(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm focus:outline-none"
          style={{ background: "#0f1623", border: "1px solid #243044", color: filtroClasif ? "#f1f5f9" : "#64748b" }}
        >
          <option value="">Clasificación</option>
          {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto">
        {!ubicacion || lineasFiltradas.length === 0 ? (
          <div className="text-center mt-16 text-sm" style={{ color: "#334155" }}>
            {!ubicacion || ubicacion.lineas.length === 0
              ? "No hay relevamiento cargado para esta ubicación"
              : "No hay resultados con estos filtros"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "#1a2332", position: "sticky", top: 0 }}>
              <tr>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "#64748b" }}>SKU</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "#64748b" }}>Descripción</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: "#64748b" }}>Categoría</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: "#64748b" }}>Clasificación</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: "#64748b" }}>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {lineasFiltradas.map((l, i) => (
                <tr key={l.sku} style={{ background: i % 2 === 0 ? "#0f1623" : "#131c2e", borderBottom: "1px solid #1a2332" }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#3b82f6" }}>{l.sku}</td>
                  <td className="px-4 py-3 font-medium text-white">{l.descripcion}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "#64748b" }}>{l.categoria}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "#64748b" }}>{l.clasificacion}</td>
                  <td className="px-4 py-3 text-right font-bold text-xl" style={{ color: "#f59e0b" }}>{l.cantidad}</td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: "#1a2332", position: "sticky", bottom: 0 }}>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm" style={{ color: "#64748b" }}>
                  {lineasFiltradas.length} artículos
                </td>
                <td className="px-4 py-3 text-right font-bold text-white">
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
