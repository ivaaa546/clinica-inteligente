import { useState } from 'react'
import { MapPin, Save } from 'lucide-react'
import { DEFAULT_CLINIC_ADDRESS, getClinicAddress, saveClinicAddress } from '../../services/clinicSettings'
import './admin.css'

export default function ConfiguracionClinica() {
  const [direccion, setDireccion] = useState(getClinicAddress)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  const guardar = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setGuardado(false)
    try {
      setDireccion(saveClinicAddress(direccion))
      setGuardado(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la dirección.')
    }
  }

  return (
    <section className="ad-pagina">
      <header className="ad-encabezado">
        <div><p className="ad-eyebrow">ADMINISTRACIÓN</p><h1>Configuración de la clínica</h1><p>Actualiza la dirección que se muestra en la página de inicio.</p></div>
      </header>
      <form onSubmit={guardar} style={{ maxWidth: 680, padding: 24, background: '#fff', border: '1px solid #e5ebe6', borderRadius: 16 }}>
        <label htmlFor="direccion-clinica" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}><MapPin size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Dirección de la clínica</label>
        <textarea id="direccion-clinica" value={direccion} onChange={(e) => { setDireccion(e.target.value); setGuardado(false) }} maxLength={255} required rows={3} placeholder="Calle, zona, municipio, departamento" style={{ width: '100%', boxSizing: 'border-box', padding: 12, border: '1px solid #cbd7ce', borderRadius: 8, font: 'inherit', resize: 'vertical' }} />
        <small style={{ display: 'block', marginTop: 6, color: '#68766d' }}>{direccion.length}/255 caracteres</small>
        {error && <p role="alert" style={{ color: '#a32929' }}>{error}</p>}
        {guardado && <p role="status" style={{ color: '#217443' }}>Dirección guardada correctamente.</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button type="submit" className="ad-btn ad-btn--primario"><Save size={16} /> Guardar dirección</button>
          <button type="button" className="ad-btn" onClick={() => { setDireccion(DEFAULT_CLINIC_ADDRESS); setGuardado(false); setError('') }}>Restaurar valor inicial</button>
        </div>
        <p style={{ marginTop: 16, color: '#68766d', fontSize: 13 }}>El cambio se aplica en la página pública de inicio.</p>
      </form>
    </section>
  )
}
