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
// ======================================================
// ADD PRODUCT SCHEMA
// ======================================================

exports.addProductSchema = Joi.object({

    product_name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({

            'string.empty':
                'Product name is required',

            'string.min':
                'Product name must be at least 3 characters'

        }),

    description: Joi.string()
        .trim()
        .min(20)
        .max(2000)
        .required()
        .messages({

            'string.min':
                'Description must be at least 20 characters'

        }),

    brand: Joi.string()
        .trim()
        .required()
        .messages({

            'string.empty':
                'Brand is required'

        }),

    category: Joi.string()
    .required()
    .messages({

        'string.empty':
            'Category is required',

        'any.required':
            'Category is required'

    }),

    price: Joi.number()
        .min(1)
        .max(1000000)
        .required()
        .messages({

            'number.min':
                'Price must be greater than 0'

        }),

    sku: Joi.string()
        .trim()
        .allow(''),

    is_active: Joi.any(),

    sizes: Joi.alternatives().try(

        Joi.array().items(
            Joi.string().trim()
        ),

        Joi.string()

    ).required(),

    stocks: Joi.alternatives().try(

        Joi.array().items(
            Joi.number().min(0)
        ),

        Joi.number().min(0)

    ).required()

});
// ======================================================
// EDIT PRODUCT SCHEMA
// ======================================================

exports.editProductSchema = Joi.object({

    product_name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required(),

    description: Joi.string()
        .trim()
        .min(20)
        .max(2000)
        .required(),

    brand: Joi.string()
        .trim()
        .required(),

    category: Joi.string()
        .required(),

    price: Joi.number()
        .min(1)
        .max(1000000)
        .required(),

    sku: Joi.string()
        .trim()
        .allow(''),

    is_active: Joi.any(),

    existingImages: Joi.string()
        .optional(),

    replacedIndexes: Joi.string()
        .optional(),

    sizes: Joi.alternatives().try(

        Joi.array().items(
            Joi.string().trim()
        ),

        Joi.string()

    ).required(),

    stocks: Joi.alternatives().try(

        Joi.array().items(
            Joi.number().min(0)
        ),

        Joi.number().min(0)

    ).required()

});
    