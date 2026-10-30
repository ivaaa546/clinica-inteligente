import '../shared/components/ApiStates.css'

export default function LoadingState({ message = 'Cargando información…' }) {
  return (
    <div className="api-state api-state--loading" role="status" aria-live="polite">
      <span className="api-state__spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
