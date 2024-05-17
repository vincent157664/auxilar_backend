import Joi from "joi";

export const performPaymentSchema = Joi.object({
  order: Joi.object().optional().messages({
    "any.required": "Please provide order data",
  }),
});
