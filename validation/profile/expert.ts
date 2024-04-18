import Joi from "joi";

export const ProfileSchema = Joi.object({
  address: Joi.string().required().messages({
    "any.required": "Please provide address.",
  }),

  country: Joi.string().required().messages({
    "any.required": "Please provide country",
  }),

  // state: Joi.string().required().messages({
  //   "any.required": "Please provide state",
  // }),

  // city: Joi.string().required().messages({
  //   "any.required": "Please provide city",
  // }),

  state: Joi.string().allow(null).allow("").optional(),
  city: Joi.string().allow(null).allow("").optional(),

  languages: Joi.array<String>().required().messages({
    "any.required": "Please provide languages",
  }),

  avatar: Joi.string().required().messages({
    "any.required": "Please provide avatar",
  }),

  hourly_rate: Joi.string().required().messages({
    "any.required": "Please provide hourly_rate.",
  }),

  summary: Joi.string().required().messages({
    "any.requird": "Please provide summary",
  }),
  titleName: Joi.string().required().messages({
    "any.requird": "Please provide tag line",
  }),

  verified_by: Joi.array<object>(),

  portfolios: Joi.array<object>(),

  skills: Joi.array<String>().required().messages({
    "any.requird": "Please provide skills",
  }),

  majors: Joi.array<String>().required().messages({
    "any.requird": "Please provide majors",
  }),

  notification_preferences: Joi.array<String>(),

  resume: Joi.string(),

  profile_links: Joi.array<String>(),

  linkedin: Joi.string(),

  education: Joi.array().optional().messages({
    "any.required": "Please provide education",
  }),
  certification: Joi.array().optional().messages({
    "any.required": "Please provide education",
  }),
});

export const updateBaseInfoSchema = Joi.object({
  avatar: Joi.string().required().messages({
    "any.required": "Please provie avatar",
  }),

  titleName: Joi.string().required().messages({
    "any.required": "Please provie title",
  }),
  hourly_rate: Joi.string().required().messages({
    "any.required": "Please provide hourly_rate.",
  }),
});

export const updateSummarySchema = Joi.object({
  summary: Joi.string().required().messages({
    "any.requird": "Please provide summary",
  }),
});

export const updatePortfolioSchema = Joi.object({
  portfolios: Joi.array<Object>().required().messages({
    "any.requird": "Please provide portfolio",
  }),
});

export const updatePortfolioItemSchema = Joi.object({
  content: Joi.string().required().messages({
    "any.required": "Please provide content",
  }),
  text: Joi.string().required().messages({
    "any.required": "Please provide text",
  }),
  link: Joi.string().required().messages({
    "any.required": "Please provide link",
  }),
});

export const addPortfolioItemSchema = Joi.object({
  content: Joi.string().required().messages({
    "any.required": "Please provide content",
  }),
  text: Joi.string().required().messages({
    "any.required": "Please provide text",
  }),
  link: Joi.string().required().messages({
    "any.required": "Please provide link",
  }),
});

export const updateVerifierSchema = Joi.object({
  verified_by: Joi.array<Object>().required().messages({
    "any.requird": "Please provide verifier",
  }),
});

export const updateResumeSchema = Joi.object({
  resume: Joi.string().required().messages({
    "any.requird": "Please provide resume",
  }),
});
export const updatePersonDetailSchema = Joi.object({
  address: Joi.string().required().messages({
    "any.required": "Please provide address",
  }),
  country: Joi.string().required().messages({
    "any.required": "Please provide country",
  }),
  state: Joi.string().allow(null).allow("").optional(),
  city: Joi.string().allow(null).allow("").optional(),
  languages: Joi.array<Object>().required().messages({
    "any.required": "Please provide languages",
  }),
  skills: Joi.array<String>().required().messages({
    "any.required": "Please provide skills",
  }),
  majors: Joi.array<String>().required().messages({
    "any.required": "Please provide majors",
  }),
  // notification_preferences: Joi.array<String>(),
  // reviews: Joi.array<Object>(),
  active_status: Joi.boolean().required().messages({
    "any.required": "Please provide active_status",
  }),
  // account_status: Joi.number().required().messages({
  // "any.required": "Please provide account_status"
  // }),
  // profile_links: Joi.array<String>().required().messages({
  //   "any.required": "Please provide profile_links"
  // }),
  // linkedin: Joi.string().required().messages({
  //   "any.required": "Please provide linkedin"
  // }),
});
export const updateEducationSchema = Joi.object({
  education: Joi.array().required().messages({
    "any.required": "Please provide education",
  }),
});
export const updateCertificationSchema = Joi.object({
  certification: Joi.array().required().messages({
    "any.required": "Please provide education",
  }),
});

export const findExpertSchema = Joi.object({
  email: Joi.string().allow("").allow(null),
  skills: Joi.array<String>().allow("").allow(null),
  majors: Joi.array<String>().allow("").allow(null),
});
