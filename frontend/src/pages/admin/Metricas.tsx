import { useEffect, useState } from 'react'
import { Briefcase, ClipboardCheck, Info, Users } from 'lucide-react'
import EstadoCita from '../../components/EstadoCita'
import { obtenerMetricas } from '../../services/adminService'
import type { Metricas as DatosMetricas, PeriodoMetricas } from '../../types/admin'
import type { EstadoCita as Estado } from '../../shared/types/cita'
import '../../components/medico/medico.css'
import './admin.css'
import './Metricas.css'

const PERIODOS: { valor: PeriodoMetricas; etiqueta: string }[] = [
  { valor: 'TODO', etiqueta: 'Todo el período' },
  { valor: 'MES_ACTUAL', etiqueta: 'Este mes' },
  { valor: 'MES_ANTERIOR', etiqueta: 'Mes anterior' },
]

const ESTADOS: Estado[] = ['PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'REPROGRAMADA', 'COMPLETADA']
const COLOR: Record<Estado, string> = {
  PENDIENTE: '#d4b050', ACEPTADA: '#1a6b3c', RECHAZADA: '#b3261e', CANCELADA: '#5d7a68', REPROGRAMADA: '#d4b050', COMPLETADA: '#0f4d2a',
}

export default function Metricas() {
  const [periodo, setPeriodo] = useState<PeriodoMetricas>('TODO')
  const [datos, setDatos] = useState<{ periodo: PeriodoMetricas; metricas: DatosMetricas } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    obtenerMetricas(periodo)
      .then((metricas) => { if (vigente) { setDatos({ periodo, metricas }); setError('') } })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [periodo])

  const m = datos?.periodo === periodo ? datos.metricas : null
  const etiquetaPeriodo = PERIODOS.find((p) => p.valor === periodo)?.etiqueta ?? ''

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Métricas</h1>
          <p>Resumen operativo de pacientes, médicos, consultas y citas.</p>
        </div>
        <span className="md-chip md-chip--amarillo">Solo administrador</span>
      </div>

      {error && <p className="md-alerta" role="alert">{error}</p>}

      <section className="md-card mt-periodo" aria-label="Período">
        <div className="md-campo">
          <label htmlFor="mt-periodo">Período</label>
          <select id="mt-periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value as PeriodoMetricas)}>
            {PERIODOS.map((p) => <option key={p.valor} value={p.valor}>{p.etiqueta}</option>)}
          </select>
        </div>
        <div>
          <strong>{m ? (m.totalCitas > 0 ? `Historial de ${m.rango}` : m.rango) : 'Calculando…'}</strong>
          <p className="md-ayuda">Incluye todos los registros del período seleccionado.</p>
        </div>
      </section>

      {!m && !error && <p className="md-estado">Cargando métricas…</p>}

      {m && (
        <>
          <div className="mt-kpis">
            <article className="md-card mt-kpi">
              <div className="mt-kpi__top"><h2>Total de pacientes</h2><span className="mt-icono"><Users size={18} aria-hidden="true" /></span></div>
              <strong className="mt-kpi__valor">{m.totalPacientes}</strong>
              <p className="md-ayuda">Cuentas de pacientes registradas</p>
            </article>
            <article className="md-card mt-kpi">
              <div className="mt-kpi__top"><h2>Total de médicos</h2><span className="mt-icono"><Briefcase size={18} aria-hidden="true" /></span></div>
              <strong className="mt-kpi__valor">{m.totalMedicos}</strong>
              <p className="md-ayuda">Profesionales registrados</p>
            </article>
            <article className="md-card mt-kpi">
              <div className="mt-kpi__top"><h2>Consultas completadas</h2><span className="mt-icono"><ClipboardCheck size={18} aria-hidden="true" /></span></div>
              <strong className="mt-kpi__valor">{m.consultasCompletadas}</strong>
              <p className="md-ayuda">Consultas finalizadas en el período</p>
            </article>
          </div>

          <div className="ad-2col">
            <section className="md-card" aria-labelledby="mt-estados">
              <div className="md-card__top">
                <h2 id="mt-estados">Citas por estado</h2>
                <span className="md-chip md-chip--amarillo">{m.totalCitas} {m.totalCitas === 1 ? 'cita' : 'citas'} en total</span>
              </div>
              <ul className="mt-barras">
                {ESTADOS.map((estado) => {
                  const n = m.citasPorEstado[estado]
                  return (
                    <li key={estado}>
                      <EstadoCita estado={estado} />
                      <span className="mt-barra" role="img" aria-label={`${n} de ${m.totalCitas}`}>
                        <span style={{ width: `${m.totalCitas ? (n / m.totalCitas) * 100 : 0}%`, background: COLOR[estado] }} />
                      </span>
                      <strong>{n}</strong>
                    </li>
                  )
                })}
              </ul>
              <p className="md-ayuda">Conteo de citas registradas según su estado actual.</p>
            </section>

            <aside className="ad-col">
              <section className="md-card">
                <h2>Total de citas</h2>
                <strong className="mt-kpi__valor">{m.totalCitas}</strong>
                <p className="md-ayuda">Registros de citas en {periodo === 'TODO' ? 'todo el período' : etiquetaPeriodo.toLowerCase()}.</p>
                <p className="md-ayuda">{m.rango.charAt(0).toUpperCase() + m.rango.slice(1)}</p>
              </section>
              <p className="md-ayuda"><Info size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> Información agregada de uso administrativo. No se muestran nombres de pacientes, diagnósticos ni recetas.</p>
            </aside>
          </div>
        </>
      )}
    </>
  )
}
