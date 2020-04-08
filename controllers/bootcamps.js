//des-GET ALL BOOTCAMPS
//route- GET to /api/v1/bootcamps
//acess- Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, msg: 'shows all the bootcamps' });
};

//des-GET ONE BOOTCAMPS
//route- GET to /api/v1/bootcamps/:id
//acess- Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `show bootcamp with id ${req.params.id}`,
    });
};

//des-create new BOOTCAMPS
//route- POST to /api/v1/bootcamps
//acess- Private
exports.createBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, msg: 'create the bootcamps' });
};

//des-UPDATE ONE BOOTCAMPS
//route- PUT to /api/v1/bootcamps/:id
//acess- PRIVATE
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `update bootcamp with id ${req.params.id}`,
    });
};

//des-DELETE ONE BOOTCAMPS
//route- DELETE to /api/v1/bootcamps/:id
//acess- Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `delete bootcamp with id ${req.params.id}`,
    });
};
