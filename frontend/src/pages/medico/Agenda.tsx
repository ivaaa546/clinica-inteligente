import { useEffect, useMemo, useState } from 'react'
import AgendaSemana, { type SeleccionAgenda } from '../../components/medico/AgendaSemana'
import BloqueDisponible from '../../components/medico/BloqueDisponible'
import CitaSeleccionada from '../../components/medico/CitaSeleccionada'
import {
  aceptarCita, cancelarCitaMedico, eliminarBloque, listarAgendaSemana, publicarBloques, rechazarCita, reprogramarCitaMedico,
} from '../../services/medicoService'
import { formatearFecha, proximoDiaHabil } from '../../lib/fechas'
import { diasHabiles, lunesDe, slotKey, sumarDias, sumarMinutos, MINUTOS_BLOQUE } from '../../lib/semana'
import type { AgendaSemana as DatosSemana, FechaISO, NuevoBloque } from '../../types/medico'
import './Agenda.css'

const ACTIVAS = ['PENDIENTE', 'ACEPTADA']

const formularioInicial = (): NuevoBloque => ({ fecha: proximoDiaHabil(), desde: '09:00', hasta: '09:30' })

export default function Agenda() {
  const [lunes, setLunes] = useState<FechaISO>(() => lunesDe(proximoDiaHabil()))
  const [datos, setDatos] = useState<(DatosSemana & { lunes: FechaISO }) | null>(null)
  const [version, setVersion] = useState(0) // se incrementa para volver a pedir la agenda tras un cambio
  const [seleccion, setSeleccion] = useState<SeleccionAgenda>(null)
  const [form, setForm] = useState<NuevoBloque>(formularioInicial)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  /** Código de la cita que se está reprogramando (se elige el bloque nuevo en la cuadrícula) */
  const [reprogramando, setReprogramando] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    listarAgendaSemana(lunes)
      .then((agenda) => { if (vigente) { setDatos({ lunes, ...agenda }); setError('') } })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [lunes, version])

  const dias = useMemo(() => diasHabiles(lunes), [lunes])
  const cargando = datos?.lunes !== lunes && !error

  const citaSeleccionada = seleccion?.tipo === 'cita' ? datos?.citas.find((c) => c.codigo === seleccion.codigo) : undefined
  const bloqueDelForm = datos?.bloques.find((b) => b.fecha === form.fecha && b.inicio === form.desde)
  const conCitaActiva = bloqueDelForm
    ? !!datos?.citas.some((c) => ACTIVAS.includes(c.estado) && slotKey(c.fecha, c.hora.split('–')[0]) === slotKey(bloqueDelForm.fecha, bloqueDelForm.inicio))
    : false

  const irASemana = (nuevoLunes: FechaISO) => {
    setLunes(nuevoLunes)
    setSeleccion(null)
    setAviso('')
    setError('')
  }

  const seleccionar = (nueva: Exclude<SeleccionAgenda, null>) => {
    setError('')
    setAviso('')
    if (reprogramando && nueva.tipo === 'bloque') {
      elegirDestino(reprogramando, nueva.fecha, nueva.inicio)
      return
    }
    if (nueva.tipo === 'cita') setReprogramando(null)
    setSeleccion(nueva)
    if (nueva.tipo === 'bloque') {
      setForm({ fecha: nueva.fecha, desde: nueva.inicio, hasta: sumarMinutos(nueva.inicio, MINUTOS_BLOQUE) })
    }
  }

  /** Ejecuta una acción, muestra su resultado y vuelve a pedir la agenda */
  const ejecutar = async (accion: () => Promise<string>) => {
    setOcupado(true)
    setError('')
    setAviso('')
    try {
      setAviso(await accion())
      setVersion((v) => v + 1)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setOcupado(false)
    }
  }

  const elegirDestino = (codigo: string, fecha: string, inicio: string) => {
    if (!datos?.bloques.some((b) => b.fecha === fecha && b.inicio === inicio)) {
      setError('Elige un bloque disponible: los espacios vacíos todavía no tienen bloque publicado.')
      return
    }
    if (!window.confirm(`¿Reprogramar la cita ${codigo} al ${formatearFecha(fecha)} a las ${inicio}?`)) return
    return ejecutar(async () => {
      const nueva = await reprogramarCitaMedico(codigo, fecha, inicio)
      setReprogramando(null)
      setLunes(lunesDe(fecha))
      setSeleccion({ tipo: 'cita', codigo: nueva.codigo })
      return `Cita ${codigo} reprogramada. La nueva solicitud ${nueva.codigo} quedó pendiente.`
    })
  }

  const aceptar = (codigo: string) => ejecutar(async () => { await aceptarCita(codigo); return `Cita ${codigo} aceptada.` })

  const rechazar = (codigo: string) => {
    if (!window.confirm('¿Seguro que deseas rechazar esta solicitud?')) return
    return ejecutar(async () => { await rechazarCita(codigo); return `Cita ${codigo} rechazada.` })
  }

  const cancelar = (codigo: string) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    return ejecutar(async () => { await cancelarCitaMedico(codigo); return `Cita ${codigo} cancelada.` })
  }

  const guardar = () => ejecutar(async () => {
    const nuevos = await publicarBloques(form)
    setSeleccion({ tipo: 'bloque', fecha: form.fecha, inicio: form.desde })
    setLunes(lunesDe(form.fecha)) // muestra la semana donde quedó el bloque
    return nuevos.length ? `${nuevos.length} bloque(s) guardado(s).` : 'Esos bloques ya estaban publicados.'
  })

  const eliminar = () => {
    if (!bloqueDelForm || !window.confirm('¿Seguro que deseas eliminar este bloque?')) return
    return ejecutar(async () => { await eliminarBloque(bloqueDelForm.id); setSeleccion(null); return 'Bloque eliminado.' })
  }

  return (
    <>
      <div className="ag-head">
        <h1>Tu agenda, con calma</h1>
        <p>Gestiona tus citas y los bloques que ofreces a tus pacientes.</p>
      </div>

      {reprogramando && (
        <p className="ag-aviso ag-aviso--accion" role="status">
          Elige un bloque disponible para reprogramar la cita {reprogramando}. Puedes cambiar de semana.
          <button type="button" onClick={() => setReprogramando(null)}>Cancelar</button>
        </p>
      )}
      {error && <p className="ag-error" role="alert">{error}</p>}
      {aviso && <p className="ag-aviso" role="status">{aviso}</p>}

      <div className="ag-layout">
        <div className="ag-col">
          <AgendaSemana
            lunes={lunes}
            dias={dias}
            bloques={datos?.lunes === lunes ? datos.bloques : []}
            citas={datos?.lunes === lunes ? datos.citas : []}
            cargando={cargando}
            reprogramando={reprogramando !== null}
            seleccion={seleccion}
            onSeleccionar={seleccionar}
            onAnterior={() => irASemana(sumarDias(lunes, -7))}
            onSiguiente={() => irASemana(sumarDias(lunes, 7))}
            onHoy={() => irASemana(lunesDe(proximoDiaHabil()))}
          />

          {citaSeleccionada && (
            <CitaSeleccionada
              cita={citaSeleccionada}
              ocupado={ocupado}
              reprogramando={reprogramando === citaSeleccionada.codigo}
              onReprogramar={() => { setError(''); setAviso(''); setReprogramando(citaSeleccionada.codigo) }}
              onSalirReprogramar={() => setReprogramando(null)}
              onAceptar={() => aceptar(citaSeleccionada.codigo)}
              onRechazar={() => rechazar(citaSeleccionada.codigo)}
              onCancelar={() => cancelar(citaSeleccionada.codigo)}
            />
          )}
        </div>

        <BloqueDisponible
          form={form}
          existe={!!bloqueDelForm}
          conCitaActiva={conCitaActiva}
          ocupado={ocupado}
          onCambio={(cambios) => setForm((actual) => ({ ...actual, ...cambios }))}
          onGuardar={guardar}
          onNuevo={() => { setSeleccion(null); setError(''); setAviso(''); setForm(formularioInicial()) }}
          onEliminar={eliminar}
        />
      </div>
    </>
  )
}
