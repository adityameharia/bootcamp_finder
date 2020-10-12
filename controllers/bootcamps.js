const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

//des-GET ALL BOOTCAMPS
//route- GET to /api/v1/bootcamps
//acess- Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;

	//copy req.query
	const reqQuery = { ...req.query };

	//fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

	//loop over fileds to exclude and delete them from query
	removeFields.forEach((param) => delete reqQuery[param]);

	//create query string
	let queryStr = JSON.stringify(reqQuery);

	//create operator($gt etc)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	//finding resource
	query = Bootcamp.find(JSON.parse(queryStr));

	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
		console.log('hello');
	}

	console.log('h');

	//sort
	if (req.query.sort) {
		console.log('hi');
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		console.log('bye');
		query.sort('-createdAt');
	}

	//pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const tot = await Bootcamp.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//executing query
	const bootcamps = await query;

	//pagination result
	const pagination = {};

	if (endIndex < tot) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps,
	});
});

//des-GET ONE BOOTCAMP
//route- GET to /api/v1/bootcamps/:id
//acess- Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found found with id of ${req.params.id}`,
				404
			)
		);
	}
	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

//des-create new BOOTCAMPS
//route- POST to /api/v1/bootcamps
//acess- Private
exports.createBootcamps = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		data: bootcamp,
	});
	next();
});

//des-UPDATE ONE BOOTCAMPS
//route- PUT to /api/v1/bootcamps/:id
//acess- PRIVATE
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found found with id of ${req.params.id}`,
				404
			)
		);
	}
	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

//des-DELETE ONE BOOTCAMPS
//route- DELETE to /api/v1/bootcamps/:id
//acess- Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found found with id of ${req.params.id}`,
				404
			)
		);
	}
	res.status(200).json({
		success: true,
		data: {},
	});
});

//des-GET bootcamps within a radius
//route- GET to /api/v1/bootcamps/radius/:zipcode/:distance
//acess- Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;
	//get lat/long from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	//calc radius using radians
	//divide dist by radius of the earth
	//earth radius=3963 mi or 6378 km
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: { $centerSphere: [[lng, lat], radius] },
		},
	});

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});
