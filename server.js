const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');

//load env var
dotenv.config({ path: './config/config.env' });

//connect to databse
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const app = express();

//body-parser
app.use(express.json());

//cookie parser middleare
app.use(cookieParser());

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

//file upload middleware
app.use(fileupload());

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
	PORT,
	console.log(
		`server run ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);

//handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
	console.log(`error:${err.message}`.red);
	//close server and exit process
	server.close(() => process.exit(1));
});
