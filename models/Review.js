const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

//defines Review models
const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'pls add a review title'],
		maxlength: 100,
	},

	text: {
		type: String,
		required: [true, 'Pls add some text'],
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [true, 'pls add a rating between 1 and 10'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	//type object id means that it types is another schema and ref defines which schema
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
});

//prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//static mehtod to get avg of rating for the given bootcamp,
//statics are basically functions that are called on the model itself whereas methods are called after "find" data from a model
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageRating: {
					$avg: '$rating',
				},
			},
		},
	]);
	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageRating: obj[0].averageRating,
		});
	} catch (error) {
		console.log(error);
	}
};

//call getAverage crating after saving a Review so that bootcamp avg rating can be upadted
ReviewSchema.post('save', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

//call getAverage rating after deleting a Review so that bootcamp avg rating can be upadted
ReviewSchema.pre('remove', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
