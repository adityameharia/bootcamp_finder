const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const AWS = require('aws-sdk');
const Bootcamp = require('../models/Bootcamp');
const fs = require('fs');

//des-GET ALL BOOTCAMPS
//route- GET to /api/v1/bootcamps
//acess- Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
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
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found found with id of ${req.params.id}`,
				404
			)
		);
	}

	bootcamp.remove();

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

//des-upload photo
//route- put to /api/v1/bootcamps/:id/photo
//acess- Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	let bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found found with id of ${req.params.id}`,
				404
			)
		);
	}

	if (!req.files) {
		return next(new ErrorResponse(`pls upload a file`, 400));
	}

	const file = req.files['file\n'];

	console.log(file);

	//make sure the image is a photo
	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse(`pls  upload an image`, 400));
	}

	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(`pls  upload an image less than 10mb`, 400)
		);
	}

	//create custom file name
	const remoteimgname = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	//configure aws
	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESS_KEY,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.AWS_REGION,
	});

	var s3 = new AWS.S3();

	let params = {
		Bucket: 'bootcampfinder',
		Body: file.data,
		Key: remoteimgname,
		// ContentType: file.mimetype,
	};

	await s3
		.putObject(params, function (err, resp) {
			if (err) {
				console.log(err);
				return next(
					new ErrorResponse(
						`there was an error in uploading the video`,
						500
					)
				);
			} else console.log(resp);
		})
		.promise();

	let url = `https://bootcampfinder.s3.ap-south-1.amazonaws.com/${remoteimgname}`;

	bootcamp = await Bootcamp.findByIdAndUpdate(
		req.params.id,
		{ photo: url },
		{ new: true, runValidators: true }
	);

	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

//des-upload video
//route- put to /api/v1/bootcamps/:id/video
//acess- Private
exports.bootcampVideoUpload = asyncHandler(async (req, res, next) => {
	let bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found found with id of ${req.params.id}`,
				404
			)
		);
	}

	if (!req.files) {
		return next(new ErrorResponse(`pls upload a file`, 400));
	}

	const file = req.files['file\n'];

	console.log(file);

	//make sure the image is a photo
	if (!file.mimetype.startsWith('video/mp4')) {
		return next(new ErrorResponse(`pls  upload a mp4 video`, 400));
	}

	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(`pls  upload a video less than 10mb`, 400)
		);
	}

	//create custom file name
	const remoteimgname = `video_${bootcamp._id}${path.parse(file.name).ext}`;

	//configure aws
	AWS.config.update({
		accessKeyId: process.env.AWS_ACCESS_KEY,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		region: process.env.AWS_REGION,
	});

	var s3 = new AWS.S3();

	let params = {
		Bucket: 'bootcampfinder',
		Body: file.data,
		Key: remoteimgname,
		// ContentType: file.mimetype,
	};

	await s3
		.putObject(params, function (err, resp) {
			if (err) {
				console.log(err);
				return next(
					new ErrorResponse(
						`there was an error in uploading the video`,
						500
					)
				);
			} else console.log(resp);
		})
		.promise();

	let url = `https://bootcampfinder.s3.ap-south-1.amazonaws.com/${remoteimgname}`;

	bootcamp = await Bootcamp.findByIdAndUpdate(
		req.params.id,
		{ photo: url },
		{ new: true, runValidators: true }
	);

	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});
