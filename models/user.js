// Load mongoose module
var mongoose = require("mongoose");

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
	},
	favorites: {
		type: String,
		default: ""
	}
});

// Load bcrypt module
var bcrypt = require("bcrypt");

var confirm = function (pswrd, pswrdCon) {
	return pswrd === pswrdCon;
};

// Create user
userSchema.statics.createSecure = function (params, callback) {
	var isConfirmed;

	isConfirmed = confirm(params.password, params.password_confirmation);

	if (!isConfirmed) {
		return callback(console.log("Passwords should match"), null);
	}
	// saves the user email and hashes the password
	var that = this;

	bcrypt.hash(params.password, 12, function (err, hash) {
		params.passwordDigest = hash;
		console.log(params);
		that.create(params, function(err, user){
			if (user)
			callback (null, user);
			else {
				callback ("Signup failed", null);
			}
		});
	});
};

// Authenticate User
userSchema.statics.authenticate = function(params, cb){
	// find just one user with the email
	this.findOne({
		email: params.email
	},
	function (err, user){
		// var user = this;
		console.log(user);
		if(user){
			user.checkPswrd(params.password, cb);
		} else {
			cb("Login failed - no user found");
		}
	});
};

userSchema.methods.checkPswrd = function (password, callback){
	var user = this;
	bcrypt.compare(password,
		this.passwordDigest, function (err, isMatch){
			if (isMatch) {
				console.log("MATCHED");
				callback(null, user);
			} else {
				callback("Login failed - password incorrect", null)
			}
		});
	};

var User = mongoose.model("User", userSchema);

module.exports = User;
