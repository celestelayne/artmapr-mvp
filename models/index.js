// Mongoose import
var mongoose = require("mongoose");

// Mongoose connection to MongoDB
mongoose.connect("mongodb://localhost/artmapr_app", function (err){
	if (err) {
		console.log(err);
	}
});

// Interact with the loaded models
module.exports.User = require("./user");
module.exports.Art = require("./art");