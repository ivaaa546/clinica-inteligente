import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import GinecoCampos from '../../features/expedientes/components/GinecoCampos'
import { useMedicalRecord } from '../../features/expedientes/hooks/useMedicalRecord'
import { guardarAntecedentes, guardarGineco } from '../../services/medicoService'
import { formatearFecha, hoyISO } from '../../shared/lib/fechas'
import { edadTexto } from '../../shared/lib/consulta'
import type { Antecedentes, AntecedentesGineco, Expediente as DatosExpediente } from '../../types/medico'
import '../../components/medico/medico.css'
import './Expediente.css'

const CAMPOS_ANTECEDENTES: { clave: keyof Antecedentes; etiqueta: string }[] = [
  { clave: 'medicos', etiqueta: 'Médicos' },
  { clave: 'quirurgicos', etiqueta: 'Quirúrgicos' },
  { clave: 'familiares', etiqueta: 'Familiares' },
  { clave: 'habitos', etiqueta: 'Hábitos' },
]

const sexoTexto = (sexo: 'M' | 'F' | 'NO_ESPECIFICADO') => ({
  M: 'Masculino',
  F: 'Femenino',
  NO_ESPECIFICADO: 'No especificado',
}[sexo])

export default function Expediente() {
  const { pacienteId = '' } = useParams()
  const { data: datos, error, setData: setDatos } = useMedicalRecord(pacienteId)

  const [editandoAnt, setEditandoAnt] = useState(false)
  const [formAnt, setFormAnt] = useState<Antecedentes | null>(null)
  const [editandoGin, setEditandoGin] = useState(false)
  const [formGin, setFormGin] = useState<AntecedentesGineco | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [errorAccion, setErrorAccion] = useState('')
  const [aviso, setAviso] = useState('')

  if (error) {
    return (
      <>
        <p className="md-alerta" role="alert">{error}</p>
        <Link to="/medico/pacientes" className="md-btn md-btn--borde" style={{ alignSelf: 'flex-start' }}>Volver a mis pacientes</Link>
      </>
    )
  }
  if (!datos) return <p className="md-estado">Cargando expediente…</p>

  const { expediente, medico } = datos
  const { paciente, antecedentes, gineco, consultas, citaAceptada } = expediente
  const nombreCompleto = `${paciente.nombre} ${paciente.apellidos}`

  const actualizar = (cambios: Partial<DatosExpediente>) => setDatos({ expediente: { ...expediente, ...cambios }, medico })

  const guardarAnt = async () => {
    if (!formAnt) return
    setOcupado(true); setErrorAccion(''); setAviso('')
    try {
      actualizar({ antecedentes: await guardarAntecedentes(paciente.id, formAnt) })
      setEditandoAnt(false)
      setAviso('Antecedentes guardados.')
    } catch (e) {
      setErrorAccion((e as Error).message)
    } finally {
      setOcupado(false)
    }
  }

  const guardarGin = async () => {
    if (!formGin) return
    setOcupado(true); setErrorAccion(''); setAviso('')
    try {
      actualizar({ gineco: await guardarGineco(paciente.id, formGin) })
      setEditandoGin(false)
      setAviso('Antecedentes gineco-obstétricos guardados.')
    } catch (e) {
      setErrorAccion((e as Error).message)
    } finally {
      setOcupado(false)
    }
  }

  const demograficos: [string, string][] = [
    ['Nombre', paciente.nombre], ['Apellidos', paciente.apellidos],
    ['Nacimiento', formatearFecha(paciente.nacimiento)], ['Sexo', `${sexoTexto(paciente.sexo)} (${paciente.sexo})`],
    ['Teléfono', paciente.telefono], ['Correo electrónico', paciente.email],
    ['Dirección', paciente.direccion], ['Ocupación', paciente.ocupacion],
    ['Migrante', paciente.migrante ? 'Sí' : 'No'], ['Responsable', paciente.responsable ?? '—'],
  ]

  return (
    <>
      <div className="md-head md-head__fila">
        <div>
          <h1>Expediente clínico</h1>
          <p>
            <Link to="/medico/pacientes">Mis pacientes</Link> / {nombreCompleto} · {paciente.id}
            {citaAceptada && ` · Cita ${citaAceptada.codigo} aceptada`}
          </p>
        </div>
        {citaAceptada && (
          <Link to={`/medico/consulta/${citaAceptada.codigo}`} className="md-btn md-btn--primario">
            <ArrowRight size={16} aria-hidden="true" /> Registrar consulta {citaAceptada.codigo}
          </Link>
        )}
      </div>

      {aviso && <p className="md-aviso" role="status">{aviso}</p>}
      {errorAccion && <p className="md-alerta" role="alert">{errorAccion}</p>}

      <section className="ex-banner" aria-label="Paciente">
        <span className="ex-banner__avatar" aria-hidden="true">{`${paciente.nombre[0]}${paciente.apellidos[0]}`.toUpperCase()}</span>
        <div>
          <strong>{nombreCompleto}</strong>
          <small>{paciente.id} · {edadTexto(paciente.nacimiento, hoyISO())} · {sexoTexto(paciente.sexo)} · Paciente de {medico.nombre}</small>
        </div>
        <div className="ex-banner__lado">
          <span className="md-chip md-chip--oscuro">Paciente vinculado</span>
          {citaAceptada && <small>Cita {citaAceptada.codigo} · {formatearFecha(citaAceptada.fecha)} · {citaAceptada.hora}</small>}
        </div>
      </section>

      <section className="md-card" aria-labelledby="ex-demograficos">
        <h2 id="ex-demograficos">Datos demográficos</h2>
        <div className="md-grid2">
          {demograficos.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="md-campo">
              <span>{etiqueta}</span>
              <div className={`md-caja ${valor === '—' ? 'md-caja--vacia' : ''}`}>{valor}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="md-card" aria-labelledby="ex-antecedentes">
        <div className="md-card__top">
          <h2 id="ex-antecedentes">Antecedentes permanentes</h2>
          {!editandoAnt && (
            <button type="button" className="md-btn md-btn--borde" onClick={() => { setFormAnt({ ...antecedentes }); setEditandoAnt(true); setErrorAccion(''); setAviso('') }}>
              Editar antecedentes
            </button>
          )}
        </div>

        {CAMPOS_ANTECEDENTES.map(({ clave, etiqueta }) => (
          <div key={clave} className="md-campo">
            {editandoAnt && formAnt ? (
              <>
                <label htmlFor={`ant-${clave}`}>{etiqueta}</label>
                <textarea id={`ant-${clave}`} value={formAnt[clave]} onChange={(e) => setFormAnt({ ...formAnt, [clave]: e.target.value })} />
              </>
            ) : (
              <>
                <span>{etiqueta}</span>
                <div className={`md-caja ${antecedentes[clave] ? '' : 'md-caja--vacia'}`}>{antecedentes[clave] || '—'}</div>
              </>
            )}
          </div>
        ))}

        <div className={`md-campo ${editandoAnt && formAnt && !formAnt.alergias.trim() ? 'is-error' : ''}`}>
          {editandoAnt && formAnt ? (
            <>
              <label htmlFor="ant-alergias">Alergias *</label>
              <input id="ant-alergias" type="text" value={formAnt.alergias} onChange={(e) => setFormAnt({ ...formAnt, alergias: e.target.value })} />
              {!formAnt.alergias.trim() && <span className="md-campo__error">Obligatorio: escribe "Sin alergias conocidas" si no hay.</span>}
            </>
          ) : (
            <>
              <span>Alergias *</span>
              <div className="md-caja">{antecedentes.alergias}</div>
            </>
          )}
        </div>

        {editandoAnt && (
          <div className="md-acciones">
            <button type="button" className="md-btn md-btn--primario" onClick={guardarAnt} disabled={ocupado}>Guardar antecedentes</button>
            <button type="button" className="md-btn md-btn--borde" onClick={() => setEditandoAnt(false)} disabled={ocupado}>Cancelar</button>
          </div>
        )}
        <p className="md-aviso"><Info size={15} aria-hidden="true" /> Los antecedentes generales se pueden editar de forma independiente sin crear una nueva consulta.</p>
      </section>

      <section className="md-card" aria-labelledby="ex-gineco">
        <div className="md-card__top">
          <h2 id="ex-gineco">Antecedentes gineco-obstétricos</h2>
          {gineco === null && <span className="md-card__nota">No aplica</span>}
          {gineco !== null && !editandoGin && (
            <button type="button" className="md-btn md-btn--borde" onClick={() => { setFormGin({ ...gineco }); setEditandoGin(true); setErrorAccion(''); setAviso('') }}>
              Editar antecedentes
            </button>
          )}
        </div>

        {gineco === null ? (
          <p className="md-aviso">Este formulario solo se activa para pacientes con sexo F.</p>
        ) : (
          <>
            <GinecoCampos
              valor={editandoGin && formGin ? formGin : gineco}
              soloLectura={!editandoGin}
              onCambio={(cambios) => formGin && setFormGin({ ...formGin, ...cambios })}
            />
            {editandoGin && (
              <div className="md-acciones">
                <button type="button" className="md-btn md-btn--primario" onClick={guardarGin} disabled={ocupado}>Guardar antecedentes</button>
                <button type="button" className="md-btn md-btn--borde" onClick={() => setEditandoGin(false)} disabled={ocupado}>Cancelar</button>
              </div>
            )}
            <p className="md-ayuda">FUR y planificación son opcionales. Los conteos 0 son permitidos.</p>
          </>
        )}
      </section>

      <section className="md-card" aria-labelledby="ex-historial">
        <div className="md-card__top">
          <h2 id="ex-historial">Historial de consultas diarias</h2>
          <span className="md-card__nota">{consultas.length} {consultas.length === 1 ? 'consulta previa' : 'consultas previas'}</span>
        </div>

        {consultas.length === 0 ? (
          <p className="md-estado">Aún no hay consultas previas.</p>
        ) : (
          <table className="md-tabla ex-tabla">
            <thead>
              <tr><th scope="col">FECHA / CONSULTA</th><th scope="col">MÉDICO</th><th scope="col">DIAGNÓSTICO</th><th scope="col">ACCIÓN</th></tr>
            </thead>
            <tbody>
              {consultas.map((c) => (
                <tr key={c.id}>
                  <td data-label="Fecha"><strong>{formatearFecha(c.fecha)}</strong><small>{c.id}</small></td>
                  <td data-label="Médico"><strong>{c.medico}</strong><small>{c.especialidad}</small></td>
                  <td data-label="Diagnóstico">{c.diagnostico}</td>
                  <td data-label="Acción"><Link to={`/medico/consultas/${c.id}`} className="md-btn md-btn--borde">Abrir consulta</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="md-aviso"><Info size={15} aria-hidden="true" /> Revisa aquí las consultas previas. El registro de una nueva consulta solo está disponible para una cita aceptada propia.</p>
      </section>
    </>
  )
}
