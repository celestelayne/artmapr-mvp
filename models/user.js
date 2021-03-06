	// Load mongoose module
	var mongoose = require("mongoose");

	// Mongoose Schema definition
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
		favorites: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Art'
		}],
		active: {
			type: Boolean,
			default: false
		}
	});

	// Load bcrypt module
	var bcrypt = require("bcrypt");

	var confirm = function (pswrd, pswrdCon) {
		return pswrd === pswrdCon;
	};

	// Statics method for securely creating and adding a user
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

			console.log("The params is: " + params);

			that.create(params, cb);
		});
	};

	// Authenticate User
	userSchema.statics.authenticate = function(params, cb){
		// find just one user with the email
		this.findOne({
			email: params.email
		},
		function (err, user){
			console.log("The user is: " + user);
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

	// Mongoose model definition
	var User = mongoose.model("User", userSchema);

	// Interact with the loaded models
	module.exports = User;
