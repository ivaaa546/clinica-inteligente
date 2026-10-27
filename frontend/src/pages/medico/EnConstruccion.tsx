import './EnConstruccion.css'

interface Props {
  titulo: string
  descripcion: string
}

/** Marcador temporal: cada pantalla del médico lo reemplaza cuando se construye. */
export default function EnConstruccion({ titulo, descripcion }: Props) {
  return (
    <section className="obra">
      <h1>{titulo}</h1>
      <p>{descripcion}</p>
      <p className="obra__aviso">Esta pantalla se construye en un paso posterior.</p>
    </section>
  )
}
