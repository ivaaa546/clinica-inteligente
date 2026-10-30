import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CircleCheck, Eye, EyeOff, Info, Lock, Mail, Plus } from 'lucide-react'
import { crearMedico, listarEspecialidades } from '../../services/adminService'
import type { EspecialidadAdmin, NuevoMedico } from '../../shared/types/admin'
import '../../shared/styles/medical.css'
import './admin.css'

const VACIO: NuevoMedico = {
  nombre: '', apellidos: '', correo: '', telefono: '', contrasena: '', confirmar: '', numeroProfesional: '', especialidadId: '',
}

export default function CrearMedico() {
  const navigate = useNavigate()
  const [form, setForm] = useState<NuevoMedico>(VACIO)
  const [especialidades, setEspecialidades] = useState<EspecialidadAdmin[] | null>(null)
  const [ver, setVer] = useState({ contrasena: false, confirmar: false })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let vigente = true
    listarEspecialidades()
      .then((lista) => { if (vigente) setEspecialidades(lista.filter((e) => e.activa)) })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [])

  const cambiar = (campo: keyof NuevoMedico, valor: string) => { setForm({ ...form, [campo]: valor }); setError('') }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const medico = await crearMedico(form)
      navigate('/admin/usuarios', { state: { aviso: `Médico ${medico.nombre} ${medico.apellidos} creado. Ya puede iniciar sesión con su correo.` } })
    } catch (err) {
      setError((err as Error).message)
      setEnviando(false)
    }
  }

  const texto = (campo: keyof NuevoMedico, etiqueta: string, extra: { tipo?: string; placeholder?: string } = {}) => (
    <div className="md-campo">
      <label htmlFor={`cm-${campo}`}>{etiqueta} *</label>
      <input
        id={`cm-${campo}`} type={extra.tipo ?? 'text'} value={form[campo]} placeholder={extra.placeholder}
        autoComplete={campo === 'correo' ? 'off' : undefined} onChange={(e) => cambiar(campo, e.target.value)}
      />
    </div>
  )

  const clave = (campo: 'contrasena' | 'confirmar', etiqueta: string) => (
    <div className="md-campo">
      <label htmlFor={`cm-${campo}`}>{etiqueta} *</label>
      <span className="ad-clave">
        <input id={`cm-${campo}`} type={ver[campo] ? 'text' : 'password'} value={form[campo]} autoComplete="new-password" onChange={(e) => cambiar(campo, e.target.value)} />
        <button type="button" onClick={() => setVer({ ...ver, [campo]: !ver[campo] })} aria-label={ver[campo] ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {ver[campo] ? <Eye size={18} color="#4f6e5b" /> : <EyeOff size={18} color="#4f6e5b" />}
        </button>
      </span>
    </div>
  )

  return (
    <>
      <div className="ad-head">
        <div>
          <p className="ad-migas"><Link to="/admin/usuarios">USUARIOS</Link> / MÉDICOS</p>
          <h1>Crear médico</h1>
          <p>Registra manualmente un nuevo profesional desde el panel administrativo. Solo el administrador puede crear cuentas médicas.</p>
        </div>
      </div>

      <form className="md-card cm" onSubmit={enviar} noValidate aria-labelledby="cm-titulo">
        <div>
          <p className="ad-migas" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>DATOS PROFESIONALES</p>
          <h2 id="cm-titulo" style={{ fontSize: 24 }}>Alta de médico</h2>
          <p className="md-ayuda">Todos los campos marcados con * son obligatorios. El administrador debe validar la información antes de crear la cuenta.</p>
        </div>

        {texto('nombre', 'Nombre')}
        {texto('apellidos', 'Apellidos')}
        <div className="md-campo">
          <label htmlFor="cm-correo">Correo electrónico único *</label>
          <span className="ad-clave">
            <input id="cm-correo" type="email" value={form.correo} autoComplete="off" onChange={(e) => cambiar('correo', e.target.value)} />
            <Mail size={16} aria-hidden="true" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#4f6e5b' }} />
          </span>
        </div>
        {texto('telefono', 'Teléfono', { tipo: 'tel', placeholder: '+502 0000 0000' })}
        {clave('contrasena', 'Contraseña inicial')}
        {clave('confirmar', 'Confirmar contraseña')}

        <div className="md-grid2">
          {texto('numeroProfesional', 'N.º profesional único', { placeholder: 'CM-00000' })}
          <div className="md-campo">
            <label htmlFor="cm-especialidadId">Especialidad activa *</label>
            <select id="cm-especialidadId" value={form.especialidadId} onChange={(e) => cambiar('especialidadId', e.target.value)}>
              <option value="">{especialidades ? 'Seleccionar especialidad' : 'Cargando…'}</option>
              {(especialidades ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="md-grid2">
          <div className="md-campo"><span>Rol</span><div className="md-caja cm-fijo">Médico <Lock size={15} aria-hidden="true" /></div></div>
          <div className="md-campo"><span>Activo</span><div className="md-caja cm-fijo">Sí <CircleCheck size={16} aria-hidden="true" /></div></div>
        </div>

        <p className="md-aviso"><Info size={15} aria-hidden="true" /> El administrador crea la cuenta manualmente. No se envía invitación por correo externo ni habilitación automática.</p>
        {error && <p className="md-alerta" role="alert">{error}</p>}

        <div className="cm-acciones">
          <button type="submit" className="md-btn md-btn--primario" disabled={enviando}><Plus size={16} aria-hidden="true" /> {enviando ? 'Creando…' : 'Crear médico'}</button>
          <Link to="/admin/usuarios" className="md-btn md-btn--borde"><ArrowLeft size={16} aria-hidden="true" /> Cancelar</Link>
        </div>
      </form>
    </>
  )
}
