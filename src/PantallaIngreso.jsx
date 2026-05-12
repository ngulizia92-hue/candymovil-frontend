import { useState, useEffect } from "react"
import { getUbicaciones, crearRelevamiento } from "./api"

export default function PantallaIngreso({ onIngresar }) {
  const [vendedor, setVendedor] = useState("")
  const [ubicaciones, setUbicaciones] = useState([])
  const [ubicacionId, setUbicacionId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { getUbicaciones().then(setUbicaciones).catch(() => {}) }, [])

  async function handleIngresar() {
    if (!vendedor.trim()) { setError("Ingresá tu número de vendedor"); return }
    if (!ubicacionId) { setError("Seleccioná una ubicación"); return }
    setLoading(true); setError("")
    try {
      const r = await crearRelevamiento(Number(ubicacionId), vendedor.trim())
      onIngresar({ vendedor: vendedor.trim(), ubicacionId, relevamientoId: r.id })
    } catch { setError("Error al conectar con el servidor") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#00ACC1" }}>

      {/* Top */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00ACC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">CandyMovil</h1>
        <p className="text-sm" style={{ color: "#b2ebf2" }}>Relevamiento de stock</p>
      </div>

      {/* Card inferior */}
      <div className="rounded-t-3xl px-6 pt-8 pb-10 flex flex-col gap-5" style={{ background: "#f0f4f8" }}>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00ACC1" }}>Número de vendedor</label>
          <input
            type="number" inputMode="numeric" placeholder="Ej: 12"
            value={vendedor}
            onChange={e => setVendedor(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleIngresar()}
            className="w-full rounded-2xl px-4 py-4 text-xl font-bold bg-white focus:outline-none shadow-sm"
            style={{ border: "2px solid #e0f7fa", color: "#1a2332" }}
            onFocus={e => e.target.style.borderColor = "#00ACC1"}
            onBlur={e => e.target.style.borderColor = "#e0f7fa"}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00ACC1" }}>Ubicación</label>
          <select
            value={ubicacionId}
            onChange={e => setUbicacionId(e.target.value)}
            className="w-full rounded-2xl px-4 py-4 text-base font-semibold bg-white focus:outline-none shadow-sm appearance-none"
            style={{ border: "2px solid #e0f7fa", color: ubicacionId ? "#1a2332" : "#90a4ae" }}
            onFocus={e => e.target.style.borderColor = "#00ACC1"}
            onBlur={e => e.target.style.borderColor = "#e0f7fa"}
          >
            <option value="">Seleccioná una ubicación</option>
            {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
        </div>

        {error && <p className="text-sm text-center font-medium" style={{ color: "#e53935" }}>{error}</p>}

        <button
          onClick={handleIngresar} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all disabled:opacity-50"
          style={{ background: "#FFC107", color: "#1a2332" }}
        >
          {loading ? "Ingresando..." : "INGRESAR"}
        </button>
      </div>
    </div>
  )
}
