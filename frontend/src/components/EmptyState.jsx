import './ApiStates.css'

export default function EmptyState({ title = 'No hay información disponible', message }) {
  return (
    <section className="api-state api-state--empty" aria-labelledby="empty-state-title">
      <h2 id="empty-state-title">{title}</h2>
      {message && <p>{message}</p>}
    </section>
  )
}
