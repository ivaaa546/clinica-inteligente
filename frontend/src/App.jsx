import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
      </Routes>
    </BrowserRouter>
  )
}
