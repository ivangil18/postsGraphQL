const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports = {
  createUser: async function({ userInput }, req) {
  
    const userExists = await User.findOne({ email: userInput.email });

    if (userExists) {
      throw new Error('User already exists');
    }

    const hashPw = await bcrypt.hash(userInput.password, 12);

    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashPw
    });

    const userCreated = await user.save();

    return { ...userCreated._doc, _id: userCreated._id.toString() };
  }
};
