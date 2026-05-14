import { useState, useEffect } from "react"
import { T } from "./theme"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const IcUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>
  </svg>
)
const IcDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/>
  </svg>
)

export default function PantallaIngreso({ onIngresar }) {
  const [vendedor, setVendedor] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [yaInstalada, setYaInstalada] = useState(false)

  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const esSafari = /safari/i.test(navigator.userAgent) && !/chrome|chromium|crios/i.test(navigator.userAgent)
  const [mostrarGuiaIOS, setMostrarGuiaIOS] = useState(false)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener("beforeinstallprompt", handler)
    if (window.matchMedia("(display-mode: standalone)").matches) setYaInstalada(true)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function handleInstalar() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") {
      setInstallPrompt(null)
      setYaInstalada(true)
    }
  }

  function loginConCache(numeroIngresado, pinIngresado) {
    const cached = JSON.parse(localStorage.getItem("cm_cache") || "null")
    if (cached && cached.numero === numeroIngresado && cached.pin === pinIngresado) {
      onIngresar({ vendedor: cached.numero, nombre: cached.nombre })
      return true
    }
    return false
  }

  // DEBUG: info visible en pantalla
  const cacheDebug = (() => {
    try {
      const c = JSON.parse(localStorage.getItem("cm_cache") || "null")
      if (!c) return "cache: vacío"
      return `cache: nro="${c.numero}" (${typeof c.numero}) nombre="${c.nombre}"`
    } catch { return "cache: error al leer" }
  })()

  async function handleIngresar() {
    if (!vendedor.trim() || !pin.trim()) { setError("Ingresá tu número y PIN"); return }

    // Sin red → intentar con credenciales cacheadas del último login
    if (!navigator.onLine) {
      if (!loginConCache(vendedor.trim(), pin.trim())) {
        setError(`Sin conexión — ${cacheDebug}`)
      }
      return
    }

    setCargando(true); setError("")
    try {
      const r = await fetch(`${API}/vendedores/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: vendedor.trim(), pin: pin.trim() }),
      })
      if (r.status === 401) { setError("Datos Inválidos"); return }
      if (!r.ok) { setError("Error al conectar. Intentá de nuevo."); return }
      const data = await r.json()
      // Guardar para permitir login offline la próxima vez
      localStorage.setItem("cm_cache", JSON.stringify({ numero: String(data.numero), pin: pin.trim(), nombre: data.nombre }))
      onIngresar({ vendedor: data.numero, nombre: data.nombre })
    } catch (err) {
      // Falla de red aunque navigator.onLine dijera que había conexión
      const entro = loginConCache(vendedor.trim(), pin.trim())
      if (!entro) {
        setError(`Error: ${err?.message || err} | online:${navigator.onLine} | ${cacheDebug}`)
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: T.heroBg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -80, right: -60, width: 220, height: 220, borderRadius: "50%", background: T.heroDecor1 }} />
      <div style={{ position: "absolute", bottom: 160, left: -90, width: 180, height: 180, borderRadius: "50%", background: T.heroDecor2 }} />
      <div style={{ position: "absolute", top: 300, right: 30, width: 80, height: 80, borderRadius: "50%", background: T.heroDecor3 }} />

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 28px 0", gap: 28 }}>
        {/* Logo */}
        <div style={{
          width: 100, height: 100, borderRadius: 28,
          background: T.logoBg, color: T.logoInk,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 14px 40px rgba(0,0,0,0.18)", transform: "rotate(-6deg)",
        }}>
          <span style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-3px", fontFamily: T.brand }}>cm</span>
        </div>

        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 13, letterSpacing: "3px", fontWeight: 700, opacity: 0.75, marginBottom: 6 }}>BIENVENIDO A</div>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-1.2px", fontFamily: T.brand, lineHeight: 1 }}>CandyMóvil</div>
          <div style={{ fontSize: 14, marginTop: 10, opacity: 0.85 }}>Relevamiento de stock</div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          <PillInput icon={<IcUser />} value={vendedor} onChange={setVendedor} placeholder="Número de vendedor" type="number" inputMode="numeric" onEnter={handleIngresar} />
          <PillInput icon={<span style={{ fontSize: 16 }}>🔒</span>} value={pin} onChange={setPin} placeholder="PIN" type="password" onEnter={handleIngresar} />
        </div>

        {error && <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600, margin: 0, textAlign: "center" }}>{error}</p>}

        {/* Botón instalar — solo aparece si el browser lo permite y no está instalada */}
        {installPrompt && !yaInstalada && (
          <button onClick={handleInstalar} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 999, padding: "10px 22px", cursor: "pointer",
            color: "white", fontSize: 14, fontWeight: 700,
          }}>
            <IcDownload /> Instalar app en el celu
          </button>
        )}
      </div>

      {/* Bottom */}
      <div style={{ position: "relative", padding: "28px 28px 40px" }}>
        <button onClick={handleIngresar} disabled={cargando} style={{
          width: "100%", height: 58, borderRadius: 999, border: "none",
          background: T.cta, color: T.ctaInk,
          fontSize: 17, fontWeight: 800, letterSpacing: "0.4px", cursor: cargando ? "default" : "pointer",
          boxShadow: "0 12px 28px " + T.ctaShadow,
          opacity: cargando ? 0.7 : 1,
        }}>{cargando ? "Verificando..." : "INGRESAR"}</button>
      </div>
    </div>
  )
}

function PillInput({ icon, value, onChange, placeholder, type = "text", inputMode, onEnter }) {
  return (
    <div style={{
      height: 54, borderRadius: 999, background: T.inputBg,
      display: "flex", alignItems: "center", padding: "0 6px 0 22px", gap: 12,
      color: T.inputInk,
    }}>
      {icon && <span style={{ color: T.inputIcon, display: "inline-flex" }}>{icon}</span>}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        inputMode={inputMode}
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          color: T.inputInk, fontSize: 16, fontWeight: 600,
          letterSpacing: type === "password" ? "4px" : "normal",
        }}
      />
    </div>
  )
}
