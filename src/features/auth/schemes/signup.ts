import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  fullName: Joi.string().required().messages({
    'string.base': 'Username must be of type string',
    'string.empty': 'Username is a required field'
  }),
  password: Joi.string().required().min(8).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password must have minimal 8 caracters',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  }),
  role: Joi.string().required().messages({
    'string.base': 'Role must be of type string',
    'string.empty': 'Role is a required field'
  })
});

export { signupSchema };
