import { Link } from 'react-router-dom'
import {
  Video, HeartHandshake, FileText, Pill,
  CalendarCheck, FolderHeart, Mail, Phone, MapPin,
} from 'lucide-react'
import './Home.css'
import logoMediQuetzal from '../assets/MediQuetzalbueno.png'
import fotoInicio1 from '../assets/home/1.jpg'
import fotoInicio2 from '../assets/home/2.jpg'
import fotoInicio3 from '../assets/home/3.jpg'
import fotoInicio4 from '../assets/home/4.jpg'
import fotoEquipo from '../assets/home/5.jpg'

const CLINIC_ADDRESS = 'Oficina Central Barrio El Calvario, San Juan Chamelco, Alta Verapaz'
const FOTOS_INICIO = [fotoInicio1, fotoInicio2, fotoInicio3, fotoInicio4]

const NAV = [
  { label: 'Inicio', href: '#inicio', active: true },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
]

const SERVICIOS = [
  { icon: Video, titulo: 'Solicita una cita médica', texto: 'Elige especialidad y horario en bloques de 30 min.' },
  { icon: HeartHandshake, titulo: 'Revisa el estado de tu solicitud', texto: 'Sigue si tu solicitud está pendiente, aceptada o rechazada.' },
  { icon: FileText, titulo: 'Diagnóstico y recetas', texto: 'Consulta el diagnóstico y las recetas asociadas a tu atención.' },
  { icon: Pill, titulo: 'Recetas asociadas', texto: 'Consulta la receta que tu médico registre para ti.' },
]

const PASOS = [
  { titulo: 'Registra tu cuenta', texto: 'Completa tus datos para crear tu cuenta.' },
  { titulo: 'Elige especialidad y horario', texto: 'Selecciona un horario disponible en bloques de 30 min.' },
  { titulo: 'El médico acepta o rechaza', texto: 'Recibe el estado de tu solicitud y la confirmación del horario.' },
  { titulo: 'Consulta diagnóstico y receta', texto: 'Accede al diagnóstico y a la receta emitida por tu médico.' },
]

const VENTAJAS = [
  { icon: CalendarCheck, titulo: 'Elige horario y especialidad', texto: 'Selecciona la especialidad y el horario que mejor se adapte a ti.' },
  { icon: Video, titulo: 'Sigue el estado de tu solicitud', texto: 'Revisa si tu solicitud está pendiente, aceptada o rechazada.' },
  { icon: FolderHeart, titulo: 'Diagnóstico y receta en un solo lugar', texto: 'Consulta el diagnóstico y la receta emitida por tu médico.' },
]

const FAQ = [
  { p: '¿Qué necesito para solicitar una cita?', r: 'Una cuenta registrada, datos personales actualizados y una conexión estable para completar tu solicitud.' },
  { p: '¿Cuándo sé si mi cita fue aceptada?', r: 'Recibirás el estado de tu solicitud en tu cuenta una vez que el médico la revise.' },
  { p: '¿Dónde veo mi diagnóstico y receta?', r: 'Una vez completada la atención, podrás consultar el diagnóstico y la receta asociada en tu cuenta.' },
  { p: '¿Sirve para emergencias?', r: 'No reemplaza la atención de emergencia. Si necesitas ayuda inmediata, acude a un servicio presencial.' },
]

const CONTACTO = [
  { icon: Mail, titulo: 'Correo de contacto', texto: 'contacto@mediquetzal.com' },
  { icon: Phone, titulo: 'Teléfono', texto: '+502 4935 2697' },
  { icon: MapPin, titulo: 'Dirección', texto: null },
]

function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand__emblem"><img src={logoMediQuetzal} alt="Logo MediQuetzal" /></span>
      <span className="brand__text">
        <strong>MediQuetzal</strong>
        <small>PLATAFORMA MÉDICA</small>
      </span>
    </Link>
  )
}

function SectionHead({ eyebrow, titulo }) {
  return (
    <div className="section-head">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{titulo}</h2>
    </div>
  )
}

export default function Home() {
  return (
    <div className="home">
      <header className="home__header">
        <Brand />
        <nav className="home__nav">
          {NAV.map(({ label, href, active }) => (
            <a key={label} href={href} className={active ? 'is-active' : ''}>{label}</a>
          ))}
        </nav>
        <Link to="/login" className="btn-outline">Login</Link>
      </header>

      <section id="inicio" className="hero">
        <div className="hero__text">
          <p className="hero__tag"><span className="dot" /> GESTIÓN DE CITAS MÉDICAS</p>
          <h1>Citas médicas,<br />más cerca de ti.</h1>
          <p className="hero__lead">
            Solicita citas por especialidad, revisa el estado de tu solicitud y
            consulta diagnósticos y recetas en tu cuenta.
          </p>
          <div className="hero__cta">
            <Link to="/registro" className="btn-solid">Crear cuenta →</Link>
            <span>Registra tu cuenta como paciente</span>
          </div>
        </div>
        <div
          className="photo-slot photo-slot--hero hero-gallery"
          role="img"
          aria-label="Atención médica y equipo de MediQuetzal"
        >
          {FOTOS_INICIO.map((foto, indice) => (
            <img
              key={foto}
              src={foto}
              alt=""
              aria-hidden="true"
              className={`hero-gallery__image hero-gallery__image--${indice + 1}`}
            />
          ))}
        </div>
      </section>

      <section id="servicios" className="block">
        <SectionHead eyebrow="SERVICIOS PARA PACIENTES" titulo="Gestiona tu atención médica en línea" />
        <div className="cards">
          {SERVICIOS.map(({ icon: Icon, titulo, texto }) => (
            <article className="card" key={titulo}>
              <span className="card__icon"><Icon size={22} color="#16713e" /></span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="block block--tint">
        <SectionHead eyebrow="CÓMO FUNCIONA" titulo="Tu atención médica, paso a paso" />
        <div className="steps">
          {PASOS.map(({ titulo, texto }, i) => (
            <div className="step" key={titulo}>
              <span className={`step__num ${i === 0 ? 'is-first' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="nosotros" className="block about">
        <div className="photo-slot photo-slot--about about__photo">
          <img src={fotoEquipo} alt="Equipo médico de MediQuetzal" />
        </div>
        <div className="about__text">
          <SectionHead eyebrow="NOSOTROS" titulo="Gestión de citas médicas con claridad" />
          <p>
            MediQuetzal ayuda a pacientes a solicitar citas, revisar el estado de su
            solicitud y consultar diagnósticos y recetas de forma simple y organizada.
          </p>
          <p className="about__focus"><span />Un espacio para gestionar tu atención médica.</p>
        </div>
      </section>

      <section className="block block--tint">
        <SectionHead eyebrow="PENSADO PARA TI" titulo="Ventajas para tu atención" />
        <div className="perks">
          {VENTAJAS.map(({ icon: Icon, titulo, texto }) => (
            <div className="perk" key={titulo}>
              <Icon size={22} color="#16713e" />
              <div><h3>{titulo}</h3><p>{texto}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="block faq">
        <div className="faq__head">
          <SectionHead eyebrow="PREGUNTAS FRECUENTES" titulo="Antes de solicitar tu cita" />
          <p>Todo lo que necesitas saber antes de usar la plataforma.</p>
        </div>
        <div className="faq__list">
          {FAQ.map(({ p, r }) => (
            <div className="faq__item" key={p}><h3>{p}</h3><p>{r}</p></div>
          ))}
        </div>
      </section>

      <section id="contacto" className="block block--tint">
        <SectionHead eyebrow="CONTACTO" titulo="Estamos para orientarte" />
        <div className="channels">
          {CONTACTO.map(({ icon: Icon, titulo, texto }) => (
            <div className="channel" key={titulo}>
              <Icon size={22} color="#16713e" />
              <div><strong>{titulo}</strong><span>{titulo === 'Dirección' ? CLINIC_ADDRESS : texto}</span></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="home__footer">
        <small>© 2026 MediQuetzal</small>
        <Link to="/privacidad">Aviso de privacidad</Link>
      </footer>
    </div>
  )
}
