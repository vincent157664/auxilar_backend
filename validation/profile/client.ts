import Joi from "joi";

export const ProfileSchema = Joi.object({
  avatar: Joi.string(),

  country: Joi.string().optional().messages({
    "any.required": "Please provide country",
  }),

  state: Joi.string().allow(""),

  city: Joi.string().allow(""),

  address: Joi.string().optional().messages({
    "any.required": "Please provide address.",
  }),

  languages: Joi.array<Object>().optional().messages({
    "any.required": "Please provide languages",
  }),

  summary: Joi.string().optional().messages({
    "any.required": "Please provide summary",
  }),

  social_media: Joi.object(),

  payment_verify: Joi.boolean(),
});

export const updateSummarySchema = Joi.object({
  summary: Joi.string().optional().messages({
    "any.required": "Please provide summary",
  }),
});

export const updateAvatarSchema = Joi.object({
  avatar: Joi.string().optional().messages({
    "any.required": "Please provide avatar",
  }),
});
export const updatePersonalInfoSchema = Joi.object({
  country: Joi.string().optional().messages({
    "any.required": "Please provide country",
  }),
  state: Joi.string().allow(""),
  city: Joi.string().allow(""),
  address: Joi.string().optional().messages({
    "any.required": "Please provide address",
  }),
  languages: Joi.array<Object>().optional().messages({
    "any.required": "Please provide languages",
  }),
});

export const updateSocialMediaSchema = Joi.object({
  social_media: Joi.object().optional().messages({
    "any.required": "Please provide social media",
  }),
});

export const updatePaymentInfoSchema = Joi.object({
  payment_info: Joi.object().optional().messages({
    "any.required": "Please provide payment information",
  }),
});
