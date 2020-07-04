const faker = require("faker");

exports.setUsername = (req, res, next) => {
	let cookie = req.cookies.username;
	if (cookie === undefined) {
		cookie = faker.name.findName();
		res.cookie("username", cookie);
		req.cookies.username = cookie;
	}
	res.locals.username = cookie;
	next();
};
