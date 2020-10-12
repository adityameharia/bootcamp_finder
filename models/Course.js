const mongoose = require('mongoose');

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

module.exports = mongoose.model('Course', CourseSchema);
