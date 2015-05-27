// Load bcrypt module
var bcrypt = require("bcrypt");
// Load mongoose module
var mongoose = require("mongoose");

var confirm = function (pswrd, pswrdCon) {
	return pswrd === pswrdCon;
};

var userSchema = new mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		required: true,
		index: {
			unique: true
		}
	},
	passwordDigest: {
		type: String,
		required: true
	},
	first_name: {
		type: String,
		default: ""
	},
	last_name: {
		type: String,
		default: ""
	}
});

// Create user
userSchema.statics.createSecure = function (params, callback) {
	var isConfirmed;

	isConfirmed = confirm(params.password, params.password_confirmation);

	if (!isConfirmed) {
		return callback("Passwords should match", null);
	}

	var that = this;

	bcrypt.hash(params.password, 12, function (err, hash) {
		params.passwordDigest = hash;
		that.create(params, callback);
	});

};

/*userSchema.statics.encryptPassword = function (password){
	var hash = bcrypt.hashSync(password, salt);
	return hash;
};*/

// Authenticate User
userSchema.statics.authenticate = function(params, callback){
	this.findOne({
		email: params.email
	},
	function (err, user){
		user.checkPassword(params.password, callback);
	});
};

userSchema.methods.checkPassword = function (password, callback){
	var user = this;
	bcrypt.compare(password,
		this.passwordDigest, function (err, isMatch){
			if (isMatch) {
				callback(null, user);
			} else {
				callback("Uh Oh", null)
			}
		});
};

var User = mongoose.model("User", userSchema);

module.exports = User;