var app = require('../main');

exports.get_port = function() {
    return app.get("port");
};

