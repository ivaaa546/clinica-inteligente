import { Plus } from 'lucide-react'
import type { NuevoBloque } from '../../types/medico'

interface Props {
  form: NuevoBloque
  existe: boolean
  conCitaActiva: boolean
  ocupado: boolean
  onCambio: (cambios: Partial<NuevoBloque>) => void
  onGuardar: () => void
  onNuevo: () => void
  onEliminar: () => void
}

export default function BloqueDisponible({ form, existe, conCitaActiva, ocupado, onCambio, onGuardar, onNuevo, onEliminar }: Props) {
  return (
    <aside className="ag-card ag-bloque" aria-labelledby="ag-bloque-titulo">
      <h2 id="ag-bloque-titulo" className="ag-card__title">Bloque disponible</h2>
      <p className="ag-chips"><span className="ag-chip">Editar disponibilidad</span></p>

      <label className="ag-campo">
        <span>Fecha</span>
        <input type="date" value={form.fecha} onChange={(e) => onCambio({ fecha: e.target.value })} />
      </label>

      <div className="ag-campos">
        <label className="ag-campo">
          <span>Desde</span>
          <input type="time" step={1800} value={form.desde} onChange={(e) => onCambio({ desde: e.target.value })} />
        </label>
        <label className="ag-campo">
          <span>Hasta</span>
          <input type="time" step={1800} value={form.hasta} onChange={(e) => onCambio({ hasta: e.target.value })} />
        </label>
      </div>

      <p className="ag-ayuda">Solo los bloques disponibles podrán recibir nuevas solicitudes de cita. Cada bloque dura 30 minutos.</p>

      <button type="button" className="ag-btn ag-btn--primario" onClick={onGuardar} disabled={ocupado}>Guardar cambios</button>
      <button type="button" className="ag-btn ag-btn--borde" onClick={onNuevo} disabled={ocupado}>
        <Plus size={16} aria-hidden="true" /> Agregar nuevo bloque
      </button>
      <button
        type="button" className="ag-btn ag-btn--peligro" onClick={onEliminar}
        disabled={ocupado || !existe || conCitaActiva}
        title={conCitaActiva ? 'Un bloque con una cita activa no se puede eliminar' : undefined}
      >
        Eliminar bloque
      </button>

      <p className="ag-flujo">Flujo: Paciente solicita → se valida disponibilidad → reserva notificada → médico consulta agenda e inicia consulta.</p>
    </aside>
  )
}
