import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { diaSemana, formatearFecha, separarBloque } from '../../../shared/lib/fechas'
import { etiquetaSemana, franjas, slotKey, sumarMinutos, MINUTOS_BLOQUE } from '../../../shared/lib/semana'
import type { BloqueDisponibilidad, CitaAgenda, FechaISO } from '../../../types/medico'

export type SeleccionAgenda =
  | { tipo: 'cita'; codigo: string }
  | { tipo: 'bloque'; fecha: FechaISO; inicio: string }
  | null

const ETIQUETA: Record<string, string> = { PENDIENTE: 'Pendiente', ACEPTADA: 'Aceptada', COMPLETADA: 'Completada' }
/** Estados que ocupan un bloque (rechazadas, canceladas y reprogramadas lo liberan) */
const OCUPAN = ['PENDIENTE', 'ACEPTADA', 'COMPLETADA']

const diaCorto = (iso: FechaISO) => `${diaSemana(iso).slice(0, 3)} ${Number(iso.slice(8))}`

interface Props {
  lunes: FechaISO
  dias: FechaISO[]
  bloques: BloqueDisponibilidad[]
  citas: CitaAgenda[]
  cargando: boolean
  /** Se está eligiendo el bloque nuevo de una cita: los bloques libres se resaltan */
  reprogramando?: boolean
  seleccion: SeleccionAgenda
  onSeleccionar: (seleccion: Exclude<SeleccionAgenda, null>) => void
  onAnterior: () => void
  onSiguiente: () => void
  onHoy: () => void
}

export default function AgendaSemana({
  lunes, dias, bloques, citas, cargando, reprogramando = false, seleccion, onSeleccionar, onAnterior, onSiguiente, onHoy,
}: Props) {
  const { citasPorSlot, bloquesPorSlot, horas } = useMemo(() => {
    const citasPorSlot = new Map<string, CitaAgenda>()
    for (const c of citas) {
      if (OCUPAN.includes(c.estado)) citasPorSlot.set(slotKey(c.fecha, separarBloque(c.hora).inicio), c)
    }
    const bloquesPorSlot = new Map(bloques.map((b) => [slotKey(b.fecha, b.inicio), b]))

    // Filas: desde el primer hasta el último horario con algo; si la semana está vacía, 09:00–12:00
    const inicios = [...bloques.map((b) => b.inicio), ...citas.map((c) => separarBloque(c.hora).inicio)].sort()
    const horas = inicios.length
      ? franjas(inicios[0], sumarMinutos(inicios[inicios.length - 1], MINUTOS_BLOQUE))
      : franjas('09:00', '12:00')
    return { citasPorSlot, bloquesPorSlot, horas }
  }, [bloques, citas])

  const citaSeleccionada = seleccion?.tipo === 'cita' ? seleccion.codigo : null

  return (
    <section className="ag-card" aria-labelledby="ag-semana">
      <h2 id="ag-semana" className="ag-card__title">{etiquetaSemana(lunes)}</h2>

      <div className="ag-toolbar">
        <p className="ag-legend">
          <span><i className="ag-dot ag-dot--aceptada" /> Cita aceptada</span>
          <span><i className="ag-dot ag-dot--libre" /> Disponible</span>
        </p>
        <div className="ag-nav">
          <button type="button" onClick={onAnterior} aria-label="Semana anterior"><ChevronLeft size={16} /></button>
          <button type="button" className="ag-nav__hoy" onClick={onHoy}>Hoy</button>
          <button type="button" onClick={onSiguiente} aria-label="Semana siguiente"><ChevronRight size={16} /></button>
        </div>
      </div>

      {cargando ? (
        <p className="ag-vacio">Cargando tu agenda…</p>
      ) : (
        <div className="ag-grid" role="grid" aria-label="Agenda semanal">
          <div className="ag-grid__row ag-grid__row--head" role="row">
            <span>HORA</span>
            {dias.map((dia) => <span key={dia} role="columnheader">{diaCorto(dia)}</span>)}
          </div>

          <div className="ag-grid__body">
            {horas.map((hora) => (
              <div key={hora} className="ag-grid__row" role="row">
                <span className="ag-grid__hora" role="rowheader">{hora}</span>
                {dias.map((dia) => {
                  const clave = slotKey(dia, hora)
                  const cita = citasPorSlot.get(clave)
                  const bloque = bloquesPorSlot.get(clave)
                  const elegida = cita
                    ? citaSeleccionada === cita.codigo
                    : seleccion?.tipo === 'bloque' && seleccion.fecha === dia && seleccion.inicio === hora

                  if (cita) {
                    return (
                      <button
                        key={dia} type="button" role="gridcell" aria-pressed={elegida}
                        className={`ag-cell ag-cell--${cita.estado.toLowerCase()}${elegida ? ' is-selected' : ''}`}
                        onClick={() => onSeleccionar({ tipo: 'cita', codigo: cita.codigo })}
                      >
                        <span>{ETIQUETA[cita.estado]}</span>
                        <strong>{cita.codigo}</strong>
                      </button>
                    )
                  }
                  return (
                    <button
                      key={dia} type="button" role="gridcell" aria-pressed={elegida}
                      aria-label={`${bloque ? 'Bloque disponible' : 'Crear bloque'} ${formatearFecha(dia)} ${hora}`}
                      className={`ag-cell ${bloque ? 'ag-cell--libre' : 'ag-cell--vacia'}${bloque && reprogramando ? ' ag-cell--destino' : ''}${elegida ? ' is-selected' : ''}`}
                      onClick={() => onSeleccionar({ tipo: 'bloque', fecha: dia, inicio: hora })}
                    >
                      {bloque ? <span>Disponible</span> : <Plus size={14} aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
