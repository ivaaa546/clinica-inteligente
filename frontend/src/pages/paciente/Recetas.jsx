import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Printer, FileText, X, Plus } from 'lucide-react'
import { CONSULTAS, PACIENTE } from './datosEjemplo'
import './Recetas.css'

const RECETAS = CONSULTAS.filter((c) => c.receta)

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
  const { medico, receta } = consulta
  return (
    <article className="rx-sheet">
      <header className="rx-sheet__head">
        <span className="rx-sheet__logo"><Plus size={30} color="#fff" /></span>
        <div>
          <strong>{medico.nombre}</strong>
          <span>{medico.especialidad}</span>
          <small>Colegiado: {medico.colegiado}</small>
          <small>{medico.direccion}</small>
        </div>
      </header>

      <h3>Paciente</h3>
      <div className="rx-grid">
        <Linea etiqueta="Nombre:" valor={PACIENTE.nombre} ancho />
        <Linea etiqueta="Fecha:" valor={consulta.fecha} />
        <Linea etiqueta="Edad:" valor={PACIENTE.edad} />
        <Linea etiqueta="Peso:" valor={PACIENTE.peso} />
        <Linea etiqueta="Altura:" valor={PACIENTE.altura} />
      </div>

      <h3>RX:</h3>
      <div className="rx-body">
        <p className="rx-med">{receta.medicamento}</p>
        <div className="rx-grid">
          <Linea etiqueta="Dosis:" valor={receta.dosis} />
          <Linea etiqueta="Vía:" valor={receta.via} />
          <Linea etiqueta="Frecuencia:" valor={receta.frecuencia} />
          <Linea etiqueta="Duración:" valor={receta.duracion} />
          <Linea etiqueta="Indicaciones:" valor={receta.indicaciones} ancho />
        </div>
      </div>

      <footer className="rx-sheet__foot">
        <div>
          <h3>Horario de consulta:</h3>
          <p>{medico.horario}</p>
        </div>
        <div className="rx-sign"><span>Firma del doctor</span></div>
      </footer>

      <p className="rx-legal">Receta simple · Sin firma digital ni validez legal · Receta {receta.id}</p>
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

  const consulta = RECETAS.find((c) => c.receta.id === abierta)

  return (
    <>
      <div className="rx-head">
        <div>
          <h1>Mis recetas</h1>
          <p>Elige una receta para verla e imprimirla.</p>
        </div>
        <span className="rx-pill">{RECETAS.length} recetas</span>
      </div>

      <div className="rx-cards">
        {RECETAS.map((c) => {
          const activa = c.receta.id === abierta
          return (
            <div key={c.receta.id} className={`rx-card ${activa ? 'is-active' : ''}`}>
              <div className="rx-card__top">
                <span className="rx-card__avatar">{iniciales(c.medico.nombre)}</span>
                <span className="rx-pill rx-pill--soft">{c.receta.estado}</span>
              </div>
              <div className="rx-card__who">
                <strong>{c.medico.nombre}</strong>
                <small>{c.medico.especialidad}</small>
              </div>
              <p className="rx-card__meta">{c.fecha} · Receta {c.receta.id}</p>
              <button
                type="button"
                className={`rx-btn ${activa ? 'rx-btn--ghost' : 'rx-btn--primary'}`}
                onClick={() => setAbierta(activa ? null : c.receta.id)}
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
            <strong>Receta {consulta.receta.id}</strong>
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