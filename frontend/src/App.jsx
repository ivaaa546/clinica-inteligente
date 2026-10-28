import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import PacienteLayout from './layouts/PacienteLayout'
import InicioPaciente from './pages/paciente/Inicio'
import MisCitas from './pages/paciente/MisCitas'
import SolicitarCita from './pages/paciente/SolicitarCita'
import DetalleCita from './pages/paciente/DetalleCita'
import Videollamada from './pages/paciente/Videollamada'
import Diagnosticos from './pages/paciente/Diagnosticos'
import Recetas from './pages/paciente/Recetas'
import Cuenta from './pages/paciente/Cuenta'
import CambiarPassword from './pages/paciente/CambiarPassword'
import MedicoLayout from './layouts/MedicoLayout'
import AgendaMedico from './pages/medico/Agenda'
import MisPacientes from './pages/medico/MisPacientes'
import ExpedienteMedico from './pages/medico/Expediente'
import RegistrarConsulta from './pages/medico/RegistrarConsulta'
import ConsultaCompletada from './pages/medico/ConsultaCompletada'
import VideollamadaMedico from './pages/medico/Videollamada'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />

        <Route element={<ProtectedRoute role="PACIENTE" />}>
          <Route path="/paciente/citas/:id/llamada" element={<Videollamada />} />
          <Route path="/paciente" element={<PacienteLayout />}>
            <Route index element={<InicioPaciente />} />
            <Route path="citas" element={<MisCitas />} />
            <Route path="citas/solicitar" element={<SolicitarCita />} />
            <Route path="citas/:id" element={<DetalleCita />} />
            <Route path="citas/:id/reprogramar" element={<DetalleCita />} />
            <Route path="historial" element={<Diagnosticos />} />
            <Route path="recetas" element={<Recetas />} />
            <Route path="cuenta" element={<Cuenta />} />
            <Route path="cambiar-password" element={<CambiarPassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="MEDICO" />}>
          <Route path="/medico/citas/:codigo/llamada" element={<VideollamadaMedico />} />
          <Route path="/medico" element={<MedicoLayout />}>
            <Route index element={<Navigate to="agenda" replace />} />
            <Route path="agenda" element={<AgendaMedico />} />
            <Route path="pacientes" element={<MisPacientes />} />
            <Route path="pacientes/:pacienteId" element={<ExpedienteMedico />} />
            <Route path="consulta/:citaCodigo" element={<RegistrarConsulta />} />
            <Route path="consultas/:consultaId" element={<ConsultaCompletada />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
