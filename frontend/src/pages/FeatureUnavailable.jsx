import { Link } from 'react-router-dom'

export default function FeatureUnavailable({ title, detail, backTo, backLabel }) {
  return (
    <main className="route-state" aria-labelledby="feature-unavailable-title">
      <section className="route-state__panel">
        <p className="eyebrow">NO DISPONIBLE</p>
        <h1 id="feature-unavailable-title">{title}</h1>
        <p>{detail}</p>
        <Link className="route-state__link" to={backTo}>{backLabel}</Link>
      </section>
    </main>
  )
}
