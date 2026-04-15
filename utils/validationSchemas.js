import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),

  email: Joi.string()
    .email()
    .min(6)
    .max(50)
    .required(),

  password: Joi.string()
    .min(6)
    .max(20)
    .required()
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .min(6)
    .max(50)
    .required(),

  password: Joi.string()
    .min(6)
    .max(20)
    .required()
});