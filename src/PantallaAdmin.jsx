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
    <div className="min-h-svh flex items-center justify-center text-gray-400">Cargando...</div>
  )

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-gray-900 text-white px-5 py-4">
        <div className="font-bold text-lg">Panel de Relevamientos</div>
        <div className="text-gray-400 text-sm">Último relevamiento por ubicación</div>
      </div>

      {/* Tabs ubicaciones */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex">
          {datos.map((d, i) => (
            <button
              key={d.ubicacion_id}
              onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda("") }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tabActiva === i
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {d.ubicacion}
              {d.lineas.length > 0 && (
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                  {d.lineas.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {ubicacion && (
        <>
          {/* Info relevamiento */}
          {ubicacion.fecha && (
            <div className="bg-blue-50 px-5 py-2 text-xs text-blue-700 flex gap-4">
              <span>Operario: <strong>{ubicacion.operario}</strong></span>
              <span>Fecha: <strong>{new Date(ubicacion.fecha).toLocaleString("es-AR")}</strong></span>
              <span className={`font-semibold ${ubicacion.estado === "finalizado" ? "text-green-700" : "text-orange-600"}`}>
                {ubicacion.estado}
              </span>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white px-4 py-3 flex flex-wrap gap-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Buscar SKU o descripción..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:border-blue-400"
            />
            <select
              value={filtroCat}
              onChange={e => { setFiltroCat(e.target.value); setFiltroClasif("") }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filtroClasif}
              onChange={e => setFiltroClasif(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
            >
              <option value="">Todas las clasificaciones</option>
              {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tabla */}
          <div className="flex-1 overflow-auto">
            {lineasFiltradas.length === 0 ? (
              <div className="text-center text-gray-400 mt-16 text-sm">
                {ubicacion.lineas.length === 0
                  ? "No hay relevamiento cargado para esta ubicación"
                  : "No hay resultados con estos filtros"}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">SKU</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Descripción</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Categoría</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Clasificación</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Unidades</th>
                  </tr>
                </thead>
                <tbody>
                  {lineasFiltradas.map((l, i) => (
                    <tr key={l.sku} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 text-gray-500 font-mono text-xs">{l.sku}</td>
                      <td className="px-4 py-2 text-gray-800">{l.descripcion}</td>
                      <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">{l.categoria}</td>
                      <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">{l.clasificacion}</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-600">{l.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 sticky bottom-0">
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-sm text-gray-500">
                      {lineasFiltradas.length} artículos
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-gray-800">
                      {lineasFiltradas.reduce((s, l) => s + l.cantidad, 0).toLocaleString("es-AR")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
