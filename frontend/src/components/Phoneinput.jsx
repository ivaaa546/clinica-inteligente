import { useState } from 'react'
import './PhoneInput.css'

const PREFIJO = '+502' // Guatemala

/** Deja solo los dígitos del número local (máx. 8). Si pegan el número con +502, se lo quita. */
const soloLocales = (texto = '') => {
  let digitos = texto.replace(/\D/g, '')
  if (digitos.startsWith('502') && digitos.length > 8) digitos = digitos.slice(3)
  return digitos.slice(0, 8)
}

/** 41773794 -> '4177 3794' */
const agrupar = (d) => (d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d)

/** Lo escrito o pegado -> '+502 4177 3794' (o '' si no hay dígitos). Es lo que se guarda. */
export const normalizarTelefono = (texto = '') => {
  const digitos = soloLocales(texto)
  return digitos ? `${PREFIJO} ${agrupar(digitos)}` : ''
}

/**
 * Campo de teléfono de Guatemala.
 * Muestra la bandera y el +502 automáticamente; la persona solo escribe los 8 dígitos
 * (por ejemplo 41773794) y se ve (bandera) +502 4177 3794.
 *
 * `value` y lo que se envía en `onChange` es el número completo: '+502 4177 3794'
 * (o '' si está vacío), para guardarlo tal cual en `usuario.telefono`.
 * Colócalo dentro de un contenedor flex (`.field__input` o `.cta-pass`).
 */
export default function PhoneInput({ value = '', onChange, name = 'telefono', required }) {
  const [fallo, setFallo] = useState(false)
  const local = soloLocales(value.startsWith(PREFIJO) ? value.slice(PREFIJO.length) : value)

  const cambiar = (e) => onChange({ target: { name, value: normalizarTelefono(e.target.value) } })

  // Al pegar un número completo (con o sin +502) reemplaza lo escrito
  const pegar = (e) => {
    e.preventDefault()
    onChange({ target: { name, value: normalizarTelefono(e.clipboardData.getData('text')) } })
  }

  return (
    <>
      {fallo ? (
        <span className="phone-flag phone-flag--emoji" title="Guatemala">🇬🇹</span>
      ) : (
        <img
          className="phone-flag"
          src="https://flagcdn.com/24x18/gt.png"
          alt="Guatemala"
          title="Guatemala"
          width="24"
          height="18"
          onError={() => setFallo(true)}
        />
      )}
      <span className="phone-code">{PREFIJO}</span>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        name={name}
        value={agrupar(local)}
        onChange={cambiar}
        onPaste={pegar}
        required={required}
        placeholder="0000 0000"
        pattern="\d{4} \d{4}"
        title="Escribe los 8 dígitos de tu número, por ejemplo 4177 3794"
        maxLength={9}
      />
    </>
  )
}
