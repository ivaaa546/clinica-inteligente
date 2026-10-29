import { Link } from 'react-router-dom'
import { Info, Video } from 'lucide-react'
import EstadoCita from '../EstadoCita'
import ModalidadTag from '../ModalidadTag'
import { diaSemana, formatearFecha } from '../../lib/fechas'
import type { CitaAgenda } from '../../types/medico'

interface Props {
  cita: CitaAgenda
  ocupado: boolean
  /** Esta cita está en modo "elegir nuevo bloque" */
  reprogramando: boolean
  onCancelar: () => void
  onReprogramar: () => void
  onSalirReprogramar: () => void
}

const corta = (iso: string) => `${diaSemana(iso).slice(0, 3)} ${formatearFecha(iso).slice(0, 6)}`

export default function CitaSeleccionada({
  cita, ocupado, reprogramando, onCancelar, onReprogramar, onSalirReprogramar,
}: Props) {
  const activa = cita.estado === 'PENDIENTE' || cita.estado === 'ACEPTADA'
  const modificable = activa && cita.futura && !ocupado

  const virtual = cita.modalidad === 'VIDEOLLAMADA'

  return (
    <section className="ag-card ag-cita" aria-labelledby="ag-cita-titulo">
      <div className="ag-cita__top">
        <div className="ag-cita__quien">
          <p className="ag-chips">
            <span className="ag-chip">CITA SELECCIONADA</span>
            <EstadoCita estado={cita.estado} />
            <ModalidadTag modalidad={cita.modalidad} />
          </p>
          <h2 id="ag-cita-titulo">{cita.paciente.nombre}</h2>
        </div>
        <div className="ag-cita__cuando">
          <span>{corta(cita.fecha)} · {cita.hora}</span>
          <span>Expediente {cita.codigo}</span>
        </div>
      </div>

      <div className="ag-cita__contacto">
        <small>TELÉFONO DE CONTACTO</small>
        <p><Info size={14} aria-hidden="true" /> {cita.paciente.telefono || 'No disponible'}</p>
      </div>

      {cita.puedeConsultar ? (
        <Link to={`/medico/consulta/${cita.codigo}`} className="ag-btn ag-btn--primario">Registrar consulta</Link>
      ) : cita.consultaId ? (
        <Link to={`/medico/consultas/${cita.consultaId}`} className="ag-btn ag-btn--primario">Ver consulta {cita.consultaId}</Link>
      ) : (
        <button type="button" className="ag-btn ag-btn--primario" disabled title="Solo disponible para citas aceptadas">Registrar consulta</button>
      )}

      {virtual && cita.estado === 'ACEPTADA' && (
        <Link to={`/medico/citas/${cita.codigo}/llamada`} className="ag-btn ag-btn--borde">
          <Video size={17} aria-hidden="true" /> Entrar a videollamada
        </Link>
      )}

      <button type="button" className="ag-btn ag-btn--borde" disabled={!modificable} onClick={onCancelar}>Cancelar cita</button>
      {reprogramando ? (
        <button type="button" className="ag-btn ag-btn--borde" onClick={onSalirReprogramar}>Cancelar reprogramación</button>
      ) : (
        <button
          type="button" className="ag-btn ag-btn--borde" disabled={!modificable} onClick={onReprogramar}
          title={modificable ? 'Elige un nuevo bloque disponible en la agenda' : undefined}
        >
          Reprogramar cita
        </button>
      )}
    </section>
  )
}
