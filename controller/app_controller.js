var app = require("../main"),
	faker = require("faker");

exports.get_port = function () {
	return app.get("port");
};

exports.get_username = (req, res, next) => {
	console.log("Cookies: ", req.cookies);
	generateUsername(req, res);
	next();
};

function generateUsername(req, res) {
	var cookie = req.cookies.username;
	if (cookie === undefined) {
		cookie = faker.name.findName();
		res.cookie("username", cookie);
		req.cookies.username = cookie;
	} else {
		console.log("cookie exists", cookie);
	}
	res.locals.username = cookie;
}
