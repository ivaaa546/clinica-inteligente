import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import PacienteLayout from './layouts/PacienteLayout'
import InicioPaciente from './pages/paciente/Inicio'
import MisCitas from './pages/paciente/MisCitas'
import SolicitarCita from './pages/paciente/SolicitarCita'
import Diagnosticos from './pages/paciente/Diagnosticos'
import Cuenta from './pages/paciente/Cuenta'
import CambiarPassword from './pages/paciente/CambiarPassword'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import ReprogramarCita from './pages/paciente/Reprogramarcita'
import FeatureUnavailable from './pages/FeatureUnavailable'
import MedicoLayout from './layouts/MedicoLayout'
import AgendaMedico from './pages/medico/Agenda'
import RegistrarConsulta from './pages/medico/RegistrarConsulta'
import ConsultaCompletada from './pages/medico/ConsultaCompletada'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />

        <Route element={<ProtectedRoute role="PACIENTE" />}>
          <Route
            path="/paciente/citas/:id/llamada"
            element={<FeatureUnavailable title="La videollamada aún no está disponible" detail="Esta pantalla no se habilita hasta completar la integración verificada con el proveedor de video." backTo="/paciente/citas" backLabel="Volver a mis citas" />}
          />
          <Route path="/paciente" element={<PacienteLayout />}>
            <Route index element={<InicioPaciente />} />
            <Route path="citas" element={<MisCitas />} />
            <Route path="citas/solicitar" element={<SolicitarCita />} />
            <Route path="citas/:id" element={<ReprogramarCita />} />
            <Route path="citas/:id/reprogramar" element={<ReprogramarCita />} />
            <Route path="historial" element={<Diagnosticos />} />
            <Route path="recetas" element={<Diagnosticos />} />
            <Route path="cuenta" element={<Cuenta />} />
            <Route path="cambiar-password" element={<CambiarPassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="MEDICO" />}>
          <Route path="/medico" element={<MedicoLayout />}>
            <Route path="agenda" element={<AgendaMedico />} />
            <Route path="consulta/:citaCodigo" element={<RegistrarConsulta />} />
            <Route path="consultas/:consultaId" element={<ConsultaCompletada />} />
            <Route
              path="*"
              element={<FeatureUnavailable title="Esta sección del portal médico aún no está disponible" detail="Solo la agenda y las transiciones de citas están conectadas y verificadas contra la API." backTo="/medico/agenda" backLabel="Volver a la agenda" />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
