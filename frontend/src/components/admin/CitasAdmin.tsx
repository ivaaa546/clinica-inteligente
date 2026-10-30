import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EstadoCita from '../EstadoCita'
import { cancelarCitaAdmin, listarCitasAdmin } from '../../services/adminService'
import { formatearFecha } from '../../shared/lib/fechas'
import { normalizar } from '../../shared/lib/texto'
import type { CitaAdmin } from '../../shared/types/admin'
import type { EstadoCita as Estado } from '../../shared/types/cita'
import '../../shared/styles/medical.css'
import './CitasAdmin.css'

interface Props {
  /** Muestra solo las primeras N citas (tarjeta dentro de "Usuarios") y un enlace a la lista completa */
  limite?: number
}

const ESTADOS: Estado[] = ['PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'REPROGRAMADA', 'COMPLETADA']
const ETIQUETA_ESTADO: Record<Estado, string> = {
  PENDIENTE: 'Pendiente', ACEPTADA: 'Aceptada', RECHAZADA: 'Rechazada', CANCELADA: 'Cancelada', REPROGRAMADA: 'Reprogramada', COMPLETADA: 'Completada',
}
/** Administración de citas: el administrador solo cancela citas futuras (no ve datos clínicos). */
export default function CitasAdmin({ limite }: Props) {
  const [citas, setCitas] = useState<CitaAdmin[] | null>(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [filtro, setFiltro] = useState<Estado | 'TODOS'>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')
  const [errorAccion, setErrorAccion] = useState('')


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

  const hayMas = limite !== undefined && (citas?.length ?? 0) > limite

  return (
    <section className="md-card ca" aria-labelledby="ca-titulo">
      <h2 id="ca-titulo">Citas</h2>
      <p className="md-ayuda">Gestiona la cancelación de citas futuras. Solo el médico asignado puede aceptar o rechazar solicitudes.</p>

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
                    <button type="button" className="md-btn md-btn--peligro" disabled={ocupado} onClick={() => cancelar(c)}>Cancelar cita</button>
                  )}
                </div>
              </div>


            </li>
          )
        })}
      </ul>

      {hayMas && <Link to="/admin/citas" className="ad-enlace">Ver todas las citas →</Link>}
    </section>
  )
}
