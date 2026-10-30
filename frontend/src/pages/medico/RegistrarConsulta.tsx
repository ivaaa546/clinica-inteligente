import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita'
import GinecoCampos from '../../features/expedientes/components/GinecoCampos'
import RecetaEditor from '../../features/recetas/components/RecetaEditor'
import {
  guardarGineco, obtenerContextoConsulta, registrarConsulta,
} from '../../services/medicoService'
import { diaSemana, formatearFecha } from '../../shared/lib/fechas'
import {
  TIPOS_FICHA, erroresConsulta, formularioVacio, recetaValida, resumenFaltantes, type CampoConsulta,
} from '../../shared/lib/consulta'
import type {
  AntecedentesGineco, ContextoConsulta, FormularioConsulta, SignosVitales, TipoFicha,
} from '../../types/medico'
import '../../components/medico/medico.css'
import './RegistrarConsulta.css'

interface Textos {
  subtitulo: string
  problemas: string
  evaluacion: string
  placeholders: { evaluacion: string; problemas: string; examen: string; peligro: string; historia: string }
}

const TEXTOS: Record<TipoFicha, Textos> = {
  ADULTO: {
    subtitulo: 'Cita aceptada propia. Registra la evaluación clínica, signos vitales y receta si corresponde.',
    problemas: 'Problemas a investigar',
    evaluacion: 'Evaluación clínica estructurada',
    placeholders: {
      evaluacion: 'Registrar hallazgos de la evaluación clínica.', problemas: 'Registrar los problemas activos o por investigar.',
      examen: 'Describir hallazgos del examen físico.', peligro: 'Registrar los signos de peligro observados o referidos.',
      historia: 'Registrar la historia actual y la evolución desde la consulta anterior.',
    },
  },
  PRENATAL: {
    subtitulo: 'Cita aceptada propia. Registra el control prenatal, signos vitales y antecedentes gineco-obstétricos.',
    problemas: 'Problemas identificados',
    evaluacion: 'Evaluación clínica',
    placeholders: {
      evaluacion: 'Registrar hallazgos de la evaluación clínica.', problemas: 'Registrar los problemas identificados en esta consulta.',
      examen: 'Describir hallazgos del examen físico y obstétrico.', peligro: 'Registrar los signos de peligro en el embarazo.',
      historia: 'Control prenatal. Registrar la historia actual y la evolución desde la consulta anterior.',
    },
  },
  NEONATO: {
    subtitulo: 'Cita aceptada propia. Registra la evaluación clínica del recién nacido.',
    problemas: 'Problemas a investigar',
    evaluacion: 'Evaluación clínica estructurada',
    placeholders: {
      evaluacion: 'Registrar los hallazgos de la evaluación neonatal.', problemas: 'Registrar los problemas identificados durante la consulta.',
      examen: 'Describir hallazgos del examen físico.', peligro: 'Registrar los signos observados o referidos.',
      historia: 'Registrar la historia actual del recién nacido.',
    },
  },
}

const SIGNOS: { clave: keyof SignosVitales; etiqueta: string; placeholder: string; modo: 'decimal' | 'numeric' | 'text' }[] = [
  { clave: 'peso', etiqueta: 'Peso (lb)', placeholder: 'Ej. 150', modo: 'decimal' },
  { clave: 'talla', etiqueta: 'Talla (cm)', placeholder: 'Ej. 170', modo: 'decimal' },
  { clave: 'temperatura', etiqueta: 'Temperatura (°C)', placeholder: 'Ej. 36.7', modo: 'decimal' },
  { clave: 'presion', etiqueta: 'Presión arterial (mmHg)', placeholder: 'Ej. 120/80', modo: 'text' },
  { clave: 'fc', etiqueta: 'Frec. cardíaca / min', placeholder: 'Ej. 74', modo: 'numeric' },
  { clave: 'fr', etiqueta: 'Frec. respiratoria / min', placeholder: 'Ej. 16', modo: 'numeric' },
]

const sexoTexto = (sexo: 'M' | 'F' | 'NO_ESPECIFICADO') => ({
  M: 'Masculino (M)',
  F: 'Femenino (F)',
  NO_ESPECIFICADO: 'No especificado',
}[sexo])

const PRECONSULTA_SIGNOS = [
  ['pesoLb', 'Peso', 'lb'], ['tallaCm', 'Talla', 'cm'], ['temperatura', 'Temperatura', '°C'],
  ['presionArterial', 'Presión arterial', ''], ['frecCardiaca', 'Frecuencia cardíaca', 'lpm'], ['frecRespiratoria', 'Frecuencia respiratoria', 'rpm'],
] as const

const textoPreconsulta = (value: unknown) => typeof value === 'string' ? value : value ? JSON.stringify(value) : 'No registrado'

export default function RegistrarConsulta() {
  const { citaCodigo = '' } = useParams()
  const navigate = useNavigate()

  const [ctx, setCtx] = useState<ContextoConsulta | null>(null)
  const [form, setForm] = useState<FormularioConsulta | null>(null)
  const [gineco, setGineco] = useState<AntecedentesGineco | null>(null)
  const [error, setError] = useState('')
  const [tocados, setTocados] = useState<Set<CampoConsulta>>(new Set())
  const [ocupado, setOcupado] = useState(false)
  const [errorAccion, setErrorAccion] = useState('')
  const [aviso, setAviso] = useState('')
  const [avisoGineco, setAvisoGineco] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  useEffect(() => {
    let vigente = true
    obtenerContextoConsulta(citaCodigo)
      .then((c) => {
        if (!vigente) return
        setCtx(c)
        setForm(c.borrador ?? formularioVacio(c.sugerida))
        setGineco(c.gineco)
      })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [citaCodigo])

  const errores = useMemo(() => (form ? erroresConsulta(form) : {}), [form])
  const recetaOk = form ? recetaValida(form.receta) : true
  const completo = Object.keys(errores).length === 0 && recetaOk

  if (error) {
    return (
      <>
        <p className="md-alerta" role="alert">{error}</p>
        <Link to="/medico/agenda" className="md-btn md-btn--borde" style={{ alignSelf: 'flex-start' }}>Volver a la agenda</Link>
      </>
    )
  }
  if (!ctx || !form) return <p className="md-estado">Cargando la ficha de consulta…</p>

  const { cita, paciente, medico, fichas, edadTexto, preconsulta } = ctx
  const textos = TEXTOS[form.tipoFicha]
  const nombre = `${paciente.nombre} ${paciente.apellidos}`
  const verError = (campo: CampoConsulta) => (tocados.has(campo) ? errores[campo] : undefined)
  const tocar = (campo: CampoConsulta) => setTocados((actual) => new Set(actual).add(campo))
  const cambiar = (cambios: Partial<FormularioConsulta>) => { setAviso(''); setForm({ ...form, ...cambios }) }
  const cambiarSigno = (clave: keyof SignosVitales, valor: string) => cambiar({ signos: { ...form.signos, [clave]: valor } })
  const cambiarEstadoSigno = (clave: keyof SignosVitales, estado: FormularioConsulta['signosEstado'][keyof SignosVitales]) => cambiar({
    signosEstado: { ...form.signosEstado, [clave]: estado },
    ...(estado === 'NO_MEDIDO' ? { signos: { ...form.signos, [clave]: '' } } : {}),
  })

  const ayudaFicha = [
    fichas.NEONATO.disponible ? 'Neonato sugerido por edad menor de 28 días.' : '',
    !fichas.PRENATAL.disponible ? fichas.PRENATAL.motivo : '',
  ].filter(Boolean)

  const mensajePie = !completo
    ? (Object.keys(errores).length > 0 ? resumenFaltantes(errores, 'la consulta') : 'Completa los seis campos de cada medicamento de la receta.')
    : 'El registro y las recetas se guardarán juntos.'

  const completar = async () => {
    if (!completo) return
    if (!window.confirm('¿Completar la consulta? Una vez completada ya no se podrá editar.')) return
    setOcupado(true); setErrorAccion(''); setAviso('')
    try {
      const consulta = await registrarConsulta(cita.codigo, form)
      navigate(`/medico/consultas/${consulta.id}`, { replace: true })
    } catch (e) {
      setErrorAccion((e as Error).message)
      setOcupado(false)
    }
  }

  const guardarAntecedentesGineco = async () => {
    if (!gineco) return
    setOcupado(true); setAvisoGineco(null)
    try {
      setGineco(await guardarGineco(paciente.id, gineco))
      setAvisoGineco({ tipo: 'ok', texto: 'Antecedentes guardados.' })
    } catch (e) {
      setAvisoGineco({ tipo: 'error', texto: (e as Error).message })
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <div className="md-head">
        <h1>Registrar consulta · {TIPOS_FICHA.find((t) => t.valor === form.tipoFicha)?.etiqueta}</h1>
        <p>{textos.subtitulo}</p>
      </div>

      <section className="rc-banner" aria-label="Paciente y cita">
        <div>
          <small className="rc-banner__eti">PACIENTE · {paciente.id}</small>
          <strong>{nombre}</strong>
          <small>{sexoTexto(paciente.sexo)} · {edadTexto} · Nacimiento: {formatearFecha(paciente.nacimiento)}</small>
          {paciente.responsable && <small>Responsable: {paciente.responsable}</small>}
        </div>
        <div className="rc-banner__cita">
          <strong>{diaSemana(cita.fecha)} {formatearFecha(cita.fecha)} · {cita.hora}</strong>
          <small>Cita {cita.codigo} · La consulta recibirá un identificador al completarse</small>
          <small>{medico.nombre} · {medico.especialidad}</small>
        </div>
        <EstadoCita estado={cita.estado} />
      </section>

      {aviso && <p className="md-aviso" role="status">{aviso}</p>}
      {errorAccion && <p className="md-alerta" role="alert">{errorAccion}</p>}

      {preconsulta && (
        <section className="md-card" aria-labelledby="rc-preconsulta">
          <h2 id="rc-preconsulta">Datos de preconsulta del paciente</h2>
          <div className="md-grid2">
            <div className="md-campo"><span>Motivo de consulta</span><div className="md-caja">{preconsulta.motivoConsulta}</div></div>
            <div className="md-campo"><span>Antecedentes iniciales</span><div className="md-caja">{textoPreconsulta(preconsulta.antecedentesIniciales)}</div></div>
          </div>
          <div className="md-grid2">
            {PRECONSULTA_SIGNOS.map(([field, label, unit]) => {
              const value = preconsulta.signosVitales?.[field]
              return <div className="md-campo" key={field}><span>{label}</span><div className="md-caja">{value === undefined || value === null || value === '' ? 'No registrado' : `${value}${unit ? ` ${unit}` : ''}`}</div></div>
            })}
          </div>
          <p className="md-ayuda">Son datos autorreportados por el paciente; verifica o registra las mediciones clínicas si corresponde.</p>
        </section>
      )}

      <div className="rc-layout">
        <div className="rc-col">
          <section className="md-card" aria-labelledby="rc-datos">
            <h2 id="rc-datos">Datos de la consulta</h2>
            <div className="md-grid2">
              <div className="md-campo">
                <span>Fecha de la consulta *</span>
                <div className="md-caja">{formatearFecha(cita.fecha)}</div>
              </div>
              <div className={`md-campo ${verError('motivo') ? 'is-error' : ''}`}>
                <label htmlFor="rc-motivo">Motivo de consulta *</label>
                <input
                  id="rc-motivo" type="text" value={form.motivo} placeholder="Ej. Control de seguimiento"
                  onChange={(e) => cambiar({ motivo: e.target.value })} onBlur={() => tocar('motivo')}
                />
                {verError('motivo') && <span className="md-campo__error">{errores.motivo}</span>}
              </div>
            </div>

            <div className="rc-ficha">
              <div className="md-campo">
                <span id="rc-ficha-eti">Tipo de ficha *</span>
                <div className="rc-segmentos" role="radiogroup" aria-labelledby="rc-ficha-eti">
                  {TIPOS_FICHA.map(({ valor, etiqueta }) => (
                    <button
                      key={valor} type="button" role="radio" aria-checked={form.tipoFicha === valor}
                      disabled={!fichas[valor].disponible} title={fichas[valor].motivo}
                      className={`rc-segmento ${form.tipoFicha === valor ? 'is-activo' : ''}`}
                      onClick={() => cambiar({ tipoFicha: valor })}
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rc-ficha__ayuda">
                {ayudaFicha.map((texto, i) => <p key={texto} className={i === 0 && fichas.NEONATO.disponible ? 'rc-ficha__sugerida' : undefined}>{texto}</p>)}
              </div>
            </div>

            <div className="md-campo">
              <label htmlFor="rc-historia">Historia actual (opcional)</label>
              <textarea id="rc-historia" value={form.historiaActual} placeholder={textos.placeholders.historia} onChange={(e) => cambiar({ historiaActual: e.target.value })} />
            </div>
          </section>

          <section className="md-card" aria-labelledby="rc-evaluacion">
            <h2 id="rc-evaluacion">Evaluación clínica</h2>
            <div className="md-campo">
              <label htmlFor="rc-eval">{textos.evaluacion}</label>
              <textarea id="rc-eval" value={form.evaluacion} placeholder={textos.placeholders.evaluacion} onChange={(e) => cambiar({ evaluacion: e.target.value })} />
            </div>
            <div className="md-campo">
              <label htmlFor="rc-problemas">{textos.problemas}</label>
              <textarea id="rc-problemas" value={form.problemas} placeholder={textos.placeholders.problemas} onChange={(e) => cambiar({ problemas: e.target.value })} />
            </div>
            <div className="md-grid2">
              <div className="md-campo">
                <label htmlFor="rc-examen">Examen físico</label>
                <textarea id="rc-examen" value={form.examenFisico} placeholder={textos.placeholders.examen} onChange={(e) => cambiar({ examenFisico: e.target.value })} />
              </div>
              <div className="md-campo">
                <label htmlFor="rc-peligro">Signos de peligro</label>
                <textarea id="rc-peligro" value={form.signosPeligro} placeholder={textos.placeholders.peligro} onChange={(e) => cambiar({ signosPeligro: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="md-card" aria-labelledby="rc-diagnostico">
            <h2 id="rc-diagnostico">Diagnóstico y observaciones</h2>
            <div className={`md-campo ${verError('diagnostico') ? 'is-error' : ''}`}>
              <label htmlFor="rc-diag">Diagnóstico *</label>
              <textarea
                id="rc-diag" value={form.diagnostico} placeholder="Escribir diagnóstico de la consulta"
                onChange={(e) => cambiar({ diagnostico: e.target.value })} onBlur={() => tocar('diagnostico')}
              />
              {verError('diagnostico') && <span className="md-campo__error">{errores.diagnostico}</span>}
            </div>
            <div className="md-campo">
              <label htmlFor="rc-obs">Observaciones internas (opcional)</label>
              <textarea id="rc-obs" value={form.observaciones} placeholder="Añadir observaciones para el seguimiento clínico." onChange={(e) => cambiar({ observaciones: e.target.value })} />
            </div>
            <p className="md-ayuda">Uso clínico del médico. No visible para paciente ni administrador.</p>
          </section>
        </div>

        <aside className="rc-col" aria-label="Signos vitales, antecedentes y receta">
          <section className="md-card rc-signos" aria-labelledby="rc-signos">
            <h2 id="rc-signos">Signos vitales</h2>
            <div className="md-grid2">
              {SIGNOS.map(({ clave, etiqueta, placeholder, modo }) => (
                <div key={clave} className={`md-campo ${verError(clave) ? 'is-error' : ''}`}>
                  <label htmlFor={`rc-s-${clave}`}>{etiqueta}</label>
                  <select
                    aria-label={`Estado de ${etiqueta}`} value={form.signosEstado[clave]}
                    onChange={(e) => cambiarEstadoSigno(clave, e.target.value as FormularioConsulta['signosEstado'][keyof SignosVitales])}
                  >
                    <option value="NO_MEDIDO">No medido</option>
                    <option value="AUTORREPORTADO">Autorreportado por paciente</option>
                    <option value="MEDIDO">Medido por médico</option>
                  </select>
                  <input
                    id={`rc-s-${clave}`} type="text" inputMode={modo} value={form.signos[clave]} placeholder={placeholder}
                    disabled={form.signosEstado[clave] === 'NO_MEDIDO'}
                    onChange={(e) => cambiarSigno(clave, e.target.value)} onBlur={() => tocar(clave)}
                  />
                  {verError(clave) && <span className="md-campo__error">{errores[clave]}</span>}
                </div>
              ))}
            </div>
            <p className="md-aviso"><Info size={15} aria-hidden="true" /> Completa los campos requeridos según la ficha seleccionada antes de finalizar.</p>
          </section>

          {form.tipoFicha === 'PRENATAL' && gineco ? (
            <section className="md-card" aria-labelledby="rc-gineco">
              <h2 id="rc-gineco">Antecedentes gineco-obstétricos</h2>
              <Link to={`/medico/pacientes/${paciente.id}`} className="md-btn md-btn--borde md-btn--bloque">Abrir expediente {paciente.id}</Link>
              <GinecoCampos compacto valor={gineco} onCambio={(cambios) => { setAvisoGineco(null); setGineco({ ...gineco, ...cambios }) }} />
              {avisoGineco && <p className={avisoGineco.tipo === 'ok' ? 'md-aviso' : 'md-alerta'} role="status">{avisoGineco.texto}</p>}
              <button type="button" className="md-btn md-btn--primario md-btn--bloque" onClick={guardarAntecedentesGineco} disabled={ocupado}>Guardar antecedentes</button>
              <p className="md-ayuda">FUR y planificación son opcionales. Los conteos 0 son permitidos. Esta sección no reemplaza el historial permanente del expediente.</p>
            </section>
          ) : (
            <section className="md-card" aria-labelledby="rc-ant">
              <h2 id="rc-ant">Antecedentes y alergias</h2>
            <p className="md-ayuda">La edición de antecedentes se habilitará al integrar el expediente clínico. Esta consulta no modifica antecedentes permanentes.</p>
            </section>
          )}

          <section className="md-card" aria-labelledby="rc-receta">
            <h2 id="rc-receta">Receta <span className="md-unidad">· opcional</span></h2>
            <RecetaEditor receta={form.receta} onCambio={(receta) => cambiar({ receta })} />
          </section>
        </aside>
      </div>

      <section className="md-card rc-pie" aria-label="Acciones de la consulta">
        <div className="rc-pie__texto">
          <Link to={`/medico/pacientes/${paciente.id}`} className="rc-pie__volver"><ArrowLeft size={15} aria-hidden="true" /> Volver al expediente</Link>
          <small className={completo ? '' : 'is-falta'} role="status">{mensajePie}</small>
        </div>
        <div className="md-acciones">
          <button type="button" className="md-btn md-btn--borde" disabled title="Los borradores clínicos no están disponibles todavía">Guardar evolución (no disponible)</button>
          <button type="button" className="md-btn md-btn--primario" onClick={completar} disabled={ocupado || !completo}>Guardar y completar consulta</button>
        </div>
      </section>
    </>
  )
}
