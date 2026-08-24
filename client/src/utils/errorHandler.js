export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
}
