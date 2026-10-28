import { Plus, Info } from 'lucide-react'
import { MEDICAMENTO_VACIO, VIAS, filaRecetaCompleta, filaRecetaVacia } from '../../lib/consulta'
import type { Medicamento } from '../../types/medico'
import './medico.css'
import './RecetaEditor.css'

interface Props {
  receta: Medicamento[]
  onCambio: (receta: Medicamento[]) => void
}

const CAMPOS: { clave: keyof Medicamento; etiqueta: string; placeholder: string }[] = [
  { clave: 'dosis', etiqueta: 'Dosis', placeholder: 'Dosis prescrita' },
  { clave: 'frecuencia', etiqueta: 'Frecuencia', placeholder: 'Frecuencia de uso' },
  { clave: 'duracion', etiqueta: 'Duración', placeholder: 'Duración del tratamiento' },
]

/** Receta simple: cada fila es un medicamento y, si se añade, sus seis campos son obligatorios. */
export default function RecetaEditor({ receta, onCambio }: Props) {
  const cambiar = (indice: number, cambios: Partial<Medicamento>) =>
    onCambio(receta.map((m, i) => (i === indice ? { ...m, ...cambios } : m)))
  const quitar = (indice: number) => onCambio(receta.filter((_, i) => i !== indice))

  return (
    <div className="re">
      <p className="re__estado">
        <span className="md-chip">{receta.length === 0 ? 'Sin receta emitida' : `${receta.length} ${receta.length === 1 ? 'medicamento' : 'medicamentos'}`}</span>
      </p>

      {receta.map((fila, indice) => {
        const incompleta = !filaRecetaVacia(fila) && !filaRecetaCompleta(fila)
        const falta = (clave: keyof Medicamento) => incompleta && !fila[clave].trim()
        return (
          <fieldset key={indice} className="re__fila">
            <legend>Medicamento {indice + 1}</legend>

            <label className={`md-campo ${falta('medicamento') ? 'is-error' : ''}`}>
              <span>Medicamento</span>
              <input type="text" value={fila.medicamento} placeholder="Nombre del medicamento" onChange={(e) => cambiar(indice, { medicamento: e.target.value })} />
            </label>

            <div className="re__par">
              <label className={`md-campo ${falta('dosis') ? 'is-error' : ''}`}>
                <span>Dosis</span>
                <input type="text" value={fila.dosis} placeholder="Dosis prescrita" onChange={(e) => cambiar(indice, { dosis: e.target.value })} />
              </label>
              <label className={`md-campo ${falta('via') ? 'is-error' : ''}`}>
                <span>Vía</span>
                <select value={fila.via} onChange={(e) => cambiar(indice, { via: e.target.value })}>
                  <option value="">Seleccionar vía</option>
                  {VIAS.map((via) => <option key={via} value={via}>{via}</option>)}
                </select>
              </label>
            </div>

            <div className="re__par">
              {CAMPOS.filter((c) => c.clave !== 'dosis').map(({ clave, etiqueta, placeholder }) => (
                <label key={clave} className={`md-campo ${falta(clave) ? 'is-error' : ''}`}>
                  <span>{etiqueta}</span>
                  <input type="text" value={fila[clave]} placeholder={placeholder} onChange={(e) => cambiar(indice, { [clave]: e.target.value })} />
                </label>
              ))}
            </div>

            <label className={`md-campo ${falta('indicaciones') ? 'is-error' : ''}`}>
              <span>Indicaciones</span>
              <textarea value={fila.indicaciones} placeholder="Indicaciones del médico" onChange={(e) => cambiar(indice, { indicaciones: e.target.value })} />
            </label>

            {incompleta && <p className="md-campo__error">Completa los seis campos de este medicamento.</p>}
            <button type="button" className="md-btn md-btn--peligro md-btn--bloque" onClick={() => quitar(indice)}>Quitar medicamento</button>
          </fieldset>
        )
      })}

      <button type="button" className="md-btn md-btn--borde md-btn--bloque" onClick={() => onCambio([...receta, { ...MEDICAMENTO_VACIO }])}>
        <Plus size={16} aria-hidden="true" /> {receta.length === 0 ? 'Añadir receta' : 'Añadir medicamento'}
      </button>
      <p className="md-ayuda">Al añadir, completa medicamento, dosis, vía, frecuencia, duración e indicaciones. Los seis campos son obligatorios.</p>
      <p className="md-aviso md-aviso--amarillo"><Info size={15} aria-hidden="true" /> Receta simple · Sin firma digital ni validez legal.</p>
    </div>
  )
}
