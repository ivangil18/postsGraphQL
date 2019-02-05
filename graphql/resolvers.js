const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');

module.exports = {
  createUser: async function({ userInput }, req) {
    const errors = [];

    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'Email not valid!' });
    }

    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: 'Password not valid or Empty field' });
    }
    if (
      validator.isEmpty(userInput.name) ||
      !validator.isLength(userInput.name, { min: 3 })
    ) {
      errors.push({ message: 'Name not valid or Empty field' });
    }

    if (errors.length > 0) {
      const error = new Error('Input not Valid!');
      error.code = 422;
      error.data = errors;
      throw error;
    }

    const userExists = await User.findOne({ email: userInput.email });

    if (userExists) {
      throw new Error('User already exists');
    }

    const hashPw = await bcrypt.hash(userInput.password, 12);

    const user = new User({
      email: validator.normalizeEmail(userInput.email),
      name: userInput.name,
      password: hashPw
    });

    const userCreated = await user.save();

    return { ...userCreated._doc, _id: userCreated._id.toString() };
  }
};
