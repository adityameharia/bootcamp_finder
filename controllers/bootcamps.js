const Bootcamp = require('../models/Bootcamp');

//des-GET ALL BOOTCAMPS
//route- GET to /api/v1/bootcamps
//acess- Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps,
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//des-GET ONE BOOTCAMP
//route- GET to /api/v1/bootcamps/:id
//acess- Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({
            success: true,
            data: bootcamp,
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//des-create new BOOTCAMPS
//route- POST to /api/v1/bootcamps
//acess- Private
exports.createBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data: bootcamp,
        });
        next();
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
        next();
    }
};

//des-UPDATE ONE BOOTCAMPS
//route- PUT to /api/v1/bootcamps/:id
//acess- PRIVATE
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!bootcamp) {
            return res.status(400).json({
                success: false,
            });
        }
        res.status(200).json({
            success: true,
            data: bootcamp,
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//des-DELETE ONE BOOTCAMPS
//route- DELETE to /api/v1/bootcamps/:id
//acess- Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        if (!bootcamp) {
            return res.status(400).json({
                success: false,
            });
        }
        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
