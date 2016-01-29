const express = require('express');
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');
const authRequired = require(__dirname + '/../lib/check-token');
const basicHTTP = require(__dirname + '/../lib/basic-http');

const User = require(__dirname + '/../models/blog').User;
const Post = require(__dirname + '/../models/blog').Post;
const Comment = require(__dirname + '/../models/blog').Comment;

const userRouter = module.exports = exports = express.Router();


userRouter.post('/register', jsonParser, (req, res) => {
  if ((req.body.name.first || "").length > 2 && (req.body.name.last).length >
    2) {
    var newUser = new User(req.body);
    newUser.name.first = req.body.name.first;
    newUser.name.last = req.body.name.last;
    newUser.authentication.email = req.body.authentication.email;
    newUser.hashPassword(req.body.authentication.password);

    newUser.save((err, data) => {
      if (err) return console.log(err);

      res.status(200).json({
        msg: 'User Created',
        token: newUser.generateToken()
      });
    });
  }
});

userRouter.get('/login', basicHTTP, (req, res) => {
  User.findOne({
    "authentication.email": req.basicHTTP.email
  }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        msg: 'Invalid username or password1'
      });
    }
    if (!user.comparePassword(req.basicHTTP.password)) {
      return res.status(401).json({
        msg: 'Invalid username or password'
      });
    }
    res.json({
      token: user.generateToken()
    });
  });
});

userRouter.post('/:id/post', authRequired, jsonParser, (req, res) => {
  if (req.body.content && req.body.title && req.body.tags) {

    var newPost = new Post();
    newPost.title = req.body.title;
    newPost.date = new Date();
    newPost.content = req.body.content;
    newPost.tags = req.body.tags;
    newPost.author_id = req.params.id;

    newPost.save((err, data) => {
      if (err) return console.log('Error adding post');

      res.status(200).json({
        msg: 'Post Created',
        data: data
      });
    })
  }
});


userRouter.get('/users/post/:id', authRequired, (req, res) => {
  Post.find({
    author_id: req.params.id
  }, (err, data) => {
    if (err) {
      return res.status(500).json({
        msg: 'Error loading profile'
      });
    }

    res.status(200).json({
      msg: 'Profile retreived',
      data: data
    });

  })
});

userRouter.get('/post/:id', authRequired, (req, res) => {
  Post.findOne({
    _id: req.params.id
  }, (err, data) => {
    if (err) {
      return res.status(500).json({
        msg: 'Error retreiving post'
      });
    }

    res.status(200).json({
      msg: 'Post retreived',
      data: data
    });
  })
});

userRouter.post('/post/:id', authRequired, jsonParser, (req, res) => {
  if (req.body.content && req.body.author_id) {
    var newComment = new Comment();

    newComment.date = new Date();
    newComment.vote = req.body.vote;
    newComment.author_id = req.body.author_id;
    newComment.post_id = req.params.id;

    newComment.save((err, data) => {
      if (err) {
        return res.status(500).json({
          msg: 'Error creating comment'
        })
      }

      res.status(200).json({
        msg: 'Comment Created',
        data: data
      });
    });
  }
});
