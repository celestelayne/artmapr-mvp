	// Load mongoose module
	var mongoose = require("mongoose");

	// Mongoose Schema definition
	var ArtSchema = new mongoose.Schema({
		artist: {
			type: String,
			default: ""
		},
		geometry: {
			type: String,
			default: "",
		},
		geometry_lat: {
			type: String,
			default: "",
		},
		geometry_long: {
		type: String,
		default: "",
		},
		medium: {
			type: String,
			default: ""
		},
		title: {
			type: String,
			default: ""
		}
	});

	// Mongoose model definition
	var Art = mongoose.model("Art", ArtSchema);

	// Interact with the loaded models
	module.exports = Art;
