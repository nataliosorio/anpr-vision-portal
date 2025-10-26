// El valor no debe estar vacío
export const isRequired = (value: string): boolean =>
  value.trim().length > 0;

// Longitud máxima
export const maxLength = (value: string, max: number): boolean =>
  value.trim().length <= max;

// Longitud mínima
export const minLength = (value: string, min: number): boolean =>
  value.trim().length >= min;

// Email válido
export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Contraseña segura: mínimo 8, mayúscula, minúscula, número
export const isPasswordValid = (value: string): boolean =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(value);

// Teléfono genérico (7-15 dígitos)
export const isPhoneNumber = (value: string): boolean =>
  /^[0-9]{7,15}$/.test(value);

// Teléfono Colombia (exactamente 10 dígitos)
export const isColombianPhone = (value: string): boolean =>
  /^[0-9]{10}$/.test(value);
