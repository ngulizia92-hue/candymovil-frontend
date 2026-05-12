import { useState, useRef } from "react"
import { buscarArticulo, agregarLinea, getLineas, finalizarRelevamiento } from "./api"

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
      setError("Error al buscar el artículo")
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
        if (existe) {
          return prev.map(l => l.sku === articulo.sku ? { ...l, cantidad: Number(cantidad) } : l)
        }
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
    if (!window.confirm("¿Finalizar el relevamiento? No podrás agregar más productos.")) return
    await finalizarRelevamiento(sesion.relevamientoId)
    onFinalizar()
  }

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-lg">Relevamiento</div>
          <div className="text-blue-100 text-sm">Vendedor {sesion.vendedor}</div>
        </div>
        <div className="text-right">
          <div className="text-blue-100 text-xs">Artículos cargados</div>
          <div className="font-bold text-2xl">{lineas.length}</div>
        </div>
      </div>

      {/* Buscar SKU */}
      <div className="bg-white px-5 py-5 shadow-sm">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
          SKU / Código
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ej: ABC123"
            value={sku}
            onChange={e => { setSku(e.target.value); setArticulo(null); setNoEncontrado(false) }}
            onKeyDown={e => e.key === "Enter" && handleBuscar()}
            className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-4 text-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors uppercase"
            autoCapitalize="characters"
            autoCorrect="off"
          />
          <button
            onClick={handleBuscar}
            disabled={buscando || !sku.trim()}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 rounded-2xl transition-colors disabled:opacity-40"
          >
            {buscando ? "..." : "Buscar"}
          </button>
        </div>

        {/* Artículo encontrado */}
        {articulo && (
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="text-xs text-blue-500 font-semibold uppercase mb-1">{articulo.sku}</div>
            <div className="font-semibold text-gray-900 text-base mb-4">{articulo.descripcion}</div>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              ¿Cuántas unidades?
            </label>
            <div className="flex gap-3">
              <input
                ref={cantidadRef}
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAgregar()}
                className="flex-1 border-2 border-blue-300 rounded-2xl px-4 py-3 text-2xl font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-center"
              />
              <button
                onClick={handleAgregar}
                disabled={guardando || !cantidad}
                className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold px-6 rounded-2xl transition-colors disabled:opacity-40"
              >
                {guardando ? "..." : "Agregar"}
              </button>
            </div>
          </div>
        )}

        {noEncontrado && (
          <div className="mt-3 text-center text-red-500 text-sm font-medium">
            No se encontró el SKU "{sku}"
          </div>
        )}

        {error && (
          <div className="mt-3 text-center text-red-500 text-sm">{error}</div>
        )}
      </div>

      {/* Lista de lo cargado */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-3 overflow-y-auto">
        {lineas.length === 0 && (
          <div className="text-center text-gray-400 mt-10 text-sm">
            Todavía no cargaste ningún artículo
          </div>
        )}
        {lineas.map((l, i) => (
          <div key={l.sku} className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 font-medium">{l.sku}</div>
              <div className="text-sm text-gray-800 font-medium leading-tight">{l.descripcion}</div>
            </div>
            <div className="text-xl font-bold text-blue-600 ml-4 shrink-0">{l.cantidad}</div>
          </div>
        ))}
      </div>

      {/* Botón finalizar */}
      {lineas.length > 0 && (
        <div className="px-5 py-4 bg-white border-t border-gray-100">
          <button
            onClick={handleFinalizar}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            Finalizar relevamiento
          </button>
        </div>
      )}
    </div>
  )
}
