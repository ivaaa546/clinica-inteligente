import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Check, Eye, EyeOff, Info, Mail } from 'lucide-react'
import { useSesion } from '../../auth/useSesion'
import { actualizarPerfilPersonal, obtenerPerfilPersonal } from '../../services/personalService'
import { cambiarPassword } from '../../services/perfilService'
import type { PerfilPersonal } from '../../types/admin'
import '../../components/medico/medico.css'
import './Cuenta.css'

interface Props {
  /** A dónde regresa "Volver a mi espacio" */
  volverA: string
}

const ROL_TEXTO = { MEDICO: 'Médico', ADMINISTRADOR: 'Administrador', PACIENTE: 'Paciente' }
const CLAVES_VACIAS = { actual: '', nueva: '', confirmar: '' }
const iniciales = (n: string, a: string) => `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase()

/** "Mi cuenta" del personal (médico y administrador): datos personales + cambio de contraseña (pantalla 13 del Figma) */
export default function Cuenta({ volverA }: Props) {
  const { user } = useSesion()
  const [perfil, setPerfil] = useState<PerfilPersonal | null>(null)
  const [datos, setDatos] = useState({ nombre: '', apellidos: '', telefono: '' })
  const [claves, setClaves] = useState(CLAVES_VACIAS)
  const [ver, setVer] = useState({ actual: false, nueva: false, confirmar: false })
  const [error, setError] = useState('')
  const [cargaError, setCargaError] = useState('')
  const [aviso, setAviso] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!user) return
    let vigente = true
    obtenerPerfilPersonal(user)
      .then((p) => {
        if (!vigente) return
        setPerfil(p)
        setDatos({ nombre: p.nombre, apellidos: p.apellidos, telefono: p.telefono })
      })
      .catch((e: Error) => { if (vigente) setCargaError(e.message) })
    return () => { vigente = false }
  }, [user])

  if (cargaError) return <p className="md-alerta" role="alert">{cargaError}</p>
  if (!perfil) return <p className="md-estado">Cargando tu cuenta…</p>

  const quiereCambiarClave = Boolean(claves.actual || claves.nueva || claves.confirmar)

  const cambiarDato = (campo: keyof typeof datos, valor: string) => { setDatos({ ...datos, [campo]: valor }); setAviso('') }
  const cambiarClave = (campo: keyof typeof claves, valor: string) => { setClaves({ ...claves, [campo]: valor }); setAviso('') }

  const cancelar = () => {
    setDatos({ nombre: perfil.nombre, apellidos: perfil.apellidos, telefono: perfil.telefono })
    setClaves(CLAVES_VACIAS)
    setError('')
    setAviso('')
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setAviso('')
    if (!user) return
    if (!datos.nombre.trim() || !datos.apellidos.trim() || !datos.telefono.trim()) {
      return setError('Nombre, apellidos y teléfono son obligatorios.')
    }
    if (quiereCambiarClave) {
      if (!claves.actual) return setError('Escribe tu contraseña actual para cambiarla.')
      if (claves.nueva.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.')
      if (claves.nueva !== claves.confirmar) return setError('La nueva contraseña y su confirmación no coinciden.')
    }

    setGuardando(true)
    try {
      if (quiereCambiarClave) await cambiarPassword({ actual: claves.actual, nueva: claves.nueva })
      const actualizado = await actualizarPerfilPersonal(user, datos)
      setPerfil(actualizado)
      setClaves(CLAVES_VACIAS)
      setAviso(quiereCambiarClave ? 'Cambios guardados y contraseña actualizada.' : 'Cambios guardados.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  const campoClave = (campo: keyof typeof claves, etiqueta: string) => (
    <div className="md-campo">
      <label htmlFor={`pc-${campo}`}>{etiqueta}</label>
      <span className="pc-clave">
        <input
          id={`pc-${campo}`} type={ver[campo] ? 'text' : 'password'} value={claves[campo]} placeholder="••••••••••••"
          autoComplete={campo === 'actual' ? 'current-password' : 'new-password'} onChange={(e) => cambiarClave(campo, e.target.value)}
        />
        <button type="button" onClick={() => setVer({ ...ver, [campo]: !ver[campo] })} aria-label={ver[campo] ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {ver[campo] ? <Eye size={18} color="#4f6e5b" /> : <EyeOff size={18} color="#4f6e5b" />}
        </button>
      </span>
    </div>
  )

  return (
    <form className="pc" onSubmit={guardar} noValidate>
      <Link to={volverA} className="pc-volver">← Volver a mi espacio</Link>

      <div className="md-head">
        <h1>Mi cuenta</h1>
        <p>Actualiza tus datos personales y cuida el acceso a tu cuenta.</p>
      </div>

      <section className="pc-perfil" aria-label="Tu cuenta">
        <span className="pc-perfil__avatar" aria-hidden="true">{iniciales(perfil.nombre, perfil.apellidos)}</span>
        <div>
          <strong>{perfil.nombre} {perfil.apellidos}</strong>
          <small>Tu cuenta personal · {perfil.id}</small>
        </div>
        <span className="pc-perfil__rol">{ROL_TEXTO[perfil.rol]}</span>
      </section>

      <div className="pc-columnas">
        <section className="md-card" aria-labelledby="pc-datos">
          <h2 id="pc-datos">Datos personales</h2>
          <div className="md-campo">
            <label htmlFor="pc-nombre">Nombre</label>
            <input id="pc-nombre" type="text" value={datos.nombre} onChange={(e) => cambiarDato('nombre', e.target.value)} />
          </div>
          <div className="md-campo">
            <label htmlFor="pc-apellidos">Apellidos</label>
            <input id="pc-apellidos" type="text" value={datos.apellidos} onChange={(e) => cambiarDato('apellidos', e.target.value)} />
          </div>
          <div className="md-campo">
            <span>Correo electrónico</span>
            <div className="md-caja pc-correo" title="Es el correo con el que inicias sesión">{perfil.correo} <Mail size={16} aria-hidden="true" /></div>
          </div>
          <div className="md-campo">
            <label htmlFor="pc-telefono">Teléfono</label>
            <input id="pc-telefono" type="tel" value={datos.telefono} onChange={(e) => cambiarDato('telefono', e.target.value)} />
          </div>
          {perfil.rol === 'MEDICO' && (
            <div className="md-grid2">
              <div className="md-campo"><span>Especialidad</span><div className="md-caja">{perfil.especialidad ?? '—'}</div></div>
              <div className="md-campo"><span>N.º profesional</span><div className="md-caja">{perfil.numeroProfesional ?? '—'}</div></div>
            </div>
          )}
        </section>

        <section className="md-card pc-clave-card" aria-labelledby="pc-cambiar">
          <h2 id="pc-cambiar">Cambiar contraseña</h2>
          {campoClave('actual', 'Contraseña actual')}
          {campoClave('nueva', 'Nueva contraseña')}
          {campoClave('confirmar', 'Confirmar nueva contraseña')}
          <p className="md-aviso"><Info size={15} aria-hidden="true" /> La nueva contraseña y su confirmación deben coincidir. Usa al menos 8 caracteres. Si no quieres cambiarla, déjala en blanco.</p>
        </section>
      </div>

      <section className="md-card pc-pie" aria-label="Guardar cambios">
        <div>
          <strong>
            {error ? <span className="pc-error" role="alert">{error}</span> : aviso ? <span role="status">{aviso}</span> : 'Solo se modifican los datos de tu cuenta.'}
          </strong>
          <small>Tu cuenta permite actualizar tus datos personales, pero no modificar información clínica.</small>
        </div>
        <div className="md-acciones">
          <button type="button" className="md-btn md-btn--borde" onClick={cancelar} disabled={guardando}>Cancelar</button>
          <button type="submit" className="md-btn md-btn--primario" disabled={guardando}>
            <Check size={16} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </section>
    </form>
  )
}
