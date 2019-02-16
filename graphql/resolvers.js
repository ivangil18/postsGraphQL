const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

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
  },

  login: async function({ email, password }) {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error('User not found!');
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('Password Incorrect!');
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      'supersupersecretsecret',
      { expiresIn: '1h' }
    );

    console.log({ token: token, userId: user._id.toString() });

    return { token: token, userId: user._id.toString() };
  },

  createPost: async function({ postInput }, req) {
    console.log('Entra aqui a create post');

    if (!req.isAuth) {
      const error = new Error('User not authenticated!');
      error.code = 401;
      throw error;
    }

    const errors = [];

    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Title not valid!' });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Content not valid!' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid Inputs');
      error.code = 422;
      error.data = errors;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User not found');
      error.code = 401;
      error.data = errors;
      throw error;
    }

    console.log(postInput.imageUrl);

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user
    });

    user.posts.push(post);
    const result = user.save();
    const postCreated = await post.save();

    return {
      ...postCreated._doc,
      _id: postCreated._id.toString(),
      createdAt: postCreated.createdAt.toISOString(),
      updatedAt: postCreated.updatedAt.toISOString()
    };
  },

  getPost: async function({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error('User not authenticated!');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Post not found!');
      error.code = 404;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  },

  getPosts: async function({ page }, req) {
    if (!req.isAuth) {
      const error = new Error('User not authenticated!');
      error.code = 401;
      throw error;
    }

    if (!page) {
      page = 1;
    }
    const perPage = 2;

    const posts = await Post.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .populate('creator');

    const totalPosts = await Post.find().countDocuments();

    return {
      posts: posts.map(p => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        };
      }),
      totalPosts: totalPosts
    };
  },

  updatePost: async function({ postInput, postId }, req) {

    console.log('entra aqui');
    
    if (!req.isAuth) {
      const error = new Error('User not authenticated!');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Post not found!');
      error.code = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('User not Authorized to edit post!');
      error.code = 403;
      throw error;
    }

    const errors = [];

    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Title not valid!' });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Content not valid!' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid Inputs');
      error.code = 422;
      error.data = errors;
      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;

    if (postInput.imageUrl !== 'undefined') {
      post.imageUrl = postInput.imageUrl;
    }

    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString()
    };
  }
};
