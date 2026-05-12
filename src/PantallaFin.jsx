export default function PantallaFin({ onNuevo }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 text-center" style={{ background: "linear-gradient(160deg, #0f1623 0%, #1a2540 100%)" }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">¡Relevamiento finalizado!</h1>
      <p className="text-sm mb-10" style={{ color: "#64748b" }}>Los datos fueron guardados correctamente.</p>
      <button
        onClick={onNuevo}
        className="w-full max-w-sm py-4 rounded-2xl font-bold text-lg text-white"
        style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
      >
        Nuevo relevamiento
      </button>
    </div>
  )
}
