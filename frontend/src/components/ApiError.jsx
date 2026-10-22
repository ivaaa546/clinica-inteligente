import './ApiStates.css'

function messageFor(error) {
  if (error?.isNetworkError) {
    return 'No fue posible conectar con el servicio. Verificá tu conexión e intentá nuevamente.'
  }

  switch (error?.status) {
    case 400:
      return 'No pudimos procesar los datos enviados. Revisá la información e intentá nuevamente.'
    case 401:
      return 'Tu sesión no está disponible. Iniciá sesión nuevamente para continuar.'
    case 403:
      return 'No tenés permiso para realizar esta acción.'
    case 500:
      return 'Ocurrió un problema en el servidor. Intentá nuevamente más tarde.'
    default:
      return 'No pudimos completar la solicitud. Intentá nuevamente.'
  }
}

export default function ApiError({ error, onRetry, title = 'No se pudo cargar la información' }) {
  return (
    <section className="api-state api-state--error" role="alert" aria-live="assertive">
      <h2>{title}</h2>
      <p>{messageFor(error)}</p>
      {onRetry && (
        <button className="api-state__retry" type="button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </section>
  )
}
