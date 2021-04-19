const createError = require("http-errors");

exports.default = function validate(schema, property) {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");

      next(createError(422, { message }));
    }
  };
};
