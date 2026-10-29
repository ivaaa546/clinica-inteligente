import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import PersonalLogin from './pages/PersonalLogin'
import PacienteLayout from './layouts/PacienteLayout'
import InicioPaciente from './pages/paciente/Inicio'
import MisCitas from './pages/paciente/MisCitas'
import SolicitarCita from './pages/paciente/SolicitarCita'
import Diagnosticos from './pages/paciente/Diagnosticos'
import CuentaPaciente from './pages/paciente/CuentaPaciente'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import ReprogramarCita from './pages/paciente/Reprogramarcita'
import FeatureUnavailable from './pages/FeatureUnavailable'
import MedicoLayout from './layouts/MedicoLayout'
import AgendaMedico from './pages/medico/Agenda'
import MisPacientes from './pages/medico/MisPacientes'
import ExpedienteMedico from './pages/medico/Expediente'
import RegistrarConsulta from './pages/medico/RegistrarConsulta'
import ConsultaCompletada from './pages/medico/ConsultaCompletada'
import AdminLayout from './layouts/AdminLayout'
import Usuarios from './pages/admin/Usuarios'
import CrearMedico from './pages/admin/CrearMedico'
import EditarUsuario from './pages/admin/EditarUsuario'
import Especialidades from './pages/admin/Especialidades'
import Citas from './pages/admin/Citas'
import Metricas from './pages/admin/Metricas'
import CuentaPersonal from './pages/personal/Cuenta'

const VideollamadaPaciente = lazy(() => import('./pages/paciente/Videollamada'))
const VideollamadaMedico = lazy(() => import('./pages/medico/Videollamada'))

function UnavailableRoute() {
  return <FeatureUnavailable title="Página no encontrada" detail="La ruta solicitada no forma parte de la plataforma." backTo="/" backLabel="Volver al inicio" />
}

function LoadingRoute() {
  return <p role="status">Cargando…</p>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingRoute />}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/acceso-personal" element={<PersonalLogin />} />

        <Route element={<ProtectedRoute role="PACIENTE" />}>
          <Route path="/paciente/citas/:id/llamada" element={<VideollamadaPaciente />} />
          <Route path="/paciente" element={<PacienteLayout />}>
            <Route index element={<InicioPaciente />} />
            <Route path="citas" element={<MisCitas />} />
            <Route path="citas/solicitar" element={<SolicitarCita />} />
            <Route path="citas/:id" element={<ReprogramarCita />} />
            <Route path="citas/:id/reprogramar" element={<ReprogramarCita />} />
            <Route path="historial" element={<FeatureUnavailable title="El historial clínico no está disponible" detail="Esta versión solo expone recetas simples y no presenta un historial clínico completo." backTo="/paciente" backLabel="Volver al inicio" />} />
            <Route path="recetas" element={<Diagnosticos />} />
            <Route path="cuenta" element={<CuentaPaciente />} />
            <Route path="cambiar-password" element={<FeatureUnavailable title="El cambio de contraseña no está disponible" detail="Esta acción no cuenta con una capacidad aprobada en esta versión." backTo="/paciente/cuenta" backLabel="Volver a mi cuenta" />} />
            <Route path="*" element={<UnavailableRoute />} />
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
            <Route path="cuenta" element={<CuentaPersonal volverA="/medico/agenda" />} />
            <Route path="*" element={<UnavailableRoute />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="ADMINISTRADOR" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="usuarios" replace />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="usuarios/nuevo-medico" element={<CrearMedico />} />
            <Route path="usuarios/:id" element={<EditarUsuario />} />
            <Route path="especialidades" element={<Especialidades />} />
            <Route path="citas" element={<Citas />} />
            <Route path="metricas" element={<Metricas />} />
            <Route path="cuenta" element={<CuentaPersonal volverA="/admin/usuarios" />} />
            <Route path="*" element={<UnavailableRoute />} />
          </Route>
        </Route>

        <Route path="*" element={<UnavailableRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
