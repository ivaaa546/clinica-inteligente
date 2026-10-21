import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import PacienteLayout from './layouts/PacienteLayout'
import InicioPaciente from './pages/paciente/Inicio'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* Área del paciente: el layout envuelve a todas sus pantallas */}
        <Route path="/paciente" element={<PacienteLayout />}>
          <Route index element={<InicioPaciente />} />
          {/* Próximas pantallas:
          <Route path="citas" element={<MisCitas />} />
          <Route path="solicitar" element={<SolicitarCita />} />
          <Route path="historial" element={<Historial />} />
          <Route path="recetas" element={<Recetas />} />
          <Route path="cambiar-password" element={<CambiarPassword />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}