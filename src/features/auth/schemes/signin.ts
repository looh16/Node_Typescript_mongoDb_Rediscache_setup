import Joi, { ObjectSchema } from 'joi';

const loginSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  }),
  password: Joi.string().required().min(8).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password must have minimal 8 caracters',
    'string.empty': 'Password is a required field'
  })
});

export { loginSchema };
