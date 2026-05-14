import { useState, useRef } from "react"
import { T } from "./theme"
import { useSync } from "./useSync"
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

function BottomNav({ current, onChange, pendingCount }) {
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
            position: "relative",
          }}>
            <div style={{
              width: 44, height: 30, borderRadius: 999,
              background: active ? T.navActiveBg : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <Icon />
              {/* Badge de pendientes en el ícono Historial */}
              {id === "historial" && pendingCount > 0 && (
                <span style={{
                  position: "absolute", top: -2, right: -2,
                  background: "#ef4444", color: "white",
                  fontSize: 9, fontWeight: 800, borderRadius: 999,
                  minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px",
                }}>{pendingCount}</span>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 600 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function OfflineBanner({ isOnline, syncing, pendingCount }) {
  if (isOnline && pendingCount === 0) return null
  return (
    <div style={{
      background: isOnline ? (syncing ? "#3FB8C7" : "#16a34a") : "#1f2937",
      color: "white", padding: "7px 16px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontSize: 12, fontWeight: 700, letterSpacing: "0.3px", flexShrink: 0,
    }}>
      {!isOnline ? (
        <><span>📵</span> Sin conexión — las cargas se guardan localmente</>
      ) : syncing ? (
        <><span>🔄</span> Sincronizando {pendingCount} carga{pendingCount !== 1 ? "s" : ""}...</>
      ) : (
        <><span>✅</span> Sincronizado</>
      )}
    </div>
  )
}

export default function App() {
  const isAdmin = window.location.pathname === "/admin"
  const [pantalla, setPantalla] = useState("login")
  const [sesion, setSesion] = useState(null)
  const [onboarding, setOnboarding] = useState(true)

  const { pendingCount, syncing, isOnline, refreshCount } = useSync()

  const [historialEntradas, setHistorialEntradas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`cm_historial_${sesion?.vendedor}`) || "[]") } catch { return [] }
  })

  const conteoRef = useRef({ total: 0 })
  const [conteoTotal, setConteoTotal] = useState(0)
  const conteo = {
    total: conteoTotal,
    agregar: () => {
      conteoRef.current.total += 1
      setConteoTotal(t => t + 1)
      refreshCount() // actualiza badge si fue guardado offline
    }
  }

  if (isAdmin) return <PantallaAdmin />

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

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: T.bg }}>
      <OfflineBanner isOnline={isOnline} syncing={syncing} pendingCount={pendingCount} />

      {pantalla === "relev" && (
        <PantallaRelevamiento
          sesion={sesion}
          conteo={conteo}
          onChangeLocation={() => { setOnboarding(false); setPantalla("location") }}
        />
      )}
      {pantalla === "historial" && (
        <PantallaHistorial sesion={sesion} pendingCount={pendingCount} refreshCount={refreshCount} entradas={historialEntradas} setEntradas={setHistorialEntradas} />
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
        <BottomNav
          current={pantalla}
          pendingCount={pendingCount}
          onChange={(id) => {
            if (id === "location") { setOnboarding(false); setPantalla("location") }
            else setPantalla(id)
          }}
        />
      )}
    </div>
  )
}
