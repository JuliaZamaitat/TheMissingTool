exports.getIndex = function(req, res) {
	res.render("landing");
};

exports.redirectToIndex = function(req, res) {
	res.redirect("board");
};

exports.getImprint = function(req,res) {
	res.render("imprint");
};

exports.getPrivacyPolicy = function(req,res) {
	res.render("privacy-policy");
};