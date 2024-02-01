import Joi from 'joi';

export const updateAccountStatusSchema = Joi.object({
  active: Joi.boolean().required().messages({
    "any.required": "Please provide active status"
  })
})


export const addSkillSchmea = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Please provide skill name",
  }),
});

export const udpateSkillSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Please provide skill name",
  }),
});

export const addMajorSchmea = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Please provide major name",
  }),
});

export const udpateMajorSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Please provide major name",
  }),
});

export const addCategorySchmea = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Please provide category name",
  }),
});

export const udpateCategorySchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Please provide category name",
  }),
});