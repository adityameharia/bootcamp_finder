const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

//defines course models
const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'pls add a course title'],
	},
	description: {
		type: String,
		required: [true, 'Pls add a description'],
	},
	weeks: {
		type: String,
		required: [true, 'pls add the number of weeks'],
	},
	tuition: {
		type: Number,
		required: [true, 'pls add a tuition cost'],
	},
	minimumSkill: {
		type: String,
		required: [true, 'pls add a min skill'],
		enum: ['beginner', 'intermediate', 'advanced'],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
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
});

//static mehtod to get avg of courses for the given bootcamp,
//statics are basically functions that are called on the model itself whereas methods are called after "find" data from a model
CourseSchema.statics.getAverageCost = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageCost: {
					$avg: '$tuition',
				},
			},
		},
	]);
	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
		});
	} catch (error) {
		console.log(error);
	}
};

//call getAverage cost after saving a course so that bootcamp avg cost can be upadted
CourseSchema.post('save', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

//call getAverage cost after deleting a course so that bootcamp avg cost can be upadted
CourseSchema.pre('remove', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
