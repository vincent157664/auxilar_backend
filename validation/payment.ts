import Joi from "joi";

export const performPaymentSchema = Joi.object({
  amount: Joi.number().allow(0).allow(null),
});
