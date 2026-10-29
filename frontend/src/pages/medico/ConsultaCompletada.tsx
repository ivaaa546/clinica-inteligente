import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CircleCheck, Download, Info, Link2, Plus, Printer } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita'
import { obtenerConsulta } from '../../services/medicoService'
import { formatearFecha, mesMayusculas } from '../../lib/fechas'
import type { ConsultaGuardada, Medicamento } from '../../types/medico'
import '../../components/medico/medico.css'
import './ConsultaCompletada.css'

/** '2026-10-19' -> '19 de octubre de 2026' */
const fechaLarga = (iso: string) => `${Number(iso.slice(8))} de ${mesMayusculas(iso).toLowerCase()} de ${iso.slice(0, 4)}`

const detalle = (m: Medicamento) => `Dosis: ${m.dosis} · Vía: ${m.via} · Frecuencia: ${m.frecuencia} · Duración: ${m.duracion} · Indicaciones: ${m.indicaciones}`

const SIGNOS_VITALES = [
  ['peso', 'Peso', 'lb'], ['talla', 'Talla', 'cm'], ['temperatura', 'Temperatura', '°C'],
  ['presion', 'Presión arterial', ''], ['fc', 'Frecuencia cardíaca', 'lpm'], ['fr', 'Frecuencia respiratoria', 'rpm'],
] as const

export default function ConsultaCompletada() {
  const { consultaId = '' } = useParams()
  const [consulta, setConsulta] = useState<ConsultaGuardada | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    obtenerConsulta(consultaId)
      .then((c) => { if (vigente) setConsulta(c) })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [consultaId])

  if (error) {
    return (
      <>
        <p className="md-alerta" role="alert">{error}</p>
        <Link to="/medico/agenda" className="md-btn md-btn--borde" style={{ alignSelf: 'flex-start' }}>Volver a la agenda</Link>
      </>
    )
  }
  if (!consulta) return <p className="md-estado">Cargando consulta…</p>

  const { paciente, medico, formulario, fecha, hora, citaCodigo } = consulta
  const { receta } = formulario
  const nombre = `${paciente.nombre} ${paciente.apellidos}`
  const nombreRecetas = receta.length === 1 ? '1 receta' : `${receta.length} recetas`

  return (
    <>
      <div className="md-head md-head__fila cc-no-imprimir">
        <div>
          <h1>Consulta completada</h1>
          <p>La consulta {consulta.id} quedó registrada en el expediente de {nombre} ({paciente.id}).</p>
        </div>
        {receta.length > 0 && (
          <div className="md-acciones">
            <button type="button" className="md-btn md-btn--borde" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> Imprimir</button>
            <button type="button" className="md-btn md-btn--primario" onClick={() => window.print()} title="Se abre el diálogo de impresión: elige «Guardar como PDF»">
              <Download size={16} aria-hidden="true" /> Descargar
            </button>
          </div>
        )}
      </div>

      <p className="md-aviso md-aviso--amarillo cc-banner cc-no-imprimir" role="status">
        <CircleCheck size={16} aria-hidden="true" />
        <strong>Cita {citaCodigo} completada · Consulta {consulta.id} registrada · {receta.length > 0 ? 'Receta disponible en el expediente' : 'Sin receta emitida'}</strong>
        <EstadoCita estado="COMPLETADA" />
      </p>

      <div className="cc-layout">
        <article className="md-card cc-receta" aria-labelledby="cc-titulo">
          <header className="cc-receta__cabecera">
            <span className="cc-marca"><span className="cc-marca__icono"><Plus size={20} color="#fff" /></span><span><strong>TilinesMédicos</strong><small>PLATAFORMA MÉDICA</small></span></span>
            <time dateTime={fecha}>{fechaLarga(fecha)}</time>
          </header>

          <div>
            <h2 id="cc-titulo">Receta de consulta</h2>
            <p className="md-ayuda">Consulta {consulta.id} · Cita {citaCodigo} · {hora}</p>
          </div>

          <div className="md-grid2">
            <div className="cc-dato"><small>PACIENTE</small><strong>{nombre}</strong><span>{paciente.id} · Nacimiento: {formatearFecha(paciente.nacimiento)}</span></div>
            <div className="cc-dato"><small>MÉDICO</small><strong>{medico.nombre}</strong><span>{medico.especialidad} · Colegiado {medico.numeroProfesional}</span></div>
          </div>

          <div className="md-grid2">
            <div className="cc-dato"><small>MOTIVO DE CONSULTA</small><div className="md-caja cc-diag">{formulario.motivo}</div></div>
            <div className="cc-dato"><small>DIAGNÓSTICO</small><div className="md-caja cc-diag">{formulario.diagnostico}</div></div>
          </div>

          <section className="cc-signos" aria-labelledby="cc-signos-titulo">
            <div>
              <h3 id="cc-signos-titulo">Signos vitales registrados</h3>
              <p>Resumen histórico de la consulta; esta información es de solo lectura.</p>
            </div>
            <div className="cc-signos__grid">
              {SIGNOS_VITALES.map(([field, label, unit]) => {
                const estado = formulario.signosEstado[field]
                const value = formulario.signos[field]
                return (
                  <div className="cc-signo" key={field}>
                    <small>{label}</small>
                    <strong>{estado === 'NO_MEDIDO' ? 'No registrado' : `${value}${unit ? ` ${unit}` : ''}`}</strong>
                  </div>
                )
              })}
            </div>
          </section>

          {receta.length > 0 ? (
            <table className="md-tabla cc-medicamentos">
              <thead><tr><th scope="col">MEDICAMENTO</th><th scope="col">INDICACIONES</th></tr></thead>
              <tbody>
                {receta.map((m, i) => (
                  <tr key={`${m.medicamento}-${i}`}><td><strong>{m.medicamento}</strong></td><td>{detalle(m)}</td></tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="md-aviso"><Info size={15} aria-hidden="true" /> Esta consulta no tiene receta asociada.</p>
          )}

          <p className="md-aviso cc-referencia"><Link2 size={14} aria-hidden="true" /> Consulta {consulta.id} · Cita {citaCodigo} · {formatearFecha(fecha)} · {medico.nombre}</p>
          <p className="md-ayuda">Receta simple · Sin firma digital ni validez legal.</p>
        </article>

        <aside className="cc-lado cc-no-imprimir" aria-label="Resumen del cierre">
          <section className="md-card">
            <header className="cc-resumen">
              <strong>Resumen del cierre</strong>
              <span className="cc-resumen__codigo">{consulta.id}</span>
            </header>
            <div className="cc-dato"><small>Diagnóstico</small><strong>{formulario.diagnostico}</strong></div>
            <div className="cc-dato">
              <small>Notas</small>
              <span>{formulario.motivo}. {receta.length > 0 ? `Se registró ${nombreRecetas} asociada${receta.length === 1 ? '' : 's'} a la consulta.` : 'No se emitió receta.'}</span>
            </div>
            {receta.length > 0 && (
              <>
                <p className="cc-recetas"><Link2 size={15} aria-hidden="true" /> {receta.length === 1 ? '1 receta asociada' : `${receta.length} recetas asociadas`}</p>
                <p className="md-aviso">La receta queda disponible en el perfil del paciente dentro de la plataforma.</p>
              </>
            )}
          </section>
          <Link to={`/medico/pacientes/${paciente.id}`} className="md-btn md-btn--borde md-btn--bloque">Volver al expediente</Link>
          <Link to="/medico/agenda" className="md-btn md-btn--bloque cc-volver">Volver a la agenda</Link>
        </aside>
      </div>
    </>
  )
}
