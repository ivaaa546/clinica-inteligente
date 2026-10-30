import { Plus } from 'lucide-react'
import type { NuevoBloque } from '../../../shared/types/medico'

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

      <div className="ag-campo">
        <span>Modalidades admitidas</span>
        <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(form.modalidades || ['PRESENCIAL', 'VIRTUAL']).includes('PRESENCIAL')}
              onChange={(e) => {
                const actual = new Set<'PRESENCIAL' | 'VIRTUAL'>(form.modalidades || ['PRESENCIAL', 'VIRTUAL'])
                if (e.target.checked) actual.add('PRESENCIAL')
                else if (actual.size > 1) actual.delete('PRESENCIAL')
                onCambio({ modalidades: Array.from(actual) })
              }}
            />
            Presencial
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(form.modalidades || ['PRESENCIAL', 'VIRTUAL']).includes('VIRTUAL')}
              onChange={(e) => {
                const actual = new Set<'PRESENCIAL' | 'VIRTUAL'>(form.modalidades || ['PRESENCIAL', 'VIRTUAL'])
                if (e.target.checked) actual.add('VIRTUAL')
                else if (actual.size > 1) actual.delete('VIRTUAL')
                onCambio({ modalidades: Array.from(actual) })
              }}
            />
            En línea (Videollamada)
          </label>
        </div>
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
