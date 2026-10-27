import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import EnConstruccion from './pages/medico/EnConstruccion'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* Sala de videollamada: pantalla completa, sin el menú del paciente */}
        <Route path="/paciente/citas/:id/llamada" element={<Videollamada />} />

        {/* Área del paciente: el layout envuelve a todas sus pantallas */}
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

        {/* Área del médico: el layout envuelve a todas sus pantallas */}
        <Route path="/medico" element={<MedicoLayout />}>
          <Route index element={<Navigate to="agenda" replace />} />
          <Route path="agenda" element={<EnConstruccion titulo="Tu agenda, con calma" descripcion="Gestiona tus citas y los bloques que ofreces a tus pacientes." />} />
          <Route path="pacientes" element={<EnConstruccion titulo="Mis pacientes" descripcion="Las personas que acompañas, con su historia a mano." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
