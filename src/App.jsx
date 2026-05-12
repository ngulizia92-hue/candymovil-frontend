import { useState, useRef } from "react"
import { T } from "./theme"
import PantallaIngreso from "./PantallaIngreso"
import PantallaUbicacion from "./PantallaUbicacion"
import PantallaRelevamiento from "./PantallaRelevamiento"
import PantallaHistorial from "./PantallaHistorial"
import PantallaAdmin from "./PantallaAdmin"

const IcScan = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M20 8V6a2 2 0 0 0-2-2h-2"/>
    <path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/>
    <path d="M7 12h10"/>
  </svg>
)
const IcList = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/>
    <circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
  </svg>
)
const IcPin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13z"/><circle cx="12" cy="9" r="2.5"/>
  </svg>
)

function BottomNav({ current, onChange }) {
  const items = [
    { id: "relev",     label: "Relevar",   Icon: IcScan },
    { id: "historial", label: "Historial", Icon: IcList },
    { id: "location",  label: "Ubicación", Icon: IcPin },
  ]
  return (
    <div style={{
      background: T.navBg, height: 72, paddingBottom: 8,
      display: "flex", alignItems: "stretch", justifyContent: "space-around",
      borderTop: T.navBorder, flexShrink: 0,
    }}>
      {items.map(({ id, label, Icon }) => {
        const active = current === id
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            flex: 1, background: "transparent", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 3, padding: 0, color: active ? T.navActive : T.navInactive,
          }}>
            <div style={{
              width: 44, height: 30, borderRadius: 999,
              background: active ? T.navActiveBg : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Icon /></div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 600 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function App() {
  const isAdmin = window.location.pathname === "/admin"
  const [pantalla, setPantalla] = useState("login")
  const [sesion, setSesion] = useState(null)
  const [onboarding, setOnboarding] = useState(true)

  // Conteo local de items en esta sesión (para el header de Relevamiento)
  const conteoRef = useRef({ total: 0 })
  const [conteoTotal, setConteoTotal] = useState(0)
  const conteo = {
    total: conteoTotal,
    agregar: (sku, descripcion, cantidad) => {
      conteoRef.current.total += 1
      setConteoTotal(t => t + 1)
    }
  }

  if (isAdmin) return <PantallaAdmin />

  // Onboarding flow: no bottom nav
  if (pantalla === "login") {
    return (
      <PantallaIngreso onIngresar={(datos) => {
        setSesion(datos)
        setPantalla("location")
        setOnboarding(true)
      }} />
    )
  }

  if (pantalla === "location" && onboarding) {
    return (
      <PantallaUbicacion
        sesion={sesion}
        onboarding={true}
        onContinuar={(datos) => {
          setSesion(datos)
          setOnboarding(false)
          setPantalla("relev")
        }}
        onBack={() => setPantalla("login")}
      />
    )
  }

  // Main app with bottom nav
  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: T.bg }}>
      {pantalla === "relev" && (
        <PantallaRelevamiento
          sesion={sesion}
          conteo={conteo}
          onChangeLocation={() => { setOnboarding(false); setPantalla("location") }}
        />
      )}
      {pantalla === "historial" && (
        <PantallaHistorial sesion={sesion} />
      )}
      {pantalla === "location" && !onboarding && (
        <PantallaUbicacion
          sesion={sesion}
          onboarding={false}
          onContinuar={(datos) => { setSesion(datos); setPantalla("relev") }}
          onBack={() => setPantalla("relev")}
        />
      )}
      {(pantalla === "relev" || pantalla === "historial") && (
        <BottomNav current={pantalla} onChange={(id) => {
          if (id === "location") { setOnboarding(false); setPantalla("location") }
          else setPantalla(id)
        }} />
      )}
    </div>
  )
}
