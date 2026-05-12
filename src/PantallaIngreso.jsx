import { useState, useEffect } from "react"
import { getUbicaciones, crearRelevamiento } from "./api"

export default function PantallaIngreso({ onIngresar }) {
  const [vendedor, setVendedor] = useState("")
  const [ubicaciones, setUbicaciones] = useState([])
  const [ubicacionId, setUbicacionId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getUbicaciones().then(setUbicaciones).catch(() => {})
  }, [])

  async function handleIngresar() {
    if (!vendedor.trim()) { setError("Ingresá tu número de vendedor"); return }
    if (!ubicacionId) { setError("Seleccioná una ubicación"); return }
    setLoading(true)
    setError("")
    try {
      const r = await crearRelevamiento(Number(ubicacionId), vendedor.trim())
      onIngresar({ vendedor: vendedor.trim(), ubicacionId, relevamientoId: r.id })
    } catch {
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-10" style={{ background: "linear-gradient(160deg, #0f1623 0%, #1a2540 100%)" }}>

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">CandyMovil</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Relevamiento de stock</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5" style={{ background: "#1a2332", border: "1px solid #243044" }}>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Número de vendedor</p>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Ej: 12"
            value={vendedor}
            onChange={e => setVendedor(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleIngresar()}
            className="w-full rounded-xl px-4 py-4 text-xl font-bold text-white focus:outline-none transition-all"
            style={{ background: "#0f1623", border: "2px solid #243044" }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#243044"}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#64748b" }}>Ubicación</p>
          <select
            value={ubicacionId}
            onChange={e => setUbicacionId(e.target.value)}
            className="w-full rounded-xl px-4 py-4 text-base font-medium text-white focus:outline-none transition-all appearance-none"
            style={{ background: "#0f1623", border: "2px solid #243044", color: ubicacionId ? "#f1f5f9" : "#64748b" }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#243044"}
          >
            <option value="">Seleccioná una ubicación</option>
            {ubicaciones.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>}

        <button
          onClick={handleIngresar}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
        >
          {loading ? "Ingresando..." : "Ingresar →"}
        </button>
      </div>
    </div>
  )
}
