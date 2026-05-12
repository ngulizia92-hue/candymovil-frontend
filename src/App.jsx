import { useState } from "react"
import PantallaIngreso from "./PantallaIngreso"
import PantallaRelevamiento from "./PantallaRelevamiento"
import PantallaFin from "./PantallaFin"

export default function App() {
  const [pantalla, setPantalla] = useState("ingreso")
  const [sesion, setSesion] = useState(null)

  function handleIngresar(datos) {
    setSesion(datos)
    setPantalla("relevamiento")
  }

  function handleFinalizar() {
    setPantalla("fin")
  }

  function handleNuevo() {
    setSesion(null)
    setPantalla("ingreso")
  }

  if (pantalla === "ingreso") return <PantallaIngreso onIngresar={handleIngresar} />
  if (pantalla === "relevamiento") return <PantallaRelevamiento sesion={sesion} onFinalizar={handleFinalizar} />
  if (pantalla === "fin") return <PantallaFin onNuevo={handleNuevo} />
}
