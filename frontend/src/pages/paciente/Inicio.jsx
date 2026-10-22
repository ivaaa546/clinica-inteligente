import { Link } from 'react-router-dom'
import { Plus, Info, ClipboardList, FileText, ArrowUpRight } from 'lucide-react'
import './Inicio.css'

// TODO: reemplazar por datos reales de la API (services/citas.js)
const PACIENTE = { nombre: 'Tilin Insano' }

const PROXIMA = {
  dia: '19', mes: 'OCTUBRE', titulo: 'Lunes · 10:30–11:00',
  medico: 'Dra. Elena Torres', detalle: 'Medicina general · Cita C-1042', estado: 'Aceptada',
}

const CITAS = [
  { fecha: '19 oct 2026', hora: '10:30–11:00', codigo: 'C-1042', medico: 'Dra. Elena Torres', especialidad: 'Medicina general', estado: 'Aceptada', accion: 'Cancelar' },
  { fecha: '20 oct 2026', hora: '09:00–09:30', codigo: 'C-1043', medico: 'Dra. Elena Torres', especialidad: 'Medicina general', estado: 'Pendiente', accion: 'Cancelar' },
  { fecha: '17 sep 2026', hora: '09:00–09:30', codigo: 'C-0986', medico: 'Dra. Elena Torres', especialidad: 'Medicina general', estado: 'Completada', accion: 'Ver resumen' },
]

const ACCESOS = [
  { to: '/paciente/historial', icon: ClipboardList, titulo: 'Mi historial', texto: 'Consulta tus diagnósticos y resultados.' },
  { to: '/paciente/recetas', icon: FileText, titulo: 'Mis recetas', texto: 'Accede a tus recetas y tratamientos.' },
]

const Estado = ({ valor }) => (
  <span className={`ini-badge ini-badge--${valor.toLowerCase()}`}>{valor}</span>
)

export default function InicioPaciente() {
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

      <section className="ini-summary">
        <article className="ini-next">
          <div className="ini-next__top">
            <span>TU PRÓXIMA CITA</span>
            <Estado valor={PROXIMA.estado} />
          </div>

          <div className="ini-next__info">
            <div className="ini-date">
              <strong>{PROXIMA.dia}</strong>
              <span>{PROXIMA.mes}</span>
            </div>
            <div className="ini-next__details">
              <h2>{PROXIMA.titulo}</h2>
              <p>{PROXIMA.medico}</p>
              <small>{PROXIMA.detalle}</small>
            </div>
          </div>

          <div className="ini-note">
            <Info size={16} color="#0e5733" />
            <p>Puedes cancelar o reprogramar esta cita antes del inicio.</p>
          </div>

          <Link to="/paciente/citas/C-1042/reprogramar" className="ini-detail">Ver detalle</Link>
        </article>

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
          <span>Tus próximas citas y la más reciente</span>
        </div>

        <div className="ini-table">
          <div className="ini-row ini-row--head">
            <span>FECHA Y HORA</span><span>PROFESIONAL</span><span>ESTADO</span><span>ACCIÓN</span>
          </div>

          {CITAS.map((c) => (
            <div className="ini-row" key={c.codigo}>
              <div className="ini-cell">
                <strong>{c.fecha}</strong>
                <small>{c.hora} · {c.codigo}</small>
              </div>
              <div className="ini-cell">
                <span>{c.medico}</span>
                <small>{c.especialidad}</small>
              </div>
              <div><Estado valor={c.estado} /></div>
              <button type="button" className={`ini-action ${c.accion === 'Ver resumen' ? 'ini-action--link' : ''}`}>
                {c.accion}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}