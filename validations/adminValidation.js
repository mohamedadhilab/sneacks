const Joi = require('joi');

exports.loginSchema = Joi.object({

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Enter valid email',
      'string.empty': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })

});