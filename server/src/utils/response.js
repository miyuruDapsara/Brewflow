function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function sendMessage(res, message, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
  });
}

module.exports = {
  sendSuccess,
  sendMessage,
};
