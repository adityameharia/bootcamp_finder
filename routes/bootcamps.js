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

//include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

//Reroute into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

router.route('/:id/video').put(bootcampVideoUpload);

router.route('/').get(getBootcamps).post(createBootcamps);
router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;
