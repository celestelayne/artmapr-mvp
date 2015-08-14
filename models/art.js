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
		// geometry_lat: {
		// 	type: String,
		// 	default: "",
		// },
		// geometry_long: {
		// type: String,
		// default: "",
		// },
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

	// Art.collection.insert(arts);
	// var arts = [];
	// function insertArt(err, docs) {
	// 	if (err) {
	// 		console.log("Records not added")
	// 	} else {
	// 		for(var i=0; i<allArts.length; i++){
	// 			// JSON.stringify(allArts, ['geometry']);
	// 			allArts.save(function(err, arts){
	// 				if (err)
	// 				console.log(err);
	// 				else {
	// 					console.log(arts);
	// 				}
	// 			});
	// 	}
	// 	}
	// }
