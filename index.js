	var express = require("express"),
		bodyParser = require("body-parser"),
		path = require("path"),
		request = require("request");
	var fs = require('fs');
	var https = require('https');
	var db = require("./models");
	var	session = require("express-session");
	var gravatar = require('gravatar');

	var app = express();
	var views = path.join(__dirname, "views");

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(express.static("bower_components"));
	app.use(express.static("node_modules"));
	app.use(express.static("public"));

	app.use(session({
		secret: 'alloo pie',
		resave: false,
		saveUninitialized: true
	}));

	// Login Helpers
	var loginHelpers = function (req, res, next) {

		req.login = function (user) {
			req.session.userId = user._id;
			req.user = user;
			return user;
		};

		req.logout = function () {
			req.session.userId = null;
			req.user = null;
		};

		req.currentUser = function (callback) {
			var userId = req.session.userId;
			db.User.findOne({
				_id: userId
			}, callback);
		};
		next();
	};

	app.use(loginHelpers);

	var methodOverride = require("method-override");
	app.use(methodOverride("_method"));
	app.set("view engine", "ejs");

	// app.locals.appdata = require('./sf_data.json', 'utf8');

	// USER ROUTES

	/* GET Home Page with MapBox map */
	app.get("/", function (req, res){
		res.render('home', {
	    title: 'Home'
	  });
	});

	// STATIC PAGE ROUTES
	app.get('/about', function(req, res){
	  res.render('about', {
	    title: 'About'
	  });
	});

	app.get('/contact', function(req, res){
	  res.render('contact', {
	    title: 'Contact'
	  });
	});

	// USER ROUTES
	/* GET Sign Up New User */
	app.get("/users/signup", function (req, res){
		res.render('users/signup',{
			firstname: req.body.first_name,
			lastname: req.body.last_name,
			email: req.body.email,
			password: req.body.password,
			password: req.body.password_confirmation
		});
	});

	/* GET Login User */
	app.get("/login", function (req, res){
		// var loginPath = path.join(views, "login.html");
		res.render('users/login');
	});

	//
	app.post("/login", function (req, res){
		var user = req.body.user;
		db.User.authenticate(user, function (err, user){
			if (!err) {
				req.login(user);
				res.redirect("/users/profile");
			} else {
				res.redirect("/users/login");
			}
		});
	});

	/* GET Logout User */
	app.get("/logout", function (req, res){
		req.logout();
		res.redirect("/");
	});

	// Get all users
	app.get('/users/index', function(req, res){
		db.User.find({}, function(err, users){
			res.render('users/index', {
				allUsers: users
			});
			console.log(users);
		});
	});

	// Show specific user data
	app.get("/users/edit/:id", function(req, res){
		db.User.findById(req.params.id).success(function(err, user){
			res.render("users/edit", {
				userInfo: user
			});
		});
	});

	// Process user update
	app.put("/users/edit/:id", function(req, res){
		db.User.findById(req.params.id).success(function(err, user){
			user.updateAttributes({
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email
			}).success(function(){
				res.redirect("/");
			});
		});
	});

	/* POST is where User submits to database? */
	app.post("/users", function (req, res){
		// Get the user from the params
		var newUser = req.body.user;
		// Create the new user here

		db.User.createSecure(newUser, function (user, err){
				// console.log(newUser);
			if (user) {
				req.login(user);
				res.redirect("users/profile");
			} else {
				res.redirect("users/signup");
			}
		});
	});

	/* GET Send User to Profile if Logged In */
	app.get("/users/profile", function (req, res){
		req.currentUser(function (err, user){
			if (!err) {
				res.send(user);
				res.render('users/profile');
			} else {
				res.redirect("users/login");
			}
		});
	});

	app.delete("/delete/:id", function(req, res){
		db.User.findByIdAndRemove(req.params.id).success(function(err, user){
			user.destroy().success(function() {
				res.redirect("/");
			});
		});
	});

	// ART ROUTES

	/* GET JSON data from Socrata 	*/
	// Show all arts
	app.get("/arts/index", function (req, res){
		console.log("Requesting data from socrata...")
		request.get({uri: "https://data.sfgov.org/resource/zfw6-95su.json"},
		function(error, apiRes, apiBody){
			if (!error && apiRes.statusCode == 200) {
				console.log("uh oh! Got an error from Socrata")
			}
				console.log("Socrata API response is back")

				var artdata = JSON.parse(apiBody);

				console.log("Grabbing the civic art data")
				res.render('arts/index', {
					allArts: JSON.parse(apiBody)
				});
		});
	});



	app.get("/arts/new", function(req,res){
		console.log("Gets new data")
		res.render('arts/new');
	});

	app.post("/arts/new", function (req, res){
		console.log(res);
		// Get the user from the params
		var art = new Art(req.body);
		var artTitle = req.body.title;
		var artArtist = req.body.artist;
		var medium = req.body.medium;

		var collection = db.Art.get('artCollection');
		// Create the new user here
		collection.insert({
			"title": title,
			"artist": artist,
			"medium": medium
		}, function (err){
				// console.log(newUser);
			if (err) {
				res.send('There is a problem sending art to database');
			} else {
				res.send("Art added to database");
			}
		});
	});

	// Show specific art information
	app.get("/arts/:id/edit", function(req, res){
		request("https://data.sfgov.org/resource/zfw6-95su.json?$limit=50",
			function (error, apiRes, apiBody){
				res.render('arts/edit', {
					artInfo: JSON.parse(apiBody)
				});
			});
	});

	app.put("/arts/:id", function(req, res){
		request({
			method: "PUT",
			uri: "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, _id_, location_1, created_at, title, geometry, medium&$limit=50",
			formData: {
				title: req.body.title,
				medium: req.body.medium,
				artist: req.body.artist,
			}
		});
	});

	// Delete art
	app.delete("/arts/:id/delete", function(req, res){
		request({
				method: "DELETE",
				uri: "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, _id_, location_1, created_at, title, geometry, medium&$limit=50" + req.params.id
			 }, function (error, apiRes, apiBody){
					res.redirect("/");
			});
		});

	// SERVER

	app.listen(process.env.PORT || 3000, function (){
		var avatar = gravatar.url('req.body.email', {s: '100', r: 'x', d: 'retro'}, true);
		// console.log(avatar);
		console.log("this still works");
	});
