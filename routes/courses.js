const express = require('express');
const {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse,
} = require('../controllers/courses');

const { protect, authorize } = require('../middleware/auth');

const Course = require('../models/Course');

const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');

//mergeParams:makes parent params available to the child router,it is disabled by default and made true only for nested routing
const router = express.Router({ mergeParams: true });
router
	.route('/')
	.get(
		advancedResults(Course, {
			path: 'bootcamp',
			select: 'name description',
		}),
		getCourses
	)
	.post(protect, authorize('publisher', 'admin'), addCourse);
router
	.route('/:id')
	.get(getCourse)
	.put(protect, authorize('publisher', 'admin'), updateCourse)
	.delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
