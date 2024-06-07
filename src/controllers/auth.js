const Joi = require('joi');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
require('dotenv').config();

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirm_password: Joi.any().valid(Joi.ref('password')).required(),
});

async function signupUser(request, h) {
  const { error, value } = userSchema.validate(request.payload);
  if (error) {
    return h.response({ error: error.details[0].message }).code(400);
  }
  const { email, password } = value;

  try {
    await userModel.createUser(email, password);
    return h
      .response({
        status: 'success',
        message: 'User created successfully',
        data: {
          email,
        },
      })
      .code(201);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return h.response({ message: 'User already exists' }).code(400);
    }
    return h
      .response({ error: 'Failed to create user', details: e.message })
      .code(500);
  }
}

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

async function signinUser(request, h) {
  const { error, value } = signinSchema.validate(request.payload);
  if (error) {
    return h
      .response({ error: 'Invalid payload', details: error.details })
      .code(400);
  }

  const { email, password } = value;

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return h
        .response({ status: 'fail', message: 'Invalid credentials' })
        .code(401);
    }

    const isValidPassword = await userModel.verifyPassword(
      password,
      user.password,
    );
    if (!isValidPassword) {
      return h
        .response({ status: 'fail', message: 'Invalid credentials' })
        .code(401);
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
      // expiresIn: '15s', // for testing valid token
    });

    return h
      .response({
        status: 'success',
        message: 'User signed in successfully',
        token,
        data: {
          id: user.id,
          email: user.email,
        },
      })
      .code(200);
  } catch (e) {
    console.error('Error signing in user:', e.message); // eslint-disable-line no-console
    return h
      .response({ error: 'Failed to sign in user', details: e.message })
      .code(500);
  }
}

module.exports = {
  signupUser,
  signinUser,
};
