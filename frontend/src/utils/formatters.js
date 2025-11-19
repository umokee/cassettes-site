export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('ru-RU')
}
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount)
}
export const formatPhone = (phone) => {
  return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5')
}
