//used to add all resources and delete them

const fs = require('fs');

const mongoose = require('mongoose');

const colors = require('colors');
const dotenv = require('dotenv');

//load env variables
dotenv.config({ path: './config/config.env' });

//load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

//conect to db
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

//read JSON Files
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
//read JSON Files
const courses = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);
//read JSON Files
const users = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
//read JSON Files
const reviews = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

//import into db
const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);
		await Course.create(courses);
		await User.create(users);
		await Review.create(reviews);
		console.log('Data Imported...'.green.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

//delete data
const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
		await Course.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('Data destroyed...'.red.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
}
