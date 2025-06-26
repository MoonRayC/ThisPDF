const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  password_confirmation: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Password confirmation must match password' })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  user_agent: Joi.string().max(255).optional(),
  ip_address: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).optional()
});

const emailVerificationSchema = Joi.object({
  user_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'any.required': 'User ID is required',
      'string.guid': 'User ID must be a valid UUID v4'
    }),
  verification_token: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'any.required': 'Verification token is required',
      'string.length': 'Verification token must be 6 digits',
      'string.pattern.base': 'Verification token must contain only digits'
    })
});

const resendCodeSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) 
    .max(255)
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required'
    })
});

const passwordResetSchema = Joi.object({
  reset_token: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Reset token must be a 6-digit number',
      'any.required': 'Reset token is required'
    }),
  new_password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  new_password_confirmation: Joi.string()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({ 'any.only': 'Password confirmation must match new password' })
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(422).json({
        error: 'Validation failed',
        details: errors
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateEmailVerification: validate(emailVerificationSchema),
  validatePasswordReset: validate(passwordResetSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateResendCode: validate(resendCodeSchema)
};
