import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Info, Plus, Search } from 'lucide-react'
import CitasAdmin from '../../components/admin/CitasAdmin'
import { cambiarEstadoUsuario, enviarRecuperacion, listarUsuarios, nombreCompleto } from '../../services/adminService'
import { useSesion } from '../../auth/useSesion'
import { normalizar } from '../../lib/texto'
import type { RolUsuario, Usuario } from '../../types/admin'
import '../../components/medico/medico.css'
import './admin.css'

type FiltroRol = 'TODOS' | RolUsuario
type FiltroEstado = 'TODOS' | 'ACTIVOS' | 'INACTIVOS'

const ROLES: { valor: FiltroRol; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PACIENTE', etiqueta: 'Paciente' },
  { valor: 'MEDICO', etiqueta: 'Médico' },
  { valor: 'ADMINISTRADOR', etiqueta: 'Administrador' },
]
const ROL_TEXTO: Record<RolUsuario, string> = { PACIENTE: 'Paciente', MEDICO: 'Médico', ADMINISTRADOR: 'Administrador' }
const SIGUIENTE_ESTADO: Record<FiltroEstado, FiltroEstado> = { TODOS: 'ACTIVOS', ACTIVOS: 'INACTIVOS', INACTIVOS: 'TODOS' }
const ETIQUETA_ESTADO: Record<FiltroEstado, string> = { TODOS: 'Estado: Todos', ACTIVOS: 'Estado: Activos', INACTIVOS: 'Estado: Inactivos' }

export default function Usuarios() {
  const ubicacion = useLocation()
  const { user: sesion } = useSesion()
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [rol, setRol] = useState<FiltroRol>('TODOS')
  const [estado, setEstado] = useState<FiltroEstado>('TODOS')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState((ubicacion.state as { aviso?: string } | null)?.aviso ?? '')
  const [errorAccion, setErrorAccion] = useState('')

  useEffect(() => {
    let vigente = true
    listarUsuarios()
      .then((lista) => { if (vigente) { setUsuarios(lista); setError('') } })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [version])

  const esPropia = (u: Usuario) => normalizar(u.correo) === normalizar(sesion?.correo ?? '')

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda)
    return (usuarios ?? []).filter((u) =>
      (rol === 'TODOS' || u.rol === rol) &&
      (estado === 'TODOS' || (estado === 'ACTIVOS') === u.activo) &&
      (!texto || normalizar(`${nombreCompleto(u)} ${u.correo}`).includes(texto)))
  }, [usuarios, busqueda, rol, estado])

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

  const alternarEstado = (u: Usuario) => {
    if (u.activo && !window.confirm(`¿Desactivar la cuenta de ${nombreCompleto(u)}? No podrá iniciar sesión, pero se conserva su historial.`)) return
    void ejecutar(async () => {
      await cambiarEstadoUsuario(u.id, !u.activo, sesion?.correo ?? '')
      return u.activo ? `Cuenta de ${nombreCompleto(u)} desactivada.` : `Cuenta de ${nombreCompleto(u)} activada.`
    })
  }

  const recuperar = (u: Usuario) =>
    ejecutar(async () => `Se envió el enlace de recuperación de contraseña a ${await enviarRecuperacion(u.id)}.`)

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Usuarios</h1>
          <p>Crea cuentas de médicos, edita datos no clínicos y activa/desactiva accesos sin afectar historial.</p>
        </div>
        <Link to="/admin/usuarios/nuevo-medico" className="md-btn md-btn--primario"><Plus size={16} aria-hidden="true" /> Crear médico</Link>
      </div>

      {aviso && <p className="md-aviso" role="status">{aviso}</p>}
      {(errorAccion || error) && <p className="md-alerta" role="alert">{errorAccion || error}</p>}

      <section className="md-card" aria-label="Cuentas de usuario">
        <div className="ad-filtros">
          <div className="md-campo ad-buscar">
            <label htmlFor="us-buscar">Buscar usuario</label>
            <div className="ad-buscar__campo">
              <input id="us-buscar" type="search" value={busqueda} placeholder="Nombre o correo electrónico" autoComplete="off" onChange={(e) => setBusqueda(e.target.value)} />
              <Search size={16} aria-hidden="true" />
            </div>
          </div>
          <div className="md-campo">
            <span id="us-filtro">Filtrar por rol y estado</span>
            <div className="ad-chips" role="group" aria-labelledby="us-filtro">
              {ROLES.map(({ valor, etiqueta }) => (
                <button key={valor} type="button" className="ad-chipbtn" aria-pressed={rol === valor} onClick={() => setRol(valor)}>{etiqueta}</button>
              ))}
              <button type="button" className="ad-chipbtn" aria-pressed={estado !== 'TODOS'} onClick={() => setEstado(SIGUIENTE_ESTADO[estado])}>{ETIQUETA_ESTADO[estado]}</button>
            </div>
          </div>
        </div>

        {!usuarios && !error && <p className="md-estado">Cargando cuentas…</p>}
        {usuarios && visibles.length === 0 && <p className="ad-vacio">No hay cuentas que coincidan con los filtros.</p>}

        {visibles.length > 0 && (
          <table className="md-tabla ad-tabla">
            <thead>
              <tr><th scope="col">NOMBRE</th><th scope="col">CONTACTO</th><th scope="col">ROL</th><th scope="col">ESTADO</th><th scope="col">ACCIONES</th></tr>
            </thead>
            <tbody>
              {visibles.map((u) => (
                <tr key={u.id}>
                  <td data-label="Nombre"><strong>{nombreCompleto(u)}</strong></td>
                  <td data-label="Contacto" className="ad-contacto">{u.correo} · {u.telefono}</td>
                  <td data-label="Rol">{ROL_TEXTO[u.rol]}</td>
                  <td data-label="Estado"><span className={`ad-estado ${u.activo ? '' : 'ad-estado--off'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td data-label="Acciones">
                    <div className="ad-acciones">
                      <div className="ad-acciones__fila">
                        <Link to={`/admin/usuarios/${u.id}`} className="ad-enlace">Editar</Link>
                        <button
                          type="button" className={`ad-enlace ${u.activo ? 'ad-enlace--peligro' : ''}`} disabled={ocupado || (u.activo && esPropia(u))}
                          title={esPropia(u) ? 'No puedes desactivar tu propia cuenta' : undefined} onClick={() => alternarEstado(u)}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                      <button type="button" className="ad-enlace ad-enlace--suave" disabled={ocupado} onClick={() => recuperar(u)}>Enviar recuperación de contraseña</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {usuarios && <p className="ad-pie">Mostrando {visibles.length} de {usuarios.length} cuentas · Al desactivar se conserva el historial.</p>}
      </section>

      <CitasAdmin limite={3} />

      <p className="md-ayuda ad-nota"><Info size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> Conservación de historial: no se eliminan cuentas con citas, consultas o recetas registradas.</p>
    </>
  )
}
