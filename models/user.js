	// Load mongoose module
	var mongoose = require("mongoose");

	// Create mongoose user schema
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
			type: mongoose.Schema.Types.ObjectId, // referencing data from Art schema
			ref: 'Art'
		}],
		active: {
			type: Boolean,
			default: false
		},
		created_at: Date
	});

	// Load bcrypt module
	var bcrypt = require("bcrypt"); // library to help you hash passwords

	// Make sure the password and the password confirmation are the same
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
	userSchema.statics.authenticate = function(params, callback){
		// find just one user with the email
		this.findOne({
			email: params.email
		},
		function (err, user){
			console.log("The user is: " + user);
			if(user){
				user.checkPswrd(params.password, callback);
			} else {
				callback("Login failed - no user found");
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

	// Create mongoose model
	var User = mongoose.model("User", userSchema);

	// Make available to users in Node app
	module.exports = User;
