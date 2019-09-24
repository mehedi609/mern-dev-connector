const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('./../../middleware/auth');
const Profile = require('./../../models/Profile');
const User = require('./../../models/User');
const Post = require('./../../models/Post');

const router = express.Router();

// @route   POST api/posts
// @desc    create a post
// @access  PRIVATE
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.status(200).json(post);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   GET api/posts
// @desc    get all posts
// @access  PRIVATE
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/posts/:id
// @desc    get posts by ID
// @access  PRIVATE
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).sort({ date: -1 });
    res.status(200).json(post);
  } catch (e) {
    console.error(e.message);
    if (e.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post not found!' });
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/posts/:id
// @desc    delete posts by ID
// @access  PRIVATE
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User not Authorized' });

    await post.remove();
    res.status(200).json({ msg: 'Post removed' });
  } catch (e) {
    console.error(e.message);
    if (e.kind === 'ObjectId')
      return res.status(401).json({ msg: 'Post not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/posts/like/:id
// @desc    like a post
// @access  PRIVATE
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'Post not found' });

    // Check if post is already liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    )
      return res.status(400).json({ msg: 'Post already been liked' });

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.status(200).json(post.likes);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    like a post
// @access  PRIVATE
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ msg: 'Post not found' });

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    )
      return res.status(400).json({ msg: 'Post has not been liked' });

    // find remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.status(200).json(post.likes);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/posts/comment/:id
// @desc    comment on a post
// @access  PRIVATE
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required')]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();
      res.status(200).json(post.comments);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   delete api/posts/comment/:id
// @desc    comment on a post
// @access  PRIVATE

module.exports = router;
