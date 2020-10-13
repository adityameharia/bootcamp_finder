const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//des-GET ALL courses
//route- GET to /api/v1/courses
//route- GET to /api/v1/bootcamps/:bootcampId/courses
//acess- Public

exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;
	if (req.params.bootcampId) {
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		query = Course.find().populate({
			path: 'bootcamp',
			select: 'name description',
		});
	}
	const courses = await query;
	res.status(200).json({
		success: true,
		count: courses.length,
		data: courses,
	});
});

//des-GET a single course
//route- GET to /api/v1/courses/:id
//acess- Public

exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: 'Bootcamp',
		select: 'name description',
	});

	if (!course) {
		return next(
			new ErrorResponse(`no course found with id of ${req.params.id}`),
			404
		);
	}

	res.status(200).json({
		success: true,
		data: course,
	});
});

//desc-add a course
//route-post /api/v1/bootcamps/:bootcampId/courses
//access-private
exports.addCourse = asyncHandler(async (req, res, next) => {
	//need to send the bootcamp id while creating a course
	req.body.bootcamp = req.params.bootcampId;

	//need to bring in bootcamp model to check and see of the given id exists or not
	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`no bootcampfound with the given id->${req.params.bootcampId}`
			),
			404
		);
	}

	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course,
	});
});

//desc-update a course
//route-put /api/v1/courses/:id
//access-private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(
				`no course found with the given id->${req.params.id}`
			),
			404
		);
	}

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: course,
	});
});

//desc-delete a course
//route-delete /api/v1/courses/:id
//access-private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(
				`no course found with the given id->${req.params.id}`
			),
			404
		);
	}

	await course.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
