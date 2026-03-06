export function getErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallbackMessage;
}
