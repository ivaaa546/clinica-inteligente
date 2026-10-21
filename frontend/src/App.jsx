import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Recuperar from './pages/Recuperar'
import PacienteLayout from './layouts/PacienteLayout'
import InicioPaciente from './pages/paciente/Inicio'
import SolicitarCita from './pages/paciente/SolicitarCita'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {} /esto es todo lo principal
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<Recuperar />} />
          /rutas
        {}
        <Route path="/paciente" element={<PacienteLayout />}>
          <Route index element={<InicioPaciente />} />
          <Route path="citas/solicitar" element={<SolicitarCita />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}