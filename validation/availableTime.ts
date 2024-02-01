import Joi from "joi";

const schedule = Joi.object({
  start: Joi.date(),
  end: Joi.date(),
  valid: Joi.boolean(),
});
const day = Joi.object().keys({
  available: Joi.boolean(),
  schedules: Joi.array().items(schedule),
});

const irregularschedule = Joi.object({
  date: Joi.date(),
  time: Joi.array().items(schedule),
});

export const createAvailableTimeSchema = Joi.object({
  regular: Joi.object({
    days: Joi.array().items(day),
  }),
  irregular: Joi.array().items(irregularschedule),
});

export const updateAvailableTimeSchema = Joi.object({
  regular: Joi.object({
    days: Joi.array().items(day),
  }),
  irregular: Joi.array().items(irregularschedule),
});
