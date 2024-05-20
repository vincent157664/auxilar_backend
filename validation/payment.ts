import Joi from "joi";

export const performPaymentSchema = Joi.object({
  order: Joi.object().optional().messages({
    "any.required": "Please provide order data",
  }),
});
export const withdrawSchema = Joi.object({
  receiver: Joi.string().required().messages({
    "any.required": "Please provide receiver",
  }),
  balance: Joi.string().required().messages({
    "any.required": "Please provide withdraw balance",
  }),
});
