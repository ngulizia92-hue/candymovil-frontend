import { useState, useEffect } from "react"
import { T } from "./theme"
import { getUbicaciones } from "./api"

const IcPin = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13z"/><circle cx="12" cy="9" r="3"/>
  </svg>
)
const IcBack = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5l-7 7 7 7"/>
  </svg>
)
const IcCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 6"/>
  </svg>
)
const IcChevron = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
)

export default function PantallaUbicacion({ sesion, onContinuar, onBack, onboarding = true }) {
  const [ubicaciones, setUbicaciones] = useState([])
  const [selectedId, setSelectedId] = useState(sesion.ubicacion_id || "")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getUbicaciones().then(setUbicaciones).catch(() => {})
  }, [])

  const current = ubicaciones.find(u => u.id === selectedId)

  function handleContinuar() {
    if (!current) return
    onContinuar({ ...sesion, ubicacion_id: current.id, ubicacion: current.nombre })
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: T.heroBg, position: "relative", overflow: "hidden" }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -80, right: -60, width: 220, height: 220, borderRadius: "50%", background: T.heroDecor1 }} />
      <div style={{ position: "absolute", bottom: 160, left: -90, width: 180, height: 180, borderRadius: "50%", background: T.heroDecor2 }} />
      <div style={{ position: "absolute", top: 340, right: 30, width: 80, height: 80, borderRadius: "50%", background: T.heroDecor3 }} />

      <div style={{ position: "relative", padding: "52px 28px 0" }}>
        <button onClick={onBack} style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "rgba(255,255,255,0.18)", color: "#fff",
          border: "none", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}><IcBack /></button>
      </div>

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 20px", gap: 20 }}>
        {/* Pin icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: T.logoBg, color: T.logoInk,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 14px 40px rgba(0,0,0,0.18)", transform: "rotate(-6deg)",
        }}>
          <IcPin s={40} />
        </div>

        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 12, letterSpacing: "3px", fontWeight: 700, opacity: 0.75, marginBottom: 6 }}>
            {onboarding ? `HOLA, VENDEDOR ${sesion.vendedor}` : "TU UBICACIÓN"}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", fontFamily: T.brand, lineHeight: 1 }}>
            {onboarding ? "Elegí tu ubicación" : "Cambiar ubicación"}
          </div>
          <div style={{ fontSize: 14, marginTop: 10, opacity: 0.85 }}>
            {onboarding ? "Seleccioná el lugar donde vas a relevar hoy." : "Actualizá el lugar donde estás trabajando."}
          </div>
        </div>

        {/* Dropdown */}
        <div style={{ width: "100%", position: "relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{
            width: "100%", minHeight: 66, borderRadius: 22, border: "none",
            background: T.inputBg, padding: "12px 18px 12px 16px",
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            textAlign: "left", boxShadow: open ? "0 12px 28px rgba(0,0,0,0.15)" : "0 6px 18px rgba(0,0,0,0.08)",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, background: T.skuBg,
              color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}><IcPin s={20} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.5px", color: T.primary }}>UBICACIÓN</div>
              {current
                ? <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, fontFamily: T.brand, marginTop: 2 }}>{current.nombre}</div>
                : <div style={{ fontSize: 14, fontWeight: 600, color: T.muted, marginTop: 2 }}>Seleccioná una ubicación</div>
              }
            </div>
            <span style={{ color: T.primary, display: "inline-flex", flexShrink: 0 }}><IcChevron open={open} /></span>
          </button>

          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
              background: "#fff", borderRadius: 22, padding: 8,
              boxShadow: "0 20px 50px rgba(0,0,0,0.20)",
              zIndex: 10, maxHeight: 280, overflowY: "auto",
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              {ubicaciones.map(u => {
                const active = u.id === selectedId
                return (
                  <button key={u.id} onClick={() => { setSelectedId(u.id); setOpen(false) }} style={{
                    background: active ? T.skuBg : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    padding: "12px 14px", borderRadius: 14,
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: active ? T.primary : T.skuBg,
                      color: active ? "#fff" : T.primary,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}><IcPin s={16} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: T.brand }}>{u.nombre}</div>
                      <div style={{ fontSize: 11.5, color: T.muted }}>{u.tipo}</div>
                    </div>
                    {active && <span style={{ color: T.primary, display: "inline-flex" }}><IcCheck /></span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <button onClick={handleContinuar} disabled={!current} style={{
          width: "100%", height: 58, borderRadius: 999, border: "none",
          background: current ? T.cta : T.disabledBg,
          color: current ? T.ctaInk : T.disabledInk,
          fontSize: 17, fontWeight: 800, letterSpacing: "0.4px", cursor: current ? "pointer" : "default",
          boxShadow: current ? "0 12px 28px " + T.ctaShadow : "none",
        }}>{onboarding ? "COMENZAR" : "GUARDAR UBICACIÓN"}</button>
      </div>

    </div>
  )
}
