export const required = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Обязательное поле'
  }
  return null
}
export const email = (value) => {
  if (!value) return null
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) ? null : 'Неверный формат email'
}
export const phone = (value) => {
  if (!value) return null
  const pattern = /^\+?[\d\s\-()]+$/
  return pattern.test(value) ? null : 'Неверный формат телефона'
}
export const minLength = (min) => (value) => {
  if (!value) return null
  return value.length >= min ? null : `Минимум ${min} символов`
}
export const maxLength = (max) => (value) => {
  if (!value) return null
  return value.length <= max ? null : `Максимум ${max} символов`
}
export const number = (value) => {
  if (value === null || value === undefined || value === '') return null
  return !isNaN(Number(value)) ? null : 'Должно быть числом'
}
export const positive = (value) => {
  if (value === null || value === undefined || value === '') return null
  return Number(value) > 0 ? null : 'Должно быть положительным числом'
}
