import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CalendarX } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita'
import ModalidadTag from '../../components/ModalidadTag'
import { cancelarCita, listarCitas } from '../../services/citasService'
import { formatearFecha } from '../../lib/fechas'
import './MisCitas.css'

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']

const FILTROS = [
  { id: 'proximas', label: 'Próximas', test: (c) => ACTIVAS.includes(c.estado) && c.futura },
  { id: 'anteriores', label: 'Anteriores', test: (c) => !(ACTIVAS.includes(c.estado) && c.futura) },
  { id: 'todas', label: 'Todas', test: () => true },
]

export default function MisCitas() {
  const [citas, setCitas] = useState(null)
  const [filtro, setFiltro] = useState('proximas')
  const [error, setError] = useState('')

  const cargar = () => listarCitas().then(setCitas).catch((e) => setError(e.message))
  useEffect(() => { cargar() }, [])

  const lista = citas ?? []
  const visibles = lista
    .filter(FILTROS.find((f) => f.id === filtro).test)
    .sort((a, b) => (filtro === 'proximas' ? a.iso.localeCompare(b.iso) : b.iso.localeCompare(a.iso)))
  const cuenta = (f) => lista.filter(f.test).length

  const cancelar = async (codigo) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    try {
      await cancelarCita(codigo)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="mc-head">
        <div>
          <h1>Mis citas</h1>
          <p>Consulta el estado de tus citas, cancélalas o reprográmalas antes de la fecha y hora.</p>
        </div>
        <Link to="/paciente/citas/solicitar" className="mc-cta"><Plus size={18} /> Solicitar cita</Link>
      </div>

      {error && <p className="mc-error" role="alert">{error}</p>}

      <div className="mc-tabs" role="tablist">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filtro === f.id}
            className={filtro === f.id ? 'is-active' : ''}
            onClick={() => setFiltro(f.id)}
          >
            {f.label} <span>{cuenta(f)}</span>
          </button>
        ))}
      </div>

      <section className="mc-panel">
        {!citas ? (
          <div className="mc-empty"><p>Cargando tus citas...</p></div>
        ) : visibles.length === 0 ? (
          <div className="mc-empty">
            <CalendarX size={28} color="#4f6e5b" />
            <p>No tienes citas en esta vista.</p>
          </div>
        ) : (
          <div className="mc-table">
            <div className="mc-row mc-row--head">
              <span>FECHA Y HORA</span><span>PROFESIONAL</span><span>ESTADO</span><span>ACCIÓN</span>
            </div>

            {visibles.map((c) => {
              const editable = c.futura && ACTIVAS.includes(c.estado)
              return (
                <div className="mc-row" key={c.codigo}>
                  <div className="mc-cell">
                    <strong>{formatearFecha(c.iso)}</strong>
                    <small>{c.hora} · {c.codigo}</small>
                  </div>
                  <div className="mc-cell">
                    <span>{c.medico}</span>
                    <small>{c.especialidad}</small>
                  </div>
                  <div className="mc-state"><EstadoCita estado={c.estado} /><ModalidadTag modalidad={c.modalidad} /></div>
                  <div className="mc-actions">
                    <Link to={`/paciente/citas/${c.codigo}`}>Ver detalle</Link>
                    {editable && <button type="button" onClick={() => cancelar(c.codigo)}>Cancelar</button>}
                    {c.estado === 'COMPLETADA' && <Link to="/paciente/historial">Historial</Link>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
