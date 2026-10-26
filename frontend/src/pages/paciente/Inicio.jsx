import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Info, ClipboardList, FileText, ArrowUpRight } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita'
import ModalidadTag from '../../components/ModalidadTag'
import { PACIENTE } from './datosEjemplo'
import { cancelarCita, listarCitas } from '../../services/citasService'
import { aFecha, diaSemana, formatearFecha, mesMayusculas } from '../../lib/fechas'
import './Inicio.css'

const esActiva = (c) => ['PENDIENTE', 'ACEPTADA'].includes(c.estado) && c.futura

const ACCESOS = [
  { to: '/paciente/historial', icon: ClipboardList, titulo: 'Mi historial', texto: 'Consulta tus diagnósticos y resultados.' },
  { to: '/paciente/recetas', icon: FileText, titulo: 'Mis recetas', texto: 'Accede a tus recetas y tratamientos.' },
]

export default function InicioPaciente() {
  const [citas, setCitas] = useState(null)
  const [error, setError] = useState('')

  const cargar = () => listarCitas().then(setCitas).catch((e) => setError(e.message))
  useEffect(() => { cargar() }, [])

  const cancelar = async (codigo) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    try {
      await cancelarCita(codigo)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  const proximas = (citas ?? []).filter(esActiva).sort((a, b) => a.iso.localeCompare(b.iso))
  const proxima = proximas[0]
  const ultima = (citas ?? []).filter((c) => c.estado === 'COMPLETADA').sort((a, b) => b.iso.localeCompare(a.iso))[0]
  const tabla = [...proximas.slice(0, 3), ultima].filter(Boolean)

  return (
    <>
      <div className="ini-head">
        <div>
          <h1>Hola, {PACIENTE.nombre}</h1>
          <p>Aquí puedes solicitar una nueva cita, revisar tus próximas consultas y acceder a tus diagnósticos y recetas.</p>
        </div>
        <Link to="/paciente/citas/solicitar" className="ini-cta">
          <Plus size={18} /> Solicitar cita
        </Link>
      </div>

      {error && <p className="ini-error" role="alert">{error}</p>}

      <section className="ini-summary">
        {proxima ? (
          <article className="ini-next">
            <div className="ini-next__top">
              <span>TU PRÓXIMA CITA</span>
              <EstadoCita estado={proxima.estado} />
            </div>

            <div className="ini-next__info">
              <div className="ini-date">
                <strong>{aFecha(proxima.iso).getDate()}</strong>
                <span>{mesMayusculas(proxima.iso)}</span>
              </div>
              <div className="ini-next__details">
                <h2>{diaSemana(proxima.iso)} · {proxima.hora}</h2>
                <p>{proxima.medico}</p>
                <small>{proxima.especialidad} · Cita {proxima.codigo}</small>
                <ModalidadTag modalidad={proxima.modalidad} />
              </div>
            </div>

            <div className="ini-note">
              <Info size={16} color="#0e5733" />
              <p>Puedes cancelar o reprogramar esta cita antes del inicio.</p>
            </div>

            <Link to={`/paciente/citas/${proxima.codigo}`} className="ini-detail">Ver detalle</Link>
          </article>
        ) : (
          <article className="ini-next ini-next--empty">
            <strong>{citas ? 'No tienes citas próximas' : 'Cargando tus citas...'}</strong>
            {citas && <p>Solicita una cita para verla aquí.</p>}
          </article>
        )}

        <div className="ini-shortcuts">
          {ACCESOS.map(({ to, icon: Icon, titulo, texto }) => (
            <Link to={to} className="ini-shortcut" key={titulo}>
              <div>
                <Icon size={23} color="#16713e" />
                <ArrowUpRight size={18} color="#16713e" />
              </div>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="ini-panel">
        <div className="ini-panel__head">
          <h2>Mis citas</h2>
          <Link to="/paciente/citas" className="ini-all">Ver todas →</Link>
        </div>

        <div className="ini-table">
          <div className="ini-row ini-row--head">
            <span>FECHA Y HORA</span><span>PROFESIONAL</span><span>ESTADO</span><span>ACCIÓN</span>
          </div>

          {tabla.length === 0 && <p className="ini-empty">{citas ? 'Aún no tienes citas.' : 'Cargando...'}</p>}

          {tabla.map((c) => (
            <div className="ini-row" key={c.codigo}>
              <div className="ini-cell">
                <strong>{formatearFecha(c.iso)}</strong>
                <small>{c.hora} · {c.codigo}</small>
              </div>
              <div className="ini-cell">
                <span>{c.medico}</span>
                <small>{c.especialidad}</small>
              </div>
              <div className="ini-state"><EstadoCita estado={c.estado} /><ModalidadTag modalidad={c.modalidad} /></div>
              <div className="ini-actions">
                <Link to={`/paciente/citas/${c.codigo}`} className="ini-action ini-action--link">Ver detalle</Link>
                {esActiva(c) && (
                  <button type="button" className="ini-action" onClick={() => cancelar(c.codigo)}>Cancelar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
