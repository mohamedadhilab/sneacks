module.exports = (schema) => {

  return (req, res, next) => {

    const { error } = schema.validate(req.body, {
      abortEarly: false
    });

    if (error) {

      const errors = error.details.map(err => err.message);

      req.session.message = {
        type: 'error',
        text: errors[0]
      };

      return res.redirect(req.get('Referer') || '/login');
    }

    next();
  };
};