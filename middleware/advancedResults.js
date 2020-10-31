const advancedResults = (model, populate) => async (req, res, next) => {
	let query;

	//copy req.query
	const reqQuery = { ...req.query };

	//fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

	//loop over fileds to exclude and delete them from query
	removeFields.forEach((param) => delete reqQuery[param]);

	//create query string
	let queryStr = JSON.stringify(reqQuery);

	//create operator($gt etc)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	//finding resource
	query = model.find(JSON.parse(queryStr));

	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
		console.log('hello');
	}

	console.log('h');

	//sort
	if (req.query.sort) {
		console.log('hi');
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		console.log('bye');
		query.sort('-createdAt');
	}

	//pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 15;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const tot = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	if (populate) {
		query = query.populate(populate);
	}

	//executing query
	const results = await query;

	//pagination result
	const pagination = {};

	if (endIndex < tot) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}
	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
