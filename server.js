const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//load env var
dotenv.config({ path: './config/config.env' });

//connect to databse
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
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

//middlewware to prevent nosql injections
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//middleware for preventing xss atks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, //10mins
	max: 100,
});

app.use(limiter);

//prevent http param pollution
app.use(hpp());

//enable cors
app.use(cors());

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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
