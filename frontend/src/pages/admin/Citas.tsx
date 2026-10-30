import CitasAdmin from '../../components/admin/CitasAdmin'
import './admin.css'

export default function Citas() {
  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Citas</h1>
          <p>Cancela o reprograma citas futuras sin acceder a expedientes ni diagnósticos.</p>
        </div>
      </div>
      <CitasAdmin />
    </>
  )
}
