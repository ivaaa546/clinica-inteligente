import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Printer, FileText, X } from 'lucide-react'
import { useOwnPrescriptions } from '../../features/recetas/hooks/useOwnPrescriptions.js'
import { useAuth } from '../../features/auth/hooks/useAuth.js'
import ApiError from '../../shared/components/ApiError.jsx'
import EmptyState from '../../shared/components/EmptyState.jsx'
import LoadingState from '../../shared/components/LoadingState.jsx'
import { formatClinicDate } from '../../shared/lib/date.js'
import logoClinica from '../../assets/MediQuetzalbueno.png'
import './Recetas.css'

const iniciales = (nombre) =>
  nombre.replace(/^(Dra?\.)\s*/i, '').split(' ').map((parte) => parte[0]).slice(0, 2).join('').toUpperCase()

function Linea({ etiqueta, valor, ancho }) {
  return (
    <div className={`rx-line ${ancho ? 'rx-line--wide' : ''}`}>
      <span>{etiqueta}</span>
      <strong>{valor || 'No disponible'}</strong>
    </div>
  )
}

function datosMedico(consulta) {
  const medico = consulta?.cita?.medico
  const usuario = medico?.usuario
  return {
    nombre: usuario ? `Dr. ${usuario.nombre} ${usuario.apellidos}` : 'Profesional no disponible',
    especialidad: medico?.especialidad?.nombre || 'Especialidad no disponible',
    numeroProfesional: medico?.numeroProfesional || 'No disponible',
  }
}

function Hoja({ grupo, paciente }) {
  const medico = datosMedico(grupo.consulta)
  return (
    <article className="rx-sheet">
      <header className="rx-sheet__head">
        <img className="rx-sheet__logo" src={logoClinica} alt="Logo MediQuetzal" />
        <div>
          <strong>{medico.nombre}</strong>
          <span>{medico.especialidad}</span>
          <small>No. profesional: {medico.numeroProfesional}</small>
        </div>
      </header>

      <h3>Paciente</h3>
      <div className="rx-grid">
        <Linea etiqueta="Nombre:" valor={paciente} ancho />
        <Linea etiqueta="Fecha:" valor={formatClinicDate(grupo.consulta?.fechaConsulta)} />
        <Linea etiqueta="Consulta:" valor={grupo.id} />
        <Linea etiqueta="Diagnóstico:" valor={grupo.consulta?.diagnostico} />
      </div>

      <h3>RX:</h3>
      <div className="rx-body">
        {grupo.recetas.map((receta, indice) => (
          <div className="rx-med" key={receta.id}>
            <p className="rx-med__name"><span>{indice + 1}.</span> {receta.medicamento}</p>
            <div className="rx-grid">
              <Linea etiqueta="Dosis:" valor={receta.dosis} />
              <Linea etiqueta="Vía:" valor={receta.via} />
              <Linea etiqueta="Frecuencia:" valor={receta.frecuencia} />
              <Linea etiqueta="Duración:" valor={receta.duracion} />
              <Linea etiqueta="Indicaciones:" valor={receta.indicaciones} ancho />
            </div>
          </div>
        ))}
      </div>

      <footer className="rx-sheet__foot">
        <div className="rx-sign"><span>Firma del doctor</span></div>
      </footer>
      <p className="rx-legal">Receta simple · Sin firma digital ni validez legal</p>
    </article>
  )
}

export default function Recetas() {
  const location = useLocation()
  const { user } = useAuth()
  const { prescriptions, loading, error } = useOwnPrescriptions()
  const [abierta, setAbierta] = useState(location.state?.abrir ?? null)
  const hojaRef = useRef(null)

  const grupos = useMemo(() => {
    const mapa = new Map()
    prescriptions.forEach((receta) => {
      const id = receta.consulta?.id || receta.id
      const existente = mapa.get(id)
      if (existente) existente.recetas.push(receta)
      else mapa.set(id, { id, consulta: receta.consulta, recetas: [receta] })
    })
    return [...mapa.values()]
  }, [prescriptions])

  useEffect(() => {
    if (abierta) hojaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [abierta])

  const grupo = grupos.find((item) => item.id === abierta)
  const paciente = [user?.nombre, user?.apellidos].filter(Boolean).join(' ') || 'Paciente'

  return (
    <>
      <div className="rx-head">
        <div>
          <h1>Mis recetas</h1>
          <p>Elige una receta para verla e imprimirla.</p>
        </div>
        {!loading && !error && <span className="rx-pill">{grupos.length} {grupos.length === 1 ? 'receta' : 'recetas'}</span>}
      </div>

      {loading && <LoadingState message="Cargando tus recetas…" />}
      {error && <ApiError error={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && grupos.length === 0 && (
        <EmptyState title="No tienes recetas disponibles" message="Las recetas aparecerán aquí cuando un médico las registre." />
      )}

      {!loading && !error && grupos.length > 0 && (
        <div className="rx-cards">
          {grupos.map((item) => {
            const activa = item.id === abierta
            const medico = datosMedico(item.consulta)
            return (
              <div key={item.id} className={`rx-card ${activa ? 'is-active' : ''}`}>
                <div className="rx-card__top">
                  <span className="rx-card__avatar">{iniciales(medico.nombre)}</span>
                  <span className="rx-pill rx-pill--soft">
                    {item.recetas.length} {item.recetas.length === 1 ? 'medicamento' : 'medicamentos'}
                  </span>
                </div>
                <div className="rx-card__who"><strong>{medico.nombre}</strong><small>{medico.especialidad}</small></div>
                <p className="rx-card__meta">{formatClinicDate(item.consulta?.fechaConsulta) || 'Fecha no disponible'} · Consulta {item.id}</p>
                <button
                  type="button"
                  className={`rx-btn ${activa ? 'rx-btn--ghost' : 'rx-btn--primary'}`}
                  onClick={() => setAbierta(activa ? null : item.id)}
                >
                  {activa ? <><X size={17} /> Ocultar receta</> : <><FileText size={17} /> Ver receta</>}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {grupo ? (
        <section className="rx-viewer" ref={hojaRef}>
          <div className="rx-toolbar">
            <strong>Receta · consulta {grupo.id}</strong>
            <button type="button" className="rx-btn rx-btn--primary" onClick={() => window.print()}>
              <Printer size={17} /> Imprimir
            </button>
          </div>
          <Hoja grupo={grupo} paciente={paciente} />
        </section>
      ) : grupos.length > 0 ? (
        <p className="rx-empty">Selecciona “Ver receta” para mostrar el detalle.</p>
      ) : null}
    </>
  )
}
