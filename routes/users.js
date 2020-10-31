const express = require('express');
const {
	getUser,
	getUsers,
	createUser,
	updateUser,
	deleteUser,
} = require('../controllers/users');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const { model } = require('../models/User');

const User = require('../models/User');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:id').put(updateUser).get(getUser).delete(deleteUser);

module.exports = router;