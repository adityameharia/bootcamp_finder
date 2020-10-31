const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

//desc-register user
//route-POST /api/v1/auth/register
//access-public

exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	//create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	sendTokenResponse(user, 200, res);
});

//desc-logn user
//route-POST /api/v1/auth/login
//access-public

exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	//validate email & password
	if (!email || !password) {
		return next(new ErrorResponse('pls an email and password', 400));
	}

	//check for user
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorResponse('invalid credentials', 401));
	}

	//check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse('invalid credentials', 401));
	}

	sendTokenResponse(user, 200, res);
});

//des-log user out and clear cookie
//route- GET /api/v1/auth/logout
//access-private

exports.logout = asyncHandler(async (req, res, next) => {
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({ success: true, data: {} });
});

//des-get current logged in user
//route- POST /api/v1/auth/me
//access-private

exports.getMe = asyncHandler(async (req, res, next) => {
	console.log(req.user._id);
	let user = await User.findById(req.user._id);
	res.status(200).json({ success: true, data: user });
});

//des-route to get email to which we will send recovery password
//route- POST /api/v1/auth/forgotpassword
//access-public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(
			new ErrorResponse(
				'if the email exists in out database then a recovery mail has been sent to it',
				404
			)
		);
	}

	//get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	//create reset url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `ypu are recieving this mail because the u reqed for a change of passwords.pls send a PUT request to \n\n${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'password reset token',
			message,
		});

		res.status(200).json({ success: true, data: 'email sent' });
	} catch (error) {
		console.log(error);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse('email couldnt be sent', 500));
	}
});

//des-reset password
//route- Put /api/v1/auth/resetpassword/:resettoken
//access-public

exports.resetPassword = asyncHandler(async (req, res, next) => {
	//get hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');

	let user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse('invalid token', 400));
	}

	//set the new password
	user.password = req.body.password;

	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	sendTokenResponse(user, 200, res);
});

//des-update user details
//route- PUT /api/v1/auth/updatedetails
//access-private

exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	let user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({ success: true, data: user });
});

//des-update password
//route- PUT /api/v1/auth/updatepassword
//access-private

exports.updatePassword = asyncHandler(async (req, res, next) => {
	let user = await User.findById(req.user._id).select('+password');

	//check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('password is incorrect', 401));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});

//get token from model,create cookie and send res
const sendTokenResponse = (user, statusCode, res) => {
	//create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 3600 * 24 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};
