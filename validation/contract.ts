import Joi from "joi";

const milestone = Joi.object().keys({
  amount: Joi.number(),
  description: Joi.string(),
  step_number: Joi.number(),
  due_time: Joi.object({
    start_time: Joi.date(),
    end_time: Joi.date(),
  }),
  completeness: Joi.string().valid("upcoming", "ongoing", "success", "failed"),
});

export const makeContractSchema = Joi.object({
  job: Joi.string().required().messages({
    "any.required": "Please provide job id",
  }),
  expert_id: Joi.string().required().messages({
    "any.required": "Please provide expert id",
  }),
  additional_information: Joi.string().allow(""),
  milestones: Joi.array().optional().messages({
    "any.required": "Please provide milestones",
  }),
  total_budget: Joi.object({
    proposed_budget: Joi.number(),
  }),
  paymentTerms: Joi.optional().allow("").messages({
    "any.required": "Please provide paymentTerms.",
  }),
  proposal: Joi.string().required().messages({
    "any.required": "Please provide proposal id",
  }),
});

export const completeContractSchema = Joi.object({
  job: Joi.string().required().messages({
    "any.required": "Please provide job id",
  }),
  client_id: Joi.string().required().messages({
    "any.required": "Please provide client id",
  }),
  expert_id: Joi.string().required().messages({
    "any.required": "Please provide expert id",
  }),
  budget: Joi.number().required().messages({
    "any.required": "Please provide budget",
  }),
});

export const updateContractSchema = Joi.object({
  additional_information: Joi.string().allow(""),
  milestones: Joi.array().items(milestone).allow(""),
  total_budget: Joi.object({
    proposed_budget: Joi.number(),
  }),
  paymentTerms: Joi.optional().allow("").messages({
    "any.required": "Please provide paymentTerms.",
  }),
});
