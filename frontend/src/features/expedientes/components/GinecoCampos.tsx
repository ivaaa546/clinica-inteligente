import type { AntecedentesGineco } from '../../../types/medico'
import '../../../components/medico/medico.css'

interface Props {
  valor: AntecedentesGineco
  onCambio: (cambios: Partial<AntecedentesGineco>) => void
  /** Solo lectura: muestra los datos sin permitir editarlos */
  soloLectura?: boolean
  /** Una sola columna (tarjeta angosta de la ficha prenatal) */
  compacto?: boolean
}

const CONTEOS: { clave: 'gestas' | 'partos' | 'cesareas' | 'abortos' | 'hijosVivos'; etiqueta: string }[] = [
  { clave: 'gestas', etiqueta: 'Gestas' },
  { clave: 'partos', etiqueta: 'Partos' },
  { clave: 'cesareas', etiqueta: 'Cesáreas' },
  { clave: 'abortos', etiqueta: 'Abortos' },
  { clave: 'hijosVivos', etiqueta: 'Hijos vivos' },
]

/** Campos de antecedentes gineco-obstétricos; los usan el expediente y la ficha prenatal. */
export default function GinecoCampos({ valor, onCambio, soloLectura = false, compacto = false }: Props) {
  return (
    <div className={compacto ? undefined : 'md-grid3'} style={compacto ? { display: 'flex', flexDirection: 'column', gap: 14 } : undefined}>
      <label className="md-campo">
        <span>FUR <span className="md-unidad">(opcional)</span></span>
        <input type="date" value={valor.fur} disabled={soloLectura} onChange={(e) => onCambio({ fur: e.target.value })} />
      </label>

      {CONTEOS.map(({ clave, etiqueta }) => (
        <label key={clave} className="md-campo">
          <span>{etiqueta}</span>
          <input
            type="number" min={0} step={1} inputMode="numeric" value={valor[clave]} disabled={soloLectura}
            onChange={(e) => onCambio({ [clave]: e.target.value === '' ? 0 : Number(e.target.value) })}
          />
        </label>
      ))}

      <label className="md-campo">
        <span>Planificación <span className="md-unidad">(opcional)</span></span>
        <input
          type="text" value={valor.planificacion} disabled={soloLectura} placeholder="Método de planificación (opcional)"
          onChange={(e) => onCambio({ planificacion: e.target.value })}
        />
      </label>
    </div>
  )
}
