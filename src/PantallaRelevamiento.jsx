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
    setBuscando(true); setError(""); setNoEncontrado(false); setArticulo(null); setCantidad("")
    try {
      const art = await buscarArticulo(sku.trim())
      if (art) { setArticulo(art); setTimeout(() => cantidadRef.current?.focus(), 100) }
      else setNoEncontrado(true)
    } catch { setError("Error al buscar") }
    finally { setBuscando(false) }
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
      setSku(""); setArticulo(null); setCantidad(""); setNoEncontrado(false)
    } catch { setError("Error al guardar") }
    finally { setGuardando(false) }
  }

  async function handleFinalizar() {
    if (!window.confirm("¿Finalizar el relevamiento?")) return
    await finalizarRelevamiento(sesion.relevamientoId)
    onFinalizar()
  }

  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#f0f4f8" }}>

      {/* Header */}
      <div className="px-5 pt-8 pb-5" style={{ background: "#00ACC1" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white opacity-70">CandyMovil</p>
            <h1 className="text-2xl font-bold text-white">Relevamiento</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-white opacity-70">Vendedor</div>
            <div className="text-2xl font-bold" style={{ color: "#FFC107" }}>{sesion.vendedor}</div>
          </div>
        </div>

        {/* Contador */}
        <div className="mt-4 rounded-2xl px-5 py-3 flex items-center justify-between bg-white bg-opacity-20">
          <span className="text-sm text-white font-medium">Artículos cargados</span>
          <span className="text-3xl font-bold text-white">{lineas.length}</span>
        </div>
      </div>

      {/* Buscador */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00ACC1" }}>SKU / Código</label>
        <div className="flex gap-2">
          <input
            type="text" placeholder="Ej: ABC123"
            value={sku}
            onChange={e => { setSku(e.target.value.toUpperCase()); setArticulo(null); setNoEncontrado(false) }}
            onKeyDown={e => e.key === "Enter" && handleBuscar()}
            className="flex-1 rounded-2xl px-4 py-4 text-lg font-bold bg-white focus:outline-none shadow-sm uppercase"
            style={{ border: "2px solid #e0f7fa", color: "#1a2332" }}
            onFocus={e => e.target.style.borderColor = "#00ACC1"}
            onBlur={e => e.target.style.borderColor = "#e0f7fa"}
            autoCapitalize="characters" autoCorrect="off"
          />
          <button
            onClick={handleBuscar} disabled={buscando || !sku.trim()}
            className="px-6 rounded-2xl font-bold text-white shadow-sm disabled:opacity-40"
            style={{ background: "#00ACC1" }}
          >
            {buscando ? "..." : "Buscar"}
          </button>
        </div>

        {/* Artículo encontrado */}
        {articulo && (
          <div className="rounded-2xl p-4 bg-white shadow-sm" style={{ border: "2px solid #00ACC1" }}>
            <div className="text-xs font-bold mb-1" style={{ color: "#00ACC1" }}>{articulo.sku}</div>
            <div className="font-bold text-base mb-4" style={{ color: "#1a2332" }}>{articulo.descripcion}</div>
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00ACC1" }}>¿Cuántas unidades?</label>
            <div className="flex gap-2 mt-2">
              <input
                ref={cantidadRef} type="number" inputMode="decimal" placeholder="0"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAgregar()}
                className="flex-1 rounded-2xl px-4 py-3 text-4xl font-bold text-center focus:outline-none"
                style={{ border: "2px solid #00ACC1", color: "#1a2332", background: "#e0f7fa" }}
              />
              <button
                onClick={handleAgregar} disabled={guardando || !cantidad}
                className="px-6 rounded-2xl font-bold text-lg disabled:opacity-40 shadow-sm"
                style={{ background: "#FFC107", color: "#1a2332" }}
              >
                {guardando ? "..." : "✓"}
              </button>
            </div>
          </div>
        )}

        {noEncontrado && (
          <div className="text-center text-sm font-medium py-3 rounded-2xl bg-white" style={{ color: "#e53935" }}>
            No se encontró el SKU "{sku}"
          </div>
        )}
        {error && <div className="text-center text-sm font-medium" style={{ color: "#e53935" }}>{error}</div>}
      </div>

      {/* Lista */}
      <div className="flex-1 px-5 pb-28 flex flex-col gap-2">
        {lineas.length === 0 ? (
          <div className="text-center mt-8 text-sm font-medium" style={{ color: "#b0bec5" }}>
            Todavía no cargaste ningún artículo
          </div>
        ) : lineas.map(l => (
          <div key={l.sku} className="rounded-2xl px-4 py-3 bg-white shadow-sm flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: "#00ACC1" }}>{l.sku}</div>
              <div className="text-sm font-semibold truncate" style={{ color: "#1a2332" }}>{l.descripcion}</div>
            </div>
            <div className="text-2xl font-bold ml-4 shrink-0" style={{ color: "#FFC107" }}>{l.cantidad}</div>
          </div>
        ))}
      </div>

      {/* Finalizar */}
      {lineas.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-white" style={{ borderTop: "1px solid #e0f7fa" }}>
          <button
            onClick={handleFinalizar}
            className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg"
            style={{ background: "#00ACC1", color: "white" }}
          >
            Finalizar relevamiento
          </button>
        </div>
      )}
    </div>
  )
}
