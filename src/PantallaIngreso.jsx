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
    if (!vendedor.trim()) {
      setError("Ingresá tu número de vendedor")
      return
    }
    if (!ubicacionId) {
      setError("Seleccioná una ubicación")
      return
    }
    setLoading(true)
    setError("")
    try {
      const relevamiento = await crearRelevamiento(Number(ubicacionId), vendedor.trim())
      onIngresar({ vendedor: vendedor.trim(), ubicacionId, relevamientoId: relevamiento.id })
    } catch {
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-white flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Logo / título */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-1">👋 ¡Hola!</div>
          <p className="text-gray-500 text-base">Ingresá tus datos para comenzar</p>
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Número de vendedor
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Ej: 12"
              value={vendedor}
              onChange={e => setVendedor(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleIngresar()}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Ubicación
            </label>
            <select
              value={ubicacionId}
              onChange={e => setUbicacionId(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Seleccioná una ubicación</option>
              {ubicaciones.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleIngresar}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg py-4 rounded-2xl transition-colors disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </div>
    </div>
  )
}
