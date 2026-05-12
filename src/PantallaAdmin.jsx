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
    <div className="min-h-svh flex items-center justify-center" style={{ background: "#f0f4f8" }}>
      <div className="text-base font-medium" style={{ color: "#90a4ae" }}>Cargando relevamientos...</div>
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#f0f4f8" }}>

      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between" style={{ background: "#00ACC1" }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white opacity-70 mb-1">CandyMovil</p>
          <h1 className="text-3xl font-bold text-white">Panel de Relevamientos</h1>
        </div>
        {ubicacion?.fecha && (
          <div className="text-right bg-white bg-opacity-20 rounded-2xl px-5 py-3">
            <div className="text-xs text-white opacity-70 mb-1">Último relevamiento</div>
            <div className="text-white font-bold">{new Date(ubicacion.fecha).toLocaleString("es-AR")}</div>
            <div className="text-sm" style={{ color: "#b2ebf2" }}>Vendedor {ubicacion.operario}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-8 pt-6 flex gap-3 flex-wrap" style={{ background: "#f0f4f8" }}>
        {datos.map((d, i) => (
          <button
            key={d.ubicacion_id}
            onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda(""); setSoloRelevados(false) }}
            className="px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm"
            style={tabActiva === i
              ? { background: "#00ACC1", color: "white", boxShadow: "0 4px 12px rgba(0,172,193,0.4)" }
              : { background: "white", color: "#607d8b", border: "2px solid #e0f7fa" }
            }
          >
            {d.nombre || d.ubicacion}
            <span className="ml-2 text-xs rounded-full px-2 py-0.5 font-bold"
              style={{ background: tabActiva === i ? "rgba(255,255,255,0.25)" : "#f0f4f8", color: tabActiva === i ? "white" : "#90a4ae" }}>
              {d.lineas?.filter(l => l.relevado).length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Stats + Filtros */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-4">

        {/* Stats */}
        <div className="flex gap-3">
          <div className="rounded-2xl px-5 py-3 bg-white shadow-sm text-center" style={{ minWidth: 110 }}>
            <div className="text-2xl font-bold" style={{ color: "#00ACC1" }}>{ubicacion?.lineas.length || 0}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: "#90a4ae" }}>Total SKUs</div>
          </div>
          <div className="rounded-2xl px-5 py-3 bg-white shadow-sm text-center" style={{ minWidth: 110 }}>
            <div className="text-2xl font-bold" style={{ color: "#FFC107" }}>{totalRelevados}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: "#90a4ae" }}>Relevados</div>
          </div>
          <div className="rounded-2xl px-5 py-3 bg-white shadow-sm text-center" style={{ minWidth: 110 }}>
            <div className="text-2xl font-bold" style={{ color: "#607d8b" }}>{(ubicacion?.lineas.length || 0) - totalRelevados}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: "#90a4ae" }}>Sin relevar</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 flex-1">
          <input
            type="text" placeholder="Buscar SKU o descripción..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
            style={{ background: "white", border: "2px solid #e0f7fa", color: "#1a2332", minWidth: 220 }}
            onFocus={e => e.target.style.borderColor = "#00ACC1"}
            onBlur={e => e.target.style.borderColor = "#e0f7fa"}
          />
          <select
            value={filtroCat} onChange={e => { setFiltroCat(e.target.value); setFiltroClasif("") }}
            className="rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
            style={{ background: "white", border: "2px solid #e0f7fa", color: filtroCat ? "#1a2332" : "#90a4ae" }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filtroClasif} onChange={e => setFiltroClasif(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
            style={{ background: "white", border: "2px solid #e0f7fa", color: filtroClasif ? "#1a2332" : "#90a4ae" }}
          >
            <option value="">Todas las clasificaciones</option>
            {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setSoloRelevados(!soloRelevados)}
            className="rounded-xl px-4 py-3 text-sm font-bold transition-all"
            style={soloRelevados
              ? { background: "#FFC107", color: "#1a2332", border: "2px solid #FFC107" }
              : { background: "white", color: "#90a4ae", border: "2px solid #e0f7fa" }
            }
          >
            Solo relevados
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="px-8 pb-8 flex-1">
        <div className="rounded-2xl overflow-hidden shadow-sm bg-white" style={{ border: "1px solid #e0f7fa" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "#e0f7fa" }}>
              <tr>
                <th className="text-left px-5 py-4 font-bold text-xs uppercase tracking-wide" style={{ color: "#00838f" }}>SKU</th>
                <th className="text-left px-5 py-4 font-bold text-xs uppercase tracking-wide" style={{ color: "#00838f" }}>Descripción</th>
                <th className="text-left px-5 py-4 font-bold text-xs uppercase tracking-wide" style={{ color: "#00838f" }}>Categoría</th>
                <th className="text-left px-5 py-4 font-bold text-xs uppercase tracking-wide" style={{ color: "#00838f" }}>Clasificación</th>
                <th className="text-right px-5 py-4 font-bold text-xs uppercase tracking-wide" style={{ color: "#00838f" }}>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {lineasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-sm font-medium" style={{ color: "#b0bec5" }}>
                    {!ubicacion || ubicacion.lineas.length === 0 ? "No hay datos para esta ubicación" : "Sin resultados"}
                  </td>
                </tr>
              ) : lineasFiltradas.map((l, i) => (
                <tr key={l.sku}
                  style={{ background: i % 2 === 0 ? "white" : "#f8fbfc", borderBottom: "1px solid #e0f7fa" }}>
                  <td className="px-5 py-3 font-mono font-bold text-xs" style={{ color: "#00ACC1" }}>{l.sku}</td>
                  <td className="px-5 py-3 font-semibold" style={{ color: "#1a2332" }}>{l.descripcion}</td>
                  <td className="px-5 py-3" style={{ color: "#607d8b" }}>{l.categoria}</td>
                  <td className="px-5 py-3" style={{ color: "#607d8b" }}>{l.clasificacion}</td>
                  <td className="px-5 py-3 text-right">
                    {l.relevado
                      ? <span className="text-xl font-bold" style={{ color: "#FFC107" }}>{l.cantidad}</span>
                      : <span className="text-sm font-medium" style={{ color: "#cfd8dc" }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: "#e0f7fa", borderTop: "2px solid #b2ebf2" }}>
              <tr>
                <td colSpan={4} className="px-5 py-3 text-sm font-bold" style={{ color: "#00838f" }}>
                  {lineasFiltradas.length} artículos · {lineasFiltradas.filter(l => l.relevado).length} relevados
                </td>
                <td className="px-5 py-3 text-right font-bold text-lg" style={{ color: "#00ACC1" }}>
                  {lineasFiltradas.filter(l => l.relevado).reduce((s, l) => s + l.cantidad, 0).toLocaleString("es-AR")} u.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
