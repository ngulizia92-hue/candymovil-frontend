import { useState, useRef } from "react"
import { buscarArticulo, agregarStockLog } from "./api"

export default function PantallaRelevamiento({ sesion, onVolver }) {
  const [sku, setSku] = useState("")
  const [articulo, setArticulo] = useState(null)
  const [cantidad, setCantidad] = useState("")
  const [entradas, setEntradas] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [confirmacion, setConfirmacion] = useState(null)
  const cantidadRef = useRef(null)
  const skuRef = useRef(null)

  async function handleBuscar() {
    if (!sku.trim()) return
    setBuscando(true); setError(""); setNoEncontrado(false); setArticulo(null); setCantidad(""); setConfirmacion(null)
    try {
      const art = await buscarArticulo(sku.trim())
      if (art) { setArticulo(art); setTimeout(() => cantidadRef.current?.focus(), 100) }
      else setNoEncontrado(true)
    } catch { setError("Error al buscar") }
    finally { setBuscando(false) }
  }

  async function handleAgregar() {
    if (!articulo || !cantidad) return
    setGuardando(true); setError("")
    try {
      const entry = await agregarStockLog(sesion.ubicacion_id, articulo.sku, Number(cantidad), sesion.vendedor)
      setEntradas(prev => [entry, ...prev])
      setConfirmacion({ sku: articulo.sku, descripcion: articulo.descripcion, cantidad: Number(cantidad) })
      setSku(""); setArticulo(null); setCantidad(""); setNoEncontrado(false)
      setTimeout(() => skuRef.current?.focus(), 100)
    } catch { setError("Error al guardar") }
    finally { setGuardando(false) }
  }

  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#f0f4f8" }}>

      {/* Header */}
      <div className="px-5 pt-8 pb-5" style={{ background: "#00ACC1" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white opacity-70">CandyMovil</p>
            <h1 className="text-2xl font-bold text-white">{sesion.ubicacion}</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-white opacity-70">Vendedor</div>
            <div className="text-2xl font-bold" style={{ color: "#FFC107" }}>{sesion.vendedor}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl px-5 py-3 flex items-center justify-between bg-white bg-opacity-20">
          <span className="text-sm text-white font-medium">Artículos cargados hoy</span>
          <span className="text-3xl font-bold text-white">{entradas.length}</span>
        </div>
      </div>

      {/* Buscador */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00ACC1" }}>SKU / Código</label>
        <div className="flex gap-2">
          <input
            ref={skuRef}
            type="text" placeholder="Ej: ABC123"
            value={sku}
            onChange={e => { setSku(e.target.value.toUpperCase()); setArticulo(null); setNoEncontrado(false); setConfirmacion(null) }}
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

        {/* Confirmación */}
        {confirmacion && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "#e8f5e9", border: "2px solid #66bb6a" }}>
            <span style={{ fontSize: 22 }}>✓</span>
            <div>
              <div className="text-xs font-bold" style={{ color: "#388e3c" }}>{confirmacion.sku}</div>
              <div className="text-sm font-semibold" style={{ color: "#1a2332" }}>{confirmacion.descripcion}</div>
              <div className="text-xs" style={{ color: "#388e3c" }}>{confirmacion.cantidad} unidades guardadas</div>
            </div>
          </div>
        )}

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

      {/* Lista de entradas de esta sesión */}
      <div className="flex-1 px-5 pb-8 flex flex-col gap-2">
        {entradas.length === 0 ? (
          <div className="text-center mt-8 text-sm font-medium" style={{ color: "#b0bec5" }}>
            Todavía no cargaste ningún artículo
          </div>
        ) : entradas.map((e, i) => (
          <div key={e.id ?? i} className="rounded-2xl px-4 py-3 bg-white shadow-sm flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: "#00ACC1" }}>{e.sku}</div>
              <div className="text-sm font-semibold truncate" style={{ color: "#1a2332" }}>{e.descripcion}</div>
            </div>
            <div className="text-2xl font-bold ml-4 shrink-0" style={{ color: "#FFC107" }}>{e.cantidad}</div>
          </div>
        ))}
      </div>

      {/* Volver */}
      <div className="px-5 py-4 bg-white" style={{ borderTop: "1px solid #e0f7fa" }}>
        <button
          onClick={onVolver}
          className="w-full py-3 rounded-2xl font-bold text-sm"
          style={{ background: "#f0f4f8", color: "#607d8b", border: "1px solid #cfd8dc" }}
        >
          Cambiar ubicación / vendedor
        </button>
      </div>
    </div>
  )
}
