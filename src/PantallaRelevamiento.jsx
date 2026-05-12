import { useState, useRef } from "react"
import { buscarArticulo, agregarLinea, finalizarRelevamiento } from "./api"

export default function PantallaRelevamiento({ sesion, onFinalizar }) {
  const [sku, setSku] = useState("")
  const [articulo, setArticulo] = useState(null)
  const [cantidad, setCantidad] = useState("")
  const [lineas, setLineas] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const [noEncontrado, setNoEncontrado] = useState(false)
  const cantidadRef = useRef(null)

  async function handleBuscar() {
    if (!sku.trim()) return
    setBuscando(true)
    setError("")
    setNoEncontrado(false)
    setArticulo(null)
    setCantidad("")
    try {
      const art = await buscarArticulo(sku.trim())
      if (art) {
        setArticulo(art)
        setTimeout(() => cantidadRef.current?.focus(), 100)
      } else {
        setNoEncontrado(true)
      }
    } catch {
      setError("Error al buscar")
    } finally {
      setBuscando(false)
    }
  }

  async function handleAgregar() {
    if (!articulo || !cantidad) return
    setGuardando(true)
    try {
      await agregarLinea(sesion.relevamientoId, articulo.sku, Number(cantidad))
      setLineas(prev => {
        const existe = prev.find(l => l.sku === articulo.sku)
        if (existe) return prev.map(l => l.sku === articulo.sku ? { ...l, cantidad: Number(cantidad) } : l)
        return [{ sku: articulo.sku, descripcion: articulo.descripcion, cantidad: Number(cantidad) }, ...prev]
      })
      setSku("")
      setArticulo(null)
      setCantidad("")
      setNoEncontrado(false)
    } catch {
      setError("Error al guardar")
    } finally {
      setGuardando(false)
    }
  }

  async function handleFinalizar() {
    if (!window.confirm("¿Finalizar el relevamiento?")) return
    await finalizarRelevamiento(sesion.relevamientoId)
    onFinalizar()
  }

  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#0f1623" }}>

      {/* Header */}
      <div className="px-5 pt-8 pb-5" style={{ background: "linear-gradient(160deg, #1a2540 0%, #0f1623 100%)" }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#3b82f6" }}>CandyMovil</p>
            <h1 className="text-2xl font-bold text-white">Relevamiento</h1>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: "#64748b" }}>Vendedor</div>
            <div className="text-xl font-bold" style={{ color: "#f59e0b" }}>{sesion.vendedor}</div>
          </div>
        </div>

        {/* Contador */}
        <div className="mt-4 rounded-2xl px-5 py-3 flex items-center justify-between" style={{ background: "#1a2332", border: "1px solid #243044" }}>
          <span className="text-sm" style={{ color: "#64748b" }}>Artículos cargados</span>
          <span className="text-2xl font-bold text-white">{lineas.length}</span>
        </div>
      </div>

      {/* Buscador */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>SKU / Código</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: ABC123"
            value={sku}
            onChange={e => { setSku(e.target.value.toUpperCase()); setArticulo(null); setNoEncontrado(false) }}
            onKeyDown={e => e.key === "Enter" && handleBuscar()}
            className="flex-1 rounded-xl px-4 py-4 text-lg font-bold text-white focus:outline-none uppercase"
            style={{ background: "#1a2332", border: "2px solid #243044" }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#243044"}
            autoCapitalize="characters"
            autoCorrect="off"
          />
          <button
            onClick={handleBuscar}
            disabled={buscando || !sku.trim()}
            className="px-5 rounded-xl font-bold text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
          >
            {buscando ? "..." : "Buscar"}
          </button>
        </div>

        {/* Artículo encontrado */}
        {articulo && (
          <div className="mt-3 rounded-2xl p-4" style={{ background: "#1a2332", border: "2px solid #3b82f6" }}>
            <div className="text-xs font-semibold mb-1" style={{ color: "#3b82f6" }}>{articulo.sku}</div>
            <div className="font-semibold text-white mb-4">{articulo.descripcion}</div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>¿Cuántas unidades?</p>
            <div className="flex gap-2">
              <input
                ref={cantidadRef}
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAgregar()}
                className="flex-1 rounded-xl px-4 py-3 text-3xl font-bold text-white text-center focus:outline-none"
                style={{ background: "#0f1623", border: "2px solid #3b82f6" }}
              />
              <button
                onClick={handleAgregar}
                disabled={guardando || !cantidad}
                className="px-5 rounded-xl font-bold text-white transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                {guardando ? "..." : "✓"}
              </button>
            </div>
          </div>
        )}

        {noEncontrado && (
          <div className="mt-3 text-center text-sm py-2 rounded-xl" style={{ color: "#f87171", background: "#1a2332" }}>
            No se encontró el SKU "{sku}"
          </div>
        )}
        {error && <div className="mt-2 text-center text-sm" style={{ color: "#f87171" }}>{error}</div>}
      </div>

      {/* Lista */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-2 overflow-y-auto">
        {lineas.length === 0 ? (
          <div className="text-center mt-10 text-sm" style={{ color: "#334155" }}>
            Todavía no cargaste ningún artículo
          </div>
        ) : (
          lineas.map(l => (
            <div key={l.sku} className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: "#1a2332", border: "1px solid #243044" }}>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono" style={{ color: "#3b82f6" }}>{l.sku}</div>
                <div className="text-sm font-medium text-white truncate">{l.descripcion}</div>
              </div>
              <div className="text-2xl font-bold ml-4 shrink-0" style={{ color: "#f59e0b" }}>{l.cantidad}</div>
            </div>
          ))
        )}
      </div>

      {/* Botón finalizar fijo abajo */}
      {lineas.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4" style={{ background: "#0f1623", borderTop: "1px solid #243044" }}>
          <button
            onClick={handleFinalizar}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            Finalizar relevamiento
          </button>
        </div>
      )}
    </div>
  )
}
