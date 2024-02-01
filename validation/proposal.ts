import Joi from "joi";
import Account from "../models/account";

const milestone = Joi.object().keys({
  step_number: Joi.number().required().messages({
    "any.required": "Please provide step_number",
  }),
  from: Joi.date(),
  to: Joi.date(),
  // title: Joi.string().required().messages({
  //   "any.required": "Pleas provide title",
  // }),
  description: Joi.string().required().messages({
    "any.required": "Please provide description",
  }),
  amount: Joi.number().required().messages({
    "any.required": "Please provide amount",
  }),
});

const custom = Joi.extend({
  type: "object",
  base: Joi.object(),
  coerce: {
    from: "string",
    method(value, helpers) {
      if (
        typeof value !== "string" ||
        (value[0] !== "{" && !/^\s*\[/.test(value))
      ) {
        return;
      }

      try {
        return { value: JSON.parse(value) };
      } catch (ignoreErr) {}
    },
  },
});

export const ProposalSchema = Joi.object({
  proposalData: custom.object({
    cover_letter: Joi.string().required().messages({
      "any.required": "Please provide cover_letter.",
    }),
    total_amount: Joi.number().required().messages({
      "any.required": "Please provide total_amount.",
    }),
    mentors: Joi.array().allow(""),
    milestones: Joi.array().items(milestone).required().messages({
      "any.required": "Please provide milestones",
    }),
    proposal_status: Joi.number().allow(null),
  }),
  attached_files: Joi.array()
    .allow(null)
    .allow("")
    .meta({ swaggerType: "file" }),
});
export const updateProposalSchema = Joi.object({
  proposalData: custom.object({
    cover_letter: Joi.string().required().messages({
      "any.required": "Please provide cover_letter.",
    }),
    total_amount: Joi.number().required().messages({
      "any.required": "Please provide total_amount.",
    }),
    mentors: Joi.array().allow(""),
    milestones: Joi.array().items(milestone).required().messages({
      "any.required": "Please provide milestones",
    }),
    proposal_status: Joi.number().allow(null),
  }),
  attached_files: Joi.array()
    .allow(null)
    .allow("")
    .meta({ swaggerType: "file" }),
});
