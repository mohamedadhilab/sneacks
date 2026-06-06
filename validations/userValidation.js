const Joi = require('joi');

exports.signupSchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name must be less than 50 characters'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter a valid email',
      'string.pattern.base': 'Email contains invalid characters'
    }),

  password: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must be less than 20 characters'
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required'
    })
});


exports.loginSchema = Joi.object({

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter valid email'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});


exports.otpSchema = Joi.object({

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),

  otp: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.pattern.base': 'OTP must be 6 digits'
    }),

  purpose: Joi.string()
    .valid('signup', 'forgot', 'email-change')
    .required()
});


exports.forgotPasswordSchema = Joi.object({

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter valid email'
    })
});


exports.resetPasswordSchema = Joi.object({

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),

  password: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match'
    })
});


exports.profileSchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Enter valid email'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Phone must be 10 digits'
    }),

  dob: Joi.date()
    .less('now')
    .allow('', null)
    .messages({
      'date.less': 'DOB must be in the past'
    }),

  removeImage: Joi.string()
    .valid('true', 'false')
    .optional()
});


exports.changePasswordSchema = Joi.object({

  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters'
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match'
    })
});

exports.addressSchema = Joi.object({

  first_name: Joi.string()
    .trim()
    .min(2)
    .optional(),

  last_name: Joi.string()
    .trim()
    .optional(),

  full_name: Joi.string()
    .trim()
    .min(3)
    .optional(),

 email: Joi.string()
  .email({ tlds:{ allow:false }})
  .allow('')
  .optional(),
  address: Joi.string()
    .trim()
    .min(5)
    .required(),

  city: Joi.string()
    .trim()
    .required(),

  state: Joi.string()
    .trim()
    .required(),

  pincode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required(),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  type: Joi.string()
    .valid('Home','home','work','other')
    .optional(),

  is_default: Joi.boolean()
    .optional(),

    addressId: Joi.string()
    .allow('')
    .optional()
});