const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

//des-GET ALL BOOTCAMPS
//route- GET to /api/v1/bootcamps
//acess- Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({
        success: true,
        count: bootcamps.length,
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
