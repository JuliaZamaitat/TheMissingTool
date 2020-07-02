exports.getIndex = function(req, res) {
	res.render("landing");
};

exports.redirectToIndex = function(req, res) {
	res.redirect("board");
};
