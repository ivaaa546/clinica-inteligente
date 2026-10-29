const STORAGE_KEY = 'tm:clinic-address'
export const DEFAULT_CLINIC_ADDRESS = 'Oficina Central Barrio El Calvario, San Juan Chamelco, Alta Verapaz'

export function getClinicAddress() {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || DEFAULT_CLINIC_ADDRESS
  } catch {
    return DEFAULT_CLINIC_ADDRESS
  }
}

export function saveClinicAddress(address) {
  const normalized = address.trim()
  if (!normalized) throw new Error('Ingresa la dirección de la clínica.')
  if (normalized.length > 255) throw new Error('La dirección no puede superar 255 caracteres.')
  localStorage.setItem(STORAGE_KEY, normalized)
  return normalized
}
