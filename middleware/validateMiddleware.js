module.exports = (schema) => {

  return (req, res, next) => {

    const { error } = schema.validate(req.body, {
      abortEarly: false
    });

    if (error) {

      const errors = error.details.map(err => err.message);

      // AJAX request
if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(400).json({
          success: false,
          message: errors[0]
        });

      }

      req.session.message = {
        type: 'error',
        text: errors[0]
      };

      return res.redirect(req.get('Referer') || '/login');
    }

    next();

  };

};