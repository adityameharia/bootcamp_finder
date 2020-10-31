const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

//des-GET ALL reviews
//route- GET to /api/v1/courses
//route- GET to /api/v1/bootcamps/:bootcampId/reviews
//acess- Public

exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

//des-GET single reviews
//route- GET to /api/v1/reviews/:id
//acess- Public

exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!review) {
		return next(
			new ErrorResponse(
				`no review found with the id of ${req.params.id}`,
				404
			)
		);
	}

	res.status(200).json({
		success: true,
		data: review,
	});
});

//des-add review
//route- POST to /api/v1/bootcamps/:bootcampId/reviews
//acess- Private

exports.addReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user._id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`no bootcamp found with the id of ${req.params.bootcampId}`,
				404
			)
		);
	}

	const review = await Review.create(req.body);

	res.status(201).json({
		success: true,
		data: review,
	});
});

//des-aupdate review
//route- PUT to /api/v1/reviews/:id
//acess- Private

exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(
				`no review found with the id of ${req.params.id}`,
				404
			)
		);
	}

	//make sure review belongs to user or user is admin
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(`not authorized to update the review`, 401)
		);
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(201).json({
		success: true,
		data: review,
	});
});

//des-delete review
//route- DELETE to /api/v1/reviews/:id
//acess- Private

exports.deleteReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(
				`no review found with the id of ${req.params.id}`,
				404
			)
		);
	}

	//make sure review belongs to user or user is admin
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(`not authorized to update the review`, 401)
		);
	}

	await review.remove();

	res.status(201).json({
		success: true,
		data: {},
	});
});
