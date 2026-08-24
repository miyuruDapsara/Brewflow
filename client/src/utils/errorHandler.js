function isUnreachableError(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ECONNRESET' ||
    /network error/i.test(message) ||
    /ECONNREFUSED|ECONNRESET/i.test(message)
  );
}

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

  // Vite proxy / network failures often surface as axios "status code 500"
  // with no API body while the backend is restarting or unreachable.
  if (!error.response && isUnreachableError(error)) {
    return 'Cannot reach the server. Check that the API is running and try again.';
  }

  if (
    error.response?.status >= 500 &&
    typeof error.message === 'string' &&
    /status code 5\d\d/i.test(error.message) &&
    !error.response?.data?.error?.message
  ) {
    return 'Server is temporarily unavailable. Please try again in a moment.';
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
}
