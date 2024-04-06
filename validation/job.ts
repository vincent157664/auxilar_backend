import Joi, { array, number, object } from "joi";
import Account from "../models/account";

export const JobSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Please provide title.",
  }),

  description: Joi.string().required().messages({
    "any.required": "Please provide description.",
  }),
  budget_type: Joi.number().required().messages({
    "any.required": "Please provide budget_type",
  }),
  budget_amount: Joi.number().required().messages({
    "any.required": "Please provide budget_amount",
  }),
  end_date: Joi.date().required().messages({
    "any.required": "Please provide end_date of proposal",
  }),
  // expire_date: Joi.date().required().messages({
  //   "any.required": "Please provide expire_date of proposal",
  // }),

  category: Joi.array<string>().required().messages({
    "any.required": "Please provide category",
  }),

  skill_set: Joi.array<string>().required().messages({
    "any.required": "Please provide skill_set",
  }),

  job_type: Joi.string().required().valid("public", "private").messages({
    "any.required": "Please provdie job_type",
  }),
  project_duration: Joi.string()
    .required()
    .valid(
      "lessthan1month",
      "between1and3months",
      "between3and6months",
      "morethan6months"
    )
    .messages({
      "any.required": "Please provdie project duration",
    }),
  hours_per_week: Joi.string()
    .required()
    .valid("lessthan10", "between10and20", "between20and30", "morethan30")
    .messages({
      "any.required": "Please provide hours per week",
    }),
  // invited_expert: Joi.array<Object>(),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Please provide title.",
  }),
  description: Joi.string().required().messages({
    "any.required": "Please provide description.",
  }),
  budget_type: Joi.number().required().messages({
    "any.required": "Please provide budget_type",
  }),
  budget_amount: Joi.number().required().messages({
    "any.required": "Please provide budget_amount",
  }),
  end_date: Joi.date().required().messages({
    "any.required": "Please provide end_date of proposal",
  }),
  // expire_date: Joi.date().required().messages({
  //   "any.required": "Please provide expire_date of proposal",
  // }),
  state: Joi.number().required().messages({
    "any.required": "Please provide state",
  }),
  category: Joi.array<string>().required().messages({
    "any.required": "Please provide category",
  }),

  skill_set: Joi.array<string>().required().messages({
    "any.required": "Please provide skill_set",
  }),

  job_type: Joi.string().required().valid("public", "private").messages({
    "any.required": "Please provdie job_type",
  }),
  project_duration: Joi.string()
    .required()
    .valid(
      "lessthan1month",
      "between1and3months",
      "between3and6months",
      "morethan6months"
    )
    .messages({
      "any.required": "Please provdie project duration",
    }),
  hours_per_week: Joi.string()
    .required()
    .valid("lessthan10", "between10and20", "between20and30", "morethan30")
    .messages({
      "any.required": "Please provide hours per week",
    }),
  // invited_expert: Joi.array<Object>(),
});

interface min_max_object {
  min_value: number;
  max_value: number;
}

export const findPostedJobSchema = Joi.object({
  // and
  skill_set: Joi.array<String>().required().messages({
    "any.required": "Please provide skill set",
  }),
  category: Joi.array<String>().required().messages({
    "any.required": "Please provide category",
  }),
  title: Joi.string().required().messages({
    "any.required": "Please provide title",
  }),

  // or
  budget_type: Joi.object({
    hourly: Joi.object({
      ishourly: Joi.boolean().required().messages({
        "any.required": "Please provide ishourly",
      }),
      hourly_range: Joi.array<min_max_object>().required().messages({
        "any.required": "Please provide hourly range",
      }),
    }),
    fixed: Joi.object({
      isfixed: Joi.boolean().required().messages({
        "any.required": "Please provide isfixed",
      }),
      fixed_range: Joi.array<min_max_object>().required().messages({
        "any.required": "Please provide fixed range",
      }),
    }),
  })
    .required()
    .messages({
      "any.required": "Please provide budget_type",
    }),

  client_info: Joi.object({
    payment_verified: Joi.boolean(),
    payment_unverified: Joi.boolean(),
  }),

  hours_per_week: Joi.array<string>().required().messages({
    "any.required": "Please provide range hours per week",
  }),

  project_duration: Joi.array<string>().required().messages({
    "any.required": "Please provide range of project_duration",
  }),

  jobs_per_page: Joi.number().required().messages({
    "any.required": "Please provide number of jobs per page",
  }),
  page_index: Joi.number().required().messages({
    "any.required": "Please provide page index",
  }),
});

export const inviteExpertSchema = Joi.object({
  jobId: Joi.string().required().messages({
    "any.required": "Please provide job id",
  }),
  expertId: Joi.string().required().messages({
    "any.required": "Please provide expert id",
  }),
});
