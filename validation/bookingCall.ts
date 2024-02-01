import Joi from "joi";

const participant = Joi.object().keys({
  participant: Joi.object({
    id: Joi.string().required().messages({
      "any.required": "Please provide participant id",
    }),
    first_name: Joi.string().required().messages({
      "any.required": "Please provide participant first_name",
    }),
    last_name: Joi.string().required().messages({
      "any.required": "Please provide participant last_name",
    }),
  })
    .required()
    .messages({
      "any.required": "Please provide participant info",
    }),
});

export const createBookingSchema = Joi.object({
  participants: Joi.array().items(participant).required().messages({
    "any.required": "Plase provide participants infos",
  }),

  call_link: Joi.string().required().messages({
    "any.required": "Please provide call link",
  }),

  title: Joi.string().required().messages({
    "any.required": "Please provie meeting title",
  }),

  description: Joi.string().allow(null).allow(""),

  meeting_date: Joi.date().required().messages({
    "any.required": "Please provide meeting date",
  }),
  meeting_time: Joi.object({
    start: Joi.date().required().messages({
      "any.required": "please provid meeting start time",
    }),
    end: Joi.date().required().messages({
      "any.required": "please provid meeting end time",
    }),
  }),

  status: Joi.string()
    .required()
    .valid("upcoming", "successed", "failed")
    .messages({
      "any.required": "Please provide meeting status",
    }),
});

export const updateBookedCallSchema = Joi.object({
  participants: Joi.array().items(participant).required().messages({
    "any.required": "Plase provide participants infos",
  }),

  call_link: Joi.string().required().messages({
    "any.required": "Please provide call link",
  }),

  title: Joi.string().required().messages({
    "any.required": "Please provie meeting title",
  }),

  description: Joi.string().allow(null).allow(""),

  meeting_date: Joi.date().required().messages({
    "any.required": "Please provide meeting date",
  }),
  meeting_time: Joi.object({
    start: Joi.date().required().messages({
      "any.required": "please provid meeting start time",
    }),
    end: Joi.date().required().messages({
      "any.required": "please provid meeting end time",
    }),
  }),

  status: Joi.string()
    .required()
    .valid("upcoming", "successed", "failed")
    .messages({
      "any.required": "Please provide meeting status",
    }),
});
