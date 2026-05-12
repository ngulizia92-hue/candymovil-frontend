export default function PantallaFin({ onNuevo }) {
  return (
    <div className="min-h-svh flex flex-col" style={{ background: "#00ACC1" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-lg">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00ACC1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">¡Listo!</h1>
        <p className="text-base" style={{ color: "#b2ebf2" }}>Relevamiento finalizado correctamente</p>
      </div>
      <div className="rounded-t-3xl px-6 pt-8 pb-10" style={{ background: "#f0f4f8" }}>
        <button
          onClick={onNuevo}
          className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg"
          style={{ background: "#FFC107", color: "#1a2332" }}
        >
          NUEVO RELEVAMIENTO
        </button>
      </div>
    </div>
  )
}
