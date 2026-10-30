import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, Info, Mail } from 'lucide-react'
import { actualizarUsuario, cambiarEstadoUsuario, obtenerUsuario } from '../../services/adminService'
import { useSesion } from '../../features/auth/hooks/useSesion'
import type { RolUsuario, Usuario } from '../../types/admin'
import '../../components/medico/medico.css'
import './admin.css'

const ROL_TEXTO: Record<RolUsuario, string> = { PACIENTE: 'Paciente', MEDICO: 'Médico', ADMINISTRADOR: 'Administrador' }

export default function EditarUsuario() {
  const { usuarioId = '' } = useParams()
  const navigate = useNavigate()
  const { user: sesion } = useSesion()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ nombre: '', apellidos: '', correo: '', telefono: '' })
  const [activo, setActivo] = useState(true)
  const [cargaError, setCargaError] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let vigente = true
    obtenerUsuario(usuarioId)
      .then((u) => {
        if (!vigente) return
        setUsuario(u)
        setForm({ nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, telefono: u.telefono })
        setActivo(u.activo)
      })
      .catch((e: Error) => { if (vigente) setCargaError(e.message) })
    return () => { vigente = false }
  }, [usuarioId])

  if (cargaError) {
    return (
      <>
        <p className="md-alerta" role="alert">{cargaError}</p>
        <Link to="/admin/usuarios" className="md-btn md-btn--borde" style={{ alignSelf: 'flex-start' }}>Volver a usuarios</Link>
      </>
    )
  }
  if (!usuario) return <p className="md-estado">Cargando cuenta…</p>

  const cambiar = (campo: keyof typeof form, valor: string) => { setForm({ ...form, [campo]: valor }); setAviso('') }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setAviso(''); setGuardando(true)
    try {
      let actual = await actualizarUsuario(usuario.id, form)
      if (activo !== actual.activo) actual = await cambiarEstadoUsuario(usuario.id, activo, sesion?.correo ?? '')
      setUsuario(actual)
      setAviso('Cambios guardados.')
    } catch (err) {
      setError((err as Error).message)
      setActivo(usuario.activo) // si el cambio de estado fue rechazado, el interruptor vuelve a su valor real
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Editar usuario</h1>
          <p className="ad-migas"><Link to="/admin/usuarios">Usuarios</Link> / Editar cuenta</p>
        </div>
      </div>

      <div className="ad-2col">
        <form className="md-card" onSubmit={guardar} noValidate aria-labelledby="eu-titulo">
          <h2 id="eu-titulo">Datos de cuenta (no clínicos)</h2>

          <div className="md-campo">
            <label htmlFor="eu-nombre">Nombre</label>
            <input id="eu-nombre" type="text" value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
          </div>
          <div className="md-campo">
            <label htmlFor="eu-apellidos">Apellidos</label>
            <input id="eu-apellidos" type="text" value={form.apellidos} onChange={(e) => cambiar('apellidos', e.target.value)} />
          </div>
          <div className="md-campo">
            <label htmlFor="eu-correo">Correo electrónico</label>
            <span className="ad-clave">
              <input id="eu-correo" type="email" value={form.correo} onChange={(e) => cambiar('correo', e.target.value)} />
              <Mail size={16} aria-hidden="true" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#4f6e5b' }} />
            </span>
          </div>
          <div className="md-grid2">
            <div className="md-campo"><span>Rol</span><div className="md-caja" title="El rol no se puede cambiar">{ROL_TEXTO[usuario.rol]}</div></div>
            <div className="md-campo">
              <label htmlFor="eu-telefono">Teléfono de contacto</label>
              <input id="eu-telefono" type="tel" value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />
            </div>
          </div>
          <p className="md-ayuda">Solo se editan datos de cuenta. No se muestran ni modifican antecedentes, signos, diagnósticos, recetas ni datos clínicos.</p>

          <hr style={{ width: '100%', border: 0, borderTop: '1px solid var(--color-border)', margin: 0 }} />

          <h3 style={{ margin: 0, fontSize: 16 }}>Estado de la cuenta</h3>
          <p className="md-aviso"><Info size={15} aria-hidden="true" /> La cuenta está {usuario.activo ? 'activa' : 'inactiva'}. Si se desactiva, el usuario no podrá iniciar sesión, pero se conservarán sus citas y registros existentes.</p>
          <div className="ad-interruptor">
            <div>
              <strong>Cuenta activa</strong>
              <small>Se conserva el historial si desactivas la cuenta.</small>
            </div>
            <label className="ad-switch">
              <input type="checkbox" role="switch" aria-label="Cuenta activa" checked={activo} onChange={(e) => { setActivo(e.target.checked); setAviso('') }} />
              <span />
            </label>
          </div>

          {error && <p className="md-alerta" role="alert">{error}</p>}
          {aviso && <p className="md-aviso" role="status">{aviso}</p>}

          <div className="md-acciones">
            <button type="submit" className="md-btn md-btn--primario" disabled={guardando}><Check size={16} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Guardar cambios'}</button>
            <button type="button" className="md-btn md-btn--borde" disabled={guardando} onClick={() => navigate('/admin/usuarios')}>Cancelar</button>
          </div>
        </form>

        <aside className="ad-col" aria-label="Acceso">
          <section className="md-card">
            <h2>Acceso autorizado</h2>
            <p><span className="md-chip md-chip--amarillo">Administrador</span></p>
            <p className="md-ayuda">Solo un administrador puede editar datos de cuenta y cambiar el estado de la cuenta.</p>
            <hr style={{ width: '100%', border: 0, borderTop: '1px solid var(--color-border)', margin: 0 }} />
            <p className="md-ayuda">Solo se editan datos de cuenta; el administrador no modifica registros clínicos.</p>
          </section>
          <p className="md-ayuda"><Info size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> Rol de esta cuenta: {ROL_TEXTO[usuario.rol]}.</p>
        </aside>
      </div>
    </>
  )
}
