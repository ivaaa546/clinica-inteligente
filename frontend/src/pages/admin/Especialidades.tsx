import { useEffect, useMemo, useState } from 'react'
import { Info, Lock, Plus } from 'lucide-react'
import {
  actualizarEspecialidad, crearEspecialidad, eliminarEspecialidad, listarEspecialidades,
} from '../../services/adminService'
import { normalizar } from '../../shared/lib/texto'
import type { EspecialidadAdmin } from '../../types/admin'
import '../../components/medico/medico.css'
import './admin.css'

type FiltroEstado = 'TODAS' | 'ACTIVAS' | 'INACTIVAS'

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** Lista de nombres: "Elena Torres Vega y Pablo Ríos" */
const unir = (nombres: string[]) => (nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0] ?? '')

interface PanelProps {
  /** null = crear una nueva */
  especialidad: EspecialidadAdmin | null
  ocupado: boolean
  onGuardar: (nombre: string, activa: boolean) => void
  onCancelar: () => void
}

/** Panel lateral. Se vuelve a montar (con `key`) cuando cambia la especialidad elegida. */
function PanelEdicion({ especialidad, ocupado, onGuardar, onCancelar }: PanelProps) {
  const [nombre, setNombre] = useState(especialidad?.nombre ?? '')
  const [activa, setActiva] = useState(especialidad?.activa ?? true)

  return (
    <section className="md-card" aria-labelledby="es-panel">
      <h2 id="es-panel">{especialidad ? 'Editar especialidad' : 'Crear especialidad'}</h2>
      {especialidad && <p className="md-ayuda">{especialidad.nombre}</p>}

      <div className="md-campo">
        <label htmlFor="es-nombre">Nombre *</label>
        <input id="es-nombre" type="text" value={nombre} placeholder="Nombre de la especialidad" onChange={(e) => setNombre(e.target.value)} />
        <p className="md-ayuda">El nombre es obligatorio y no puede repetirse en el catálogo.</p>
      </div>
      <div className="md-campo">
        <label htmlFor="es-estado">Estado</label>
        <select id="es-estado" value={activa ? 'ACTIVA' : 'INACTIVA'} onChange={(e) => setActiva(e.target.value === 'ACTIVA')}>
          <option value="ACTIVA">Activa</option>
          <option value="INACTIVA">Inactiva</option>
        </select>
        <p className="md-ayuda">Las especialidades activas están disponibles al crear o editar un médico.</p>
      </div>

      <button type="button" className="md-btn md-btn--primario md-btn--bloque" disabled={ocupado} onClick={() => onGuardar(nombre, activa)}>
        {especialidad ? 'Guardar cambios' : 'Crear especialidad'}
      </button>
      <button type="button" className="md-btn md-btn--borde md-btn--bloque" disabled={ocupado} onClick={onCancelar}>Cancelar</button>
    </section>
  )
}

export default function Especialidades() {
  const [lista, setLista] = useState<EspecialidadAdmin[] | null>(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<FiltroEstado>('TODAS')
  const [seleccionId, setSeleccionId] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')
  const [errorAccion, setErrorAccion] = useState('')

  useEffect(() => {
    let vigente = true
    listarEspecialidades()
      .then((datos) => { if (vigente) { setLista(datos); setError('') } })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [version])

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda)
    return (lista ?? []).filter((e) =>
      (estado === 'TODAS' || (estado === 'ACTIVAS') === e.activa) && (!texto || normalizar(e.nombre).includes(texto)))
  }, [lista, busqueda, estado])

  // Por defecto el panel muestra la primera especialidad del catálogo
  const seleccionada = creando ? null : (lista?.find((e) => e.id === seleccionId) ?? lista?.[0] ?? null)

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

  const alternar = (e: EspecialidadAdmin) => {
    if (e.activa && e.medicosActivos > 0 &&
      !window.confirm(`${e.nombre} tiene ${plural(e.medicosActivos, 'médico activo', 'médicos activos')}. Si la desactivas, no se podrá elegir para nuevos médicos. ¿Continuar?`)) return
    void ejecutar(async () => {
      await actualizarEspecialidad(e.id, { nombre: e.nombre, activa: !e.activa })
      return e.activa ? `${e.nombre} desactivada.` : `${e.nombre} activada.`
    })
  }

  const eliminar = (e: EspecialidadAdmin) => {
    if (!window.confirm(`¿Eliminar la especialidad ${e.nombre}? Esta acción no se puede deshacer.`)) return
    void ejecutar(async () => {
      await eliminarEspecialidad(e.id)
      setSeleccionId(null)
      return `${e.nombre} eliminada.`
    })
  }

  const guardar = (nombre: string, activa: boolean) =>
    ejecutar(async () => {
      if (creando) {
        const nueva = await crearEspecialidad(nombre, activa)
        setCreando(false)
        setSeleccionId(nueva.id)
        return `${nueva.nombre} creada.`
      }
      if (!seleccionada) return ''
      await actualizarEspecialidad(seleccionada.id, { nombre, activa })
      return 'Cambios guardados.'
    })

  const total = lista?.length ?? 0
  const activas = lista?.filter((e) => e.activa).length ?? 0

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Especialidades</h1>
          <p>Gestiona el catálogo de especialidades y su disponibilidad para los médicos.</p>
        </div>
        <button type="button" className="md-btn md-btn--primario" onClick={() => { setCreando(true); setAviso(''); setErrorAccion('') }}>
          <Plus size={16} aria-hidden="true" /> Crear especialidad
        </button>
      </div>

      {aviso && <p className="md-aviso" role="status">{aviso}</p>}
      {(errorAccion || error) && <p className="md-alerta" role="alert">{errorAccion || error}</p>}

      <div className="ad-2col es-layout">
        <div className="ad-col">
          <section className="md-card" aria-labelledby="es-catalogo">
            <h2 id="es-catalogo">Catálogo de especialidades</h2>
            <div className="ad-filtros">
              <div className="md-campo ad-buscar">
                <label htmlFor="es-buscar">Buscar especialidad</label>
                <input id="es-buscar" type="search" value={busqueda} placeholder="Buscar por nombre" autoComplete="off" onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <div className="md-campo" style={{ minWidth: 150 }}>
                <label htmlFor="es-filtro">Estado</label>
                <select id="es-filtro" value={estado} onChange={(e) => setEstado(e.target.value as FiltroEstado)}>
                  <option value="TODAS">Todas</option>
                  <option value="ACTIVAS">Activas</option>
                  <option value="INACTIVAS">Inactivas</option>
                </select>
              </div>
            </div>

            {!lista && !error && <p className="md-estado">Cargando especialidades…</p>}
            {lista && visibles.length === 0 && <p className="ad-vacio">No hay especialidades que coincidan.</p>}

            {visibles.length > 0 && (
              <table className="md-tabla ad-tabla">
                <thead>
                  <tr><th scope="col">NOMBRE ÚNICO</th><th scope="col">ESTADO</th><th scope="col">MÉDICOS ACTIVOS</th><th scope="col">ACCIONES</th></tr>
                </thead>
                <tbody>
                  {visibles.map((e) => (
                    <tr key={e.id} className={seleccionada?.id === e.id ? 'es-fila--elegida' : undefined}>
                      <td data-label="Nombre">
                        <strong>{e.nombre}</strong>
                        {e.medicos.length > 0 && <small>{e.medicos.join(' · ')}</small>}
                      </td>
                      <td data-label="Estado"><span className={`ad-estado ${e.activa ? '' : 'ad-estado--off'}`}>{e.activa ? 'Activa' : 'Inactiva'}</span></td>
                      <td data-label="Médicos activos"><strong>{e.medicosActivos}</strong></td>
                      <td data-label="Acciones">
                        <div className="ad-acciones">
                          <div className="ad-acciones__fila">
                            <button type="button" className="ad-enlace" onClick={() => { setCreando(false); setSeleccionId(e.id); setAviso(''); setErrorAccion('') }}>Editar</button>
                            <button type="button" className="ad-enlace" disabled={ocupado} onClick={() => alternar(e)}>{e.activa ? 'Desactivar' : 'Activar'}</button>
                          </div>
                          {e.medicosActivos > 0 ? (
                            <button type="button" className="ad-enlace" disabled title="No se puede eliminar mientras esté en uso"><Lock size={12} aria-hidden="true" /> Eliminar bloqueado</button>
                          ) : (
                            <button type="button" className="ad-enlace ad-enlace--peligro" disabled={ocupado} onClick={() => eliminar(e)}>Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {lista && <p className="ad-pie">{plural(total, 'especialidad', 'especialidades')} · {plural(activas, 'activa', 'activas')} y {plural(total - activas, 'inactiva', 'inactivas')}</p>}
          </section>

          {seleccionada && seleccionada.medicosActivos > 0 && (
            <p className="md-aviso md-aviso--amarillo">
              <Info size={15} aria-hidden="true" />
              {seleccionada.nombre} tiene {plural(seleccionada.medicosActivos, 'médico activo', 'médicos activos')}. No se puede eliminar mientras esté en uso; puedes desactivarla como alternativa.
            </p>
          )}
        </div>

        <aside className="ad-col" aria-label="Edición">
          {(creando || seleccionada) && (
            <PanelEdicion
              key={creando ? 'nueva' : `${seleccionada?.id}-${seleccionada?.nombre}-${seleccionada?.activa}`}
              especialidad={seleccionada}
              ocupado={ocupado}
              onGuardar={guardar}
              onCancelar={() => { setCreando(false); setErrorAccion(''); setAviso('') }}
            />
          )}

          {seleccionada && seleccionada.medicosActivos > 0 && (
            <section className="md-card" aria-labelledby="es-uso">
              <h2 id="es-uso" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}><Lock size={16} aria-hidden="true" /> Especialidad en uso</h2>
              <p className="md-ayuda">{unir(seleccionada.medicos)} {seleccionada.medicos.length === 1 ? 'está activo' : 'están activos'} en {seleccionada.nombre}.</p>
              {seleccionada.activa && (
                <button type="button" className="md-btn md-btn--borde md-btn--bloque" disabled={ocupado} onClick={() => alternar(seleccionada)}>Desactivar especialidad</button>
              )}
            </section>
          )}
        </aside>
      </div>
    </>
  )
}
