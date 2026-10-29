import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import PacienteLayout from './layouts/PacienteLayout'
import InicioPaciente from './pages/paciente/Inicio'
import MisCitas from './pages/paciente/MisCitas'
import SolicitarCita from './pages/paciente/SolicitarCita'
import Diagnosticos from './pages/paciente/Diagnosticos'
import CuentaPaciente from './pages/paciente/CuentaPaciente'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import ReprogramarCita from './pages/paciente/Reprogramarcita'
import FeatureUnavailable from './pages/FeatureUnavailable'
import VideollamadaPaciente from './pages/paciente/Videollamada'
import VideollamadaMedico from './pages/medico/Videollamada'
import MedicoLayout from './layouts/MedicoLayout'
import AgendaMedico from './pages/medico/Agenda'
import MisPacientes from './pages/medico/MisPacientes'
import ExpedienteMedico from './pages/medico/Expediente'
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
          <Route path="/paciente/citas/:id/llamada" element={<VideollamadaPaciente />} />
          <Route path="/paciente" element={<PacienteLayout />}>
            <Route index element={<InicioPaciente />} />
            <Route path="citas" element={<MisCitas />} />
            <Route path="citas/solicitar" element={<SolicitarCita />} />
            <Route path="citas/:id" element={<ReprogramarCita />} />
            <Route path="citas/:id/reprogramar" element={<ReprogramarCita />} />
            <Route path="historial" element={<Diagnosticos />} />
            <Route path="recetas" element={<Diagnosticos />} />
            <Route path="cuenta" element={<CuentaPaciente />} />
            <Route path="cambiar-password" element={<FeatureUnavailable title="El cambio de contraseña no está disponible" detail="Esta acción no cuenta con una capacidad aprobada en esta versión." backTo="/paciente/cuenta" backLabel="Volver a mi cuenta" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="MEDICO" />}>
          <Route path="/medico" element={<MedicoLayout />}>
            <Route index element={<Navigate to="agenda" replace />} />
            <Route path="agenda" element={<AgendaMedico />} />
            <Route path="pacientes" element={<MisPacientes />} />
            <Route path="pacientes/:pacienteId" element={<ExpedienteMedico />} />
            <Route path="consulta/:citaCodigo" element={<RegistrarConsulta />} />
            <Route path="consultas/:consultaId" element={<ConsultaCompletada />} />
            <Route path="citas/:codigo/llamada" element={<VideollamadaMedico />} />
            <Route
              path="*"
              element={<FeatureUnavailable title="Esta sección del portal médico no existe" detail="La ruta solicitada no forma parte del portal médico integrado." backTo="/medico/agenda" backLabel="Volver a la agenda" />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
