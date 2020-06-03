var app = require("../main"),
	faker = require("faker");

exports.get_port = function () {
	return app.get("port");
};

exports.set_username = (req, res) => {
	var newName = req.query.username;
	res.cookie("username", newName);
	res.locals.username = newName;
	res.json({status: "200", username: newName});
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

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * i);
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}
