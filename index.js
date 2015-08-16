	var express = require("express"),
		bodyParser = require("body-parser"), // get parameters from POST requests
		path = require("path"),
		morgan = require("morgan"), // log requests to console so can see what is happening
		fs = require("fs"), // allows you to read a file from the file system and display contents on terminal
		request = require("request");

	var db = require("./models");
	var	session = require("express-session");

	var app = express();
	var views = path.join(__dirname, "views");

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(express.static("bower_components"));
	app.use(express.static("node_modules"));
	app.use(express.static("public"));
	// Set up the logger
	app.use(morgan("combined"));

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

	// HOME ROUTE

	/* GET Home Page with MapBox map */
	app.get("/", function (req, res){
		res.render('home', {
	    title: 'Home'
	  });
	});

	/*  STATIC PAGE ROUTES  */

	// About Page Route
	app.get('/about', function (req, res){
	  res.render('about', {
	    title: 'About'
	  });
	});

	// Contact Page Route
	app.get('/contact', function (req, res){
	  res.render('contact', {
	    title: 'Contact'
	  });
	});

	/*  USER ROUTES  */
	
	// GET - new user 
	app.get("/users/signup", function (req, res){
		// user inputs parameters in signup form
		res.render("users/signup");
	});

	// POST - users POST data to create a new user account
	app.post("/users/signup", function (req, res){
		console.log(req.body.user);
		// Get the user params from the request
		var newUser = req.body.user;
		// Create the new user here
		console.log(user);
		// Call create secure static method with that email and password
		db.User.createSecure(newUser, function (err, user){ // runs after db.User.create finishes
			if (user) {
				req.login(user);
				res.redirect("/users/profile");
				console.log("New User signed Up!!!!!")
			} else {
				res.redirect("/users/signup");
			}
		});
	});

	// User login route
	app.get("/users/login", function (req, res){
		res.render("users/login");
	});

	// Type user password and email into
	// login form and post to THIS route to login 
	app.post("/users/login", function (req, res){
		var user = req.body.user;
		console.log(user);
			db.User.authenticate(user, function (err, user){
				if (!err) {
					console.log("Logging in current user");
					// Login user
					req.login(user);
					// Redirect to user profile
					res.redirect("/users/profile");
				} else {
					res.redirect("/users/login");
				}
			});
	});


	// GET User Profile if Logged In 
	app.get("/users/profile", function (req, res){
		req.currentUser(function (err, user){
				// res.send("Welcome, " + user.email);
				res.render("users/profile",{
					userInfo: user
				});
		});
	});

	// GET User logout Route 
	app.get("/logout", function (req, res){
		console.log("Logging out user")
		req.logout();
		res.redirect("/");
	});

	// Get all the users
	app.get('/users/index', function (req, res){
		db.User.find({}, function(err, users){
			// object of all the users in console
			console.log(users);
			// render the list of users on the index page
			res.render('users/index', {
				allUsers: users
			});
		});
	});

	// Update user parameters
	app.put("/users/:id", function (req, res){
		request({
			method: "PUT",
			formData: {
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email
			}
		});
	});

	app.delete("/users/:id", function (req, res){
		db.User.findByIdAndRemove({
			_id: req.params.id
		}, function(err, user){
			user.destroy().success(function() {
				res.send(204)
				res.redirect("/");
			});
		});
	});

	// ART ROUTES

	/* GET JSON data from Socrata */
	// Show all arts
	app.get("/arts/index", function (req, res){
		// console.log("Requesting data from socrata...")
		request({
				method: 'GET',
				uri: "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, created_at, title, medium&$limit=50"
			}, function(error, apiRes, apiBody){
				// var string = '';
			if (!error && apiRes.statusCode == 200) {
				// console.log("You're good to go")
			}
				// console.log("Socrata API response is back")

				var sfdata = JSON.parse(apiBody);
				console.log(sfdata) // prints out art in the terminal
				console.log("Grabbing the civic art data")
				res.render('arts/index', {
					allArts: sfdata
				});
			}).pipe(fs.createWriteStream("models/sf_data.json"));
	});



	app.get("/arts/new", function(req,res){
		console.log("Gets new data")
		res.render('arts/new');
	});

	app.post("arts/new", function(req, res){
		var art = new Art({
			// _id : req.body._id,
			artist : req.body.artist,
			title : req.body.title
		}).save(function(err, apiRes, apiBody){
			if (!err) {
				res.send(req.body);
			} else {
				console.log("No art here!!!!");
				res.send ("Problem loading art.");
			}
		});
	});

	// app.post("/arts/new", function (req, res){
	// 	console.log(res);
	// 	// Get the user from the params
	// 	var art = new Art(req.body);
	// 	var artTitle = req.body.title;
	// 	var artArtist = req.body.artist;
	// 	var medium = req.body.medium;
	//
	// 	var collection = db.Art.get('artCollection');
	// 	// Create the new user here
	// 	collection.insert({
	// 		"title": title,
	// 		"artist": artist,
	// 		"medium": medium
	// 	}, function (err){
	// 			// console.log(newUser);
	// 		if (err) {
	// 			res.send('There is a problem sending art to database');
	// 		} else {
	// 			res.send("Art added to database");
	// 		}
	// 	});
	// });

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
		console.log("this still works");
	});
