import Joi from "joi";

export const createAccountSchema = Joi.object({
  first_name: Joi.string().required().messages({
    "any.required": "Please provide first name.",
  }),
  last_name: Joi.string().required().messages({
    "any.required": "Please provide first name.",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "Please provide email",
    "string.email": "Please provide a valid email.",
  }),
  password: Joi.string().required().min(6).messages({
    "any.required": "Please provide password.",
    "string.min": "Password must be at least 6 characters.",
  }),
  account_type: Joi.string().required().messages({
    "any.requird": "Please provide account_type",
  }),
});

export const signinAccountSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please provide email",
    "string.email": "Please provide a valid email.",
  }),
  password: Joi.string().required().min(6).messages({
    "any.required": "Please provide password.",
    "string.min": "Password must be at least 6 characters.",
  }),
});

export const changeAccountPasswordSchema = Joi.object({
  new_password: Joi.string().required().min(6).messages({
    "any.required": "Please provide new password.",
    "string.min": "New password must be at least 6 characters.",
  }),
});

export const forgotAccountPasswordSchemna = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please provide email",
    "string.email": "Please provide a valid email.",
  }),
});

export const resetAccountPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please provide email",
    "string.email": "Please provide a valid email.",
  }),
  passcode: Joi.number().required().messages({
    "any.required": "Please provide new password.",
  }),
});
export const updateAccountPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Please provide email",
    "string.email": "Please provide a valid email.",
  }),
  new_password: Joi.string().required().min(6).messages({
    "any.required": "Please provide new password.",
    "string.min": "New password must be at least 6 characters.",
  }),
});



