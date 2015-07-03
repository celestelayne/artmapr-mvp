// Mongoose import
var mongoose = require("mongoose");

// Mongoose connection to MongoDB
mongoose.connect( process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost/artmapr" );

// Interact with the loaded models
module.exports.User = require("./user");
module.exports.Art = require("./art");