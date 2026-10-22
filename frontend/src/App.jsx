import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import PacienteLayout from './layouts/PacienteLayout'
import InicioPaciente from './pages/paciente/Inicio'
import MisCitas from './pages/paciente/MisCitas.jsx'
import SolicitarCita from './pages/paciente/SolicitarCita'
import Diagnosticos from './pages/paciente/Diagnosticos'
import ReprogramarCita from './pages/paciente/Reprogramarcita'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* Área del paciente: la sesión y el rol se verifican antes de renderizar el layout */}
        <Route element={<ProtectedRoute role="PACIENTE" />}>
          <Route path="/paciente" element={<PacienteLayout />}>
            <Route index element={<InicioPaciente />} />
            <Route path="citas" element={<MisCitas />} />
          <Route path="citas/solicitar" element={<SolicitarCita />} />
          <Route path="citas/:id/reprogramar" element={<ReprogramarCita />} />
          {/* Historial y recetas comparten pantalla (17 del Figma) */}
          <Route path="historial" element={<Diagnosticos />} />
          <Route path="recetas" element={<Diagnosticos />} />
            {/* Próximas pantallas:
            <Route path="citas" element={<MisCitas />} />
            <Route path="cambiar-password" element={<CambiarPassword />} /> */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
