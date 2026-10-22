import { useState } from 'react'
import { Phone } from 'lucide-react'
import './PhoneInput.css'

// Prefijo telefónico -> [código ISO del país, nombre]. Agrega más países aquí si hace falta.
const PAISES = {
  1: ['us', 'Estados Unidos / Canadá'], 7: ['ru', 'Rusia'],
  33: ['fr', 'Francia'], 34: ['es', 'España'], 39: ['it', 'Italia'], 44: ['gb', 'Reino Unido'],
  49: ['de', 'Alemania'], 51: ['pe', 'Perú'], 52: ['mx', 'México'], 53: ['cu', 'Cuba'],
  54: ['ar', 'Argentina'], 55: ['br', 'Brasil'], 56: ['cl', 'Chile'], 57: ['co', 'Colombia'],
  58: ['ve', 'Venezuela'], 81: ['jp', 'Japón'], 82: ['kr', 'Corea del Sur'], 86: ['cn', 'China'],
  91: ['in', 'India'], 351: ['pt', 'Portugal'],
  501: ['bz', 'Belice'], 502: ['gt', 'Guatemala'], 503: ['sv', 'El Salvador'], 504: ['hn', 'Honduras'],
  505: ['ni', 'Nicaragua'], 506: ['cr', 'Costa Rica'], 507: ['pa', 'Panamá'],
  591: ['bo', 'Bolivia'], 593: ['ec', 'Ecuador'], 595: ['py', 'Paraguay'], 598: ['uy', 'Uruguay'],
}

// Busca el país por el prefijo (+502, +503, +52...). Prueba primero con 3 dígitos, luego 2 y 1.
export function paisDe(valor = '') {
  const texto = valor.trim()
  if (!texto.startsWith('+')) return null
  const digitos = texto.replace(/\D/g, '')
  for (const n of [3, 2, 1]) {
    if (digitos.length >= n && PAISES[digitos.slice(0, n)]) return PAISES[digitos.slice(0, n)]
  }
  return null
}

// Respaldo si la imagen no carga: emoji de bandera (en Windows puede verse como letras)
const emoji = (iso) => iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))

/**
 * Devuelve la bandera + el <input>. Colócalo dentro de un contenedor flex
 * (por ejemplo `.field__input` o `.cta-pass`), que ya aporta el borde y el fondo.
 */
export default function PhoneInput({ value, onChange, name = 'telefono', required, placeholder = '+502 0000 0000' }) {
  const [fallo, setFallo] = useState(false)
  const pais = paisDe(value)

  return (
    <>
      {pais ? (
        fallo ? (
          <span className="phone-flag phone-flag--emoji" title={pais[1]}>{emoji(pais[0])}</span>
        ) : (
          <img
            className="phone-flag"
            src={`https://flagcdn.com/24x18/${pais[0]}.png`}
            alt={pais[1]}
            title={pais[1]}
            width="24"
            height="18"
            onError={() => setFallo(true)}
          />
        )
      ) : (
        <Phone size={18} color="#4f6e5b" className="phone-icon" />
      )}
      <input type="tel" name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} />
    </>
  )
}