import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EstadoCita from '../EstadoCita'
import {
  cancelarCitaAdmin, listarCitasAdmin, listarHuecosCita, reprogramarCitaAdmin,
} from '../../services/adminService'
import { diaSemana, formatearFecha } from '../../lib/fechas'
import { normalizar } from '../../lib/texto'
import type { CitaAdmin, Hueco } from '../../types/admin'
import type { EstadoCita as Estado } from '../../types/cita'
import '../medico/medico.css'
import './CitasAdmin.css'

interface Props {
  /** Muestra solo las primeras N citas (tarjeta dentro de "Usuarios") y un enlace a la lista completa */
  limite?: number
}

const ESTADOS: Estado[] = ['PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'REPROGRAMADA', 'COMPLETADA']
const ETIQUETA_ESTADO: Record<Estado, string> = {
  PENDIENTE: 'Pendiente', ACEPTADA: 'Aceptada', RECHAZADA: 'Rechazada', CANCELADA: 'Cancelada', REPROGRAMADA: 'Reprogramada', COMPLETADA: 'Completada',
}
const diaCorto = (iso: string) => `${diaSemana(iso).slice(0, 3)} ${formatearFecha(iso).slice(0, 6)}`

/** Administración de citas: el administrador solo cancela o reprograma citas futuras (no ve datos clínicos). */
export default function CitasAdmin({ limite }: Props) {
  const [citas, setCitas] = useState<CitaAdmin[] | null>(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [filtro, setFiltro] = useState<Estado | 'TODOS'>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [abierta, setAbierta] = useState<string | null>(null)
  const [huecos, setHuecos] = useState<Hueco[]>([])
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  useEffect(() => {
    let vigente = true
    listarCitasAdmin()
      .then((lista) => { if (vigente) { setCitas(lista); setError('') } })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [version])

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda)
    const lista = (citas ?? []).filter((c) =>
      (filtro === 'TODOS' || c.estado === filtro) &&
      (!texto || normalizar(`${c.codigo} ${c.paciente} ${c.medico}`).includes(texto)))
    return limite ? lista.slice(0, limite) : lista
  }, [citas, filtro, busqueda, limite])

  const ejecutar = async (accion: () => Promise<string>) => {
    setOcupado(true); setErrorAccion(''); setAviso('')
    try {
      setAviso(await accion())
      setAbierta(null)
      setVersion((v) => v + 1)
    } catch (e) {
      setErrorAccion((e as Error).message)
    } finally {
      setOcupado(false)
    }
  }

  const cancelar = (c: CitaAdmin) => {
    if (!window.confirm(`¿Cancelar la cita ${c.codigo} de ${c.paciente}?`)) return
    void ejecutar(async () => { await cancelarCitaAdmin(c.codigo); return `Cita ${c.codigo} cancelada.` })
  }

  const abrirReprogramar = async (c: CitaAdmin) => {
    setErrorAccion(''); setAviso(''); setAbierta(c.codigo); setFecha(''); setHora(''); setHuecos([])
    try {
      setHuecos(await listarHuecosCita(c.codigo))
    } catch (e) {
      setErrorAccion((e as Error).message)
      setAbierta(null)
    }
  }

  const confirmarReprogramar = (c: CitaAdmin) =>
    ejecutar(async () => {
      const nueva = await reprogramarCitaAdmin(c.codigo, fecha, hora)
      return `Cita ${c.codigo} reprogramada. La nueva solicitud ${nueva.codigo} quedó pendiente.`
    })

  const dias = [...new Set(huecos.map((h) => h.fecha))]
  const horas = huecos.filter((h) => h.fecha === fecha)
  const hayMas = limite !== undefined && (citas?.length ?? 0) > limite

  return (
    <section className="md-card ca" aria-labelledby="ca-titulo">
      <h2 id="ca-titulo">Citas</h2>
      <p className="md-ayuda">Gestiona citas futuras: cancelar o reprogramar antes del inicio. Solo el médico asignado puede aceptar o rechazar solicitudes.</p>

      {!limite && (
        <div className="ca-filtros">
          <div className="md-campo">
            <label htmlFor="ca-buscar">Buscar cita</label>
            <input id="ca-buscar" type="search" value={busqueda} placeholder="Código, paciente o médico" onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div className="md-campo">
            <label htmlFor="ca-estado">Estado</label>
            <select id="ca-estado" value={filtro} onChange={(e) => setFiltro(e.target.value as Estado | 'TODOS')}>
              <option value="TODOS">Todos</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>)}
            </select>
          </div>
        </div>
      )}

      {aviso && <p className="md-aviso" role="status">{aviso}</p>}
      {(errorAccion || error) && <p className="md-alerta" role="alert">{errorAccion || error}</p>}

      {!citas && !error && <p className="md-estado">Cargando citas…</p>}
      {citas && visibles.length === 0 && <p className="md-estado">No hay citas para mostrar.</p>}

      <ul className="ca-lista">
        {visibles.map((c) => {
          const modificable = (c.estado === 'PENDIENTE' || c.estado === 'ACEPTADA') && c.futura
          return (
            <li key={c.codigo} className="ca-fila">
              <div className="ca-fila__principal">
                <div className="ca-fila__cita">
                  <strong>{c.codigo} · {formatearFecha(c.fecha)}</strong>
                  <small>{c.hora} h · {c.modalidad === 'VIDEOLLAMADA' ? 'Videollamada' : 'Cita médica'}</small>
                </div>
                <div className="ca-fila__personas">
                  <strong>{c.paciente}</strong>
                  <small>{c.medico} · {c.especialidad}</small>
                </div>
                <EstadoCita estado={c.estado} />
                <div className="ca-fila__acciones">
                  {modificable && (
                    <>
                      <button type="button" className="md-btn md-btn--borde" disabled={ocupado} onClick={() => abrirReprogramar(c)}>Reprogramar</button>
                      <button type="button" className="md-btn md-btn--peligro" disabled={ocupado} onClick={() => cancelar(c)}>Cancelar cita</button>
                    </>
                  )}
                </div>
              </div>

              {abierta === c.codigo && (
                <div className="ca-reprogramar">
                  {huecos.length === 0 ? (
                    <p className="md-ayuda">Buscando horarios disponibles del médico…</p>
                  ) : (
                    <>
                      <div className="md-campo">
                        <label htmlFor={`ca-fecha-${c.codigo}`}>Nuevo día</label>
                        <select id={`ca-fecha-${c.codigo}`} value={fecha} onChange={(e) => { setFecha(e.target.value); setHora('') }}>
                          <option value="">Elegir día</option>
                          {dias.map((d) => <option key={d} value={d}>{diaCorto(d)}</option>)}
                        </select>
                      </div>
                      <div className="md-campo">
                        <label htmlFor={`ca-hora-${c.codigo}`}>Nueva hora</label>
                        <select id={`ca-hora-${c.codigo}`} value={hora} disabled={!fecha} onChange={(e) => setHora(e.target.value)}>
                          <option value="">Elegir hora</option>
                          {horas.map((h) => <option key={h.inicio} value={h.inicio}>{h.inicio}–{h.fin}</option>)}
                        </select>
                      </div>
                      <button type="button" className="md-btn md-btn--primario" disabled={!fecha || !hora || ocupado} onClick={() => confirmarReprogramar(c)}>Confirmar</button>
                    </>
                  )}
                  <button type="button" className="md-btn md-btn--borde" onClick={() => setAbierta(null)}>Cancelar</button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {hayMas && <Link to="/admin/citas" className="ad-enlace">Ver todas las citas →</Link>}
    </section>
  )
}
