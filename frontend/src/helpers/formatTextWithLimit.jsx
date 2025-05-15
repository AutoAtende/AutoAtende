export default (text, limit) => {
  if (typeof text !== 'string' || text.length < limit || !limit) return text
  return `${text.slice(0, limit)}...`
}
