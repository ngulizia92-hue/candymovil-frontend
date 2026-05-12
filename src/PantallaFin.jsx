export default function PantallaFin({ onNuevo }) {
  return (
    <div className="min-h-svh bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">¡Relevamiento finalizado!</h1>
      <p className="text-gray-500 mb-10">Los datos fueron guardados correctamente.</p>
      <button
        onClick={onNuevo}
        className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
      >
        Nuevo relevamiento
      </button>
    </div>
  )
}
