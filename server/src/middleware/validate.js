const ApiError = require('../utils/ApiError');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.') || property,
        message: detail.message,
      }));

      return next(ApiError.badRequest('Invalid input', details));
    }

    req[property] = value;
    return next();
  };
}

module.exports = validate;
