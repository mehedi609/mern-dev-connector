const express = require('express');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('./../../middleware/auth');
// eslint-disable-next-line no-unused-vars
const User = require('./../../models/User');
const Profile = require('./../../models/Profile');

const router = express.Router();

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.status(200).json(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/profile
// @desc    Get current users profile
// @access  private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // Update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json(profileFields);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      res.status(200).json(profile);
    } catch (e) {
      console.log(e.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   GET api/profile
// @desc    get all profiles
// @access  PUBLIC
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    get a profile by user_id
// @access  PUBLIC
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.status(200).json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Profile not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/profile
// @desc    delete user, profile & posts
// @access  PRIVATE
router.delete('/', auth, async (req, res) => {
  try {
    // remove posts

    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).json({ msg: 'User Removed' });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/profile/experience
// @desc    add experience in profile
// @access  PRIVATE
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    delete experience from profile
// @access  PRIVATE
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.status(200).json(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/profile/education
// @desc    add education in profile
// @access  PRIVATE
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of Study is required')
        .not()
        .isEmpty(),
      check('from', 'From is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);

      await profile.save();
      res.status(200).json(profile);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    delete education from profile
// @access  PRIVATE
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Find remove Index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.status(200).json(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/profile/github/:username
// @desc    get user's repo form github
// @access  PUBLIC
router.get('/github/:username', async (req, res) => {
  const clientId = config.get('githubClientId');
  const gitgubSecret = config.get('gitgubSecret');
  const query = `per_page=5&sort=created:asc&client_id=${clientId}&client_secret=${gitgubSecret}`;
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?${query}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200)
        return res.status(404).json({ msg: 'No Github profile found' });

      res.status(200).json(JSON.parse(body));
    });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;