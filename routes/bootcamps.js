const express = require('express');
const {
    getBootcamp,
    getBootcamps,
    createBootcamps,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
} = require('../controllers/bootcamps');
const router = express.Router();

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/').get(getBootcamps).post(createBootcamps);
router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;
