const express = require('express');
const {
	getBootcamp,
	getBootcamps,
	createBootcamps,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
	bootcampPhotoUpload,
	bootcampVideoUpload,
} = require('../controllers/bootcamps');

const { protect, authorize } = require('../middleware/auth');

const bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advancedResults');

//include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const Bootcamp = require('../models/Bootcamp');

const router = express.Router();

//Reroute into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
	.route('/:id/photo')
	.put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
	.route('/:id/video')
	.put(protect, authorize('publisher', 'admin'), bootcampVideoUpload);

router
	.route('/')
	.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
	.post(protect, authorize('publisher', 'admin'), createBootcamps);
router
	.route('/:id')
	.get(getBootcamp)
	.put(protect, authorize('publisher', 'admin'), updateBootcamp)
	.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
