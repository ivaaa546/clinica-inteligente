/** Minúsculas y sin tildes: "Lucía" coincide con "lucia" (para búsquedas y comparaciones de nombres) */
export const normalizar = (texto: string): string => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export const esCorreo = (texto: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto.trim())
