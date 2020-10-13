const express = require('express');
const {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse,
} = require('../controllers/courses');

//mergeParams:makes parent params available to the child router,it is disabled by default and made true only for nested routing
const router = express.Router({ mergeParams: true });
router.route('/').get(getCourses).post(addCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
