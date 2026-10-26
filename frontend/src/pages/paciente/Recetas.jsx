import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Printer, FileText, X } from 'lucide-react'
import { CONSULTAS, PACIENTE } from './datosEjemplo'
import logoClinica from '../../assets/logo-codecraft.png'
import './Recetas.css'

// Una "receta" para el paciente = todos los medicamentos indicados en una consulta
const CON_RECETA = CONSULTAS.filter((c) => c.recetas.length > 0)

const iniciales = (nombre) =>
  nombre.replace(/^(Dra?\.)\s*/i, '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

function Linea({ etiqueta, valor, ancho }) {
  return (
    <div className={`rx-line ${ancho ? 'rx-line--wide' : ''}`}>
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
    </div>
  )
}

/** Hoja de receta (formato simple, inspirado en una receta médica impresa) */
function Hoja({ consulta }) {
  const { medico, recetas } = consulta
  return (
    <article className="rx-sheet">
      <header className="rx-sheet__head">
        <img className="rx-sheet__logo" src={logoClinica} alt="Logo CODECRAFT" />
        <div>
          <strong>{medico.nombre}</strong>
          <span>{medico.especialidad}</span>
          <small>No. profesional: {medico.numeroProfesional}</small>
        </div>
      </header>

      <h3>Paciente</h3>
      <div className="rx-grid">
        <Linea etiqueta="Nombre:" valor={PACIENTE.nombre} ancho />
        <Linea etiqueta="Fecha:" valor={consulta.fecha} />
        <Linea etiqueta="Edad:" valor={PACIENTE.edad} />
        <Linea etiqueta="Consulta:" valor={consulta.id} />
      </div>

      <h3>RX:</h3>
      <div className="rx-body">
        {recetas.map((r, i) => (
          <div className="rx-med" key={r.id}>
            <p className="rx-med__name"><span>{i + 1}.</span> {r.medicamento}</p>
            <div className="rx-grid">
              <Linea etiqueta="Dosis:" valor={r.dosis} />
              <Linea etiqueta="Vía:" valor={r.via} />
              <Linea etiqueta="Frecuencia:" valor={r.frecuencia} />
              <Linea etiqueta="Duración:" valor={r.duracion} />
              <Linea etiqueta="Indicaciones:" valor={r.indicaciones} ancho />
            </div>
          </div>
        ))}
      </div>

      <footer className="rx-sheet__foot">
        <div className="rx-sign">
          {medico.firma && <img src={medico.firma} alt={`Firma de ${medico.nombre}`} />}
          <span>Firma del doctor</span>
        </div>
      </footer>

      <p className="rx-legal">Receta simple · Sin firma digital ni validez legal</p>
    </article>
  )
}

export default function Recetas() {
  const location = useLocation()
  const [abierta, setAbierta] = useState(location.state?.abrir ?? null)
  const hojaRef = useRef(null)

  // Al abrir una receta, la muestra en pantalla
  useEffect(() => {
    if (abierta) hojaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [abierta])

  const consulta = CON_RECETA.find((c) => c.id === abierta)

  return (
    <>
      <div className="rx-head">
        <div>
          <h1>Mis recetas</h1>
          <p>Elige una receta para verla e imprimirla.</p>
        </div>
        <span className="rx-pill">{CON_RECETA.length} recetas</span>
      </div>

      <div className="rx-cards">
        {CON_RECETA.map((c) => {
          const activa = c.id === abierta
          return (
            <div key={c.id} className={`rx-card ${activa ? 'is-active' : ''}`}>
              <div className="rx-card__top">
                <span className="rx-card__avatar">{iniciales(c.medico.nombre)}</span>
                <span className="rx-pill rx-pill--soft">
                  {c.recetas.length} {c.recetas.length === 1 ? 'medicamento' : 'medicamentos'}
                </span>
              </div>
              <div className="rx-card__who">
                <strong>{c.medico.nombre}</strong>
                <small>{c.medico.especialidad}</small>
              </div>
              <p className="rx-card__meta">{c.fecha} · Consulta {c.id}</p>
              <button
                type="button"
                className={`rx-btn ${activa ? 'rx-btn--ghost' : 'rx-btn--primary'}`}
                onClick={() => setAbierta(activa ? null : c.id)}
              >
                {activa ? <><X size={17} /> Ocultar receta</> : <><FileText size={17} /> Ver receta</>}
              </button>
            </div>
          )
        })}
      </div>

      {consulta ? (
        <section className="rx-viewer" ref={hojaRef}>
          <div className="rx-toolbar">
            <strong>Receta · consulta {consulta.id}</strong>
            <button type="button" className="rx-btn rx-btn--primary" onClick={() => window.print()}>
              <Printer size={17} /> Imprimir
            </button>
          </div>
          <Hoja consulta={consulta} />
        </section>
      ) : (
        <p className="rx-empty">Selecciona “Ver receta” para mostrar el detalle.</p>
      )}
    </>
  )
}
