exports.get_index = function(req, res) {
	res.render("landing");
};

exports.redirect_to_index = function(req, res) {
	res.redirect("board");
};
