import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Search } from 'lucide-react'
import { listarPacientes } from '../../services/medicoService'
import { formatearFecha, hoyISO } from '../../shared/lib/fechas'
import { edadTexto } from '../../shared/lib/consulta'
import type { PacienteVinculado } from '../../types/medico'
import './MisPacientes.css'

/** Minúsculas y sin tildes: "Lucía" coincide con "lucia" */
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const iniciales = (nombre: string, apellidos: string) => `${nombre[0] ?? ''}${apellidos[0] ?? ''}`.toUpperCase()

export default function MisPacientes() {
  const [pacientes, setPacientes] = useState<PacienteVinculado[] | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    listarPacientes()
      .then((lista) => { if (vigente) setPacientes(lista) })
      .catch((e: Error) => { if (vigente) setError(e.message) })
    return () => { vigente = false }
  }, [])

  const total = pacientes?.length ?? 0
  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim())
    return (pacientes ?? []).filter(({ paciente }) => normalizar(`${paciente.nombre} ${paciente.apellidos}`).includes(texto))
  }, [pacientes, busqueda])

  return (
    <>
      <div className="mp-head">
        <h1>Mis pacientes</h1>
        <p>Las personas que acompañas, con su historia a mano.</p>
      </div>

      <p className="mp-aviso">
        <Info size={15} aria-hidden="true" />
        Acceso restringido a los pacientes vinculados a tu atención. Esta vista no incluye expedientes de otros médicos.
      </p>

      {error && <p className="mp-error" role="alert">{error}</p>}

      <section className="mp-card" aria-labelledby="mp-titulo">
        <div className="mp-card__top">
          <h2 id="mp-titulo">Pacientes vinculados</h2>
          {pacientes && <span>{total} {total === 1 ? 'paciente vinculado' : 'pacientes vinculados'}</span>}
        </div>

        <div className="mp-buscar">
          <label htmlFor="mp-buscar">Buscar paciente por nombre</label>
          <div className="mp-buscar__fila">
            <div className="mp-buscar__campo">
              <input
                id="mp-buscar" type="search" value={busqueda} placeholder="Escribe un nombre…"
                autoComplete="off" onChange={(e) => setBusqueda(e.target.value)}
              />
              <Search size={16} aria-hidden="true" />
            </div>
            {pacientes && <span className="mp-buscar__cuenta" aria-live="polite">Mostrando {visibles.length} de {total} {total === 1 ? 'paciente' : 'pacientes'}</span>}
          </div>
        </div>

        {!pacientes && !error && <p className="mp-vacio">Cargando pacientes…</p>}
        {pacientes && total === 0 && <p className="mp-vacio">Aún no tienes pacientes vinculados.</p>}
        {pacientes && total > 0 && visibles.length === 0 && <p className="mp-vacio">No encontramos pacientes con ese nombre.</p>}

        {visibles.length > 0 && (
          <table className="mp-tabla">
            <thead>
              <tr>
                <th scope="col">PACIENTE</th>
                <th scope="col">CONTACTO</th>
                <th scope="col">ÚLTIMA CONSULTA</th>
                <th scope="col">EXPEDIENTE</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(({ paciente, ultimaConsulta }) => (
                <tr key={paciente.id}>
                  <td data-label="Paciente">
                    <div className="mp-persona">
                      <span className="mp-avatar" aria-hidden="true">{iniciales(paciente.nombre, paciente.apellidos)}</span>
                      <div>
                        <strong>{paciente.nombre} {paciente.apellidos}</strong>
                        <small>{paciente.id} · {edadTexto(paciente.nacimiento, hoyISO())}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contacto">{paciente.email}</td>
                  <td data-label="Última consulta">
                    {ultimaConsulta ? (
                      <div className="mp-ultima">
                        <span>{formatearFecha(ultimaConsulta.fecha)}</span>
                        <small>{ultimaConsulta.motivo}</small>
                      </div>
                    ) : <span className="mp-ninguna">Sin consultas</span>}
                  </td>
                  <td data-label="Expediente">
                    <Link to={`/medico/pacientes/${paciente.id}`} className="mp-abrir">Abrir expediente</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mp-pie">Cada expediente reúne datos clínicos generales, consultas y recetas asociadas.</p>
      </section>
    </>
  )
}
