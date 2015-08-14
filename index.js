	var express = require("express"),
		bodyParser = require("body-parser"),
		path = require("path"),
		morgan = require("morgan"), // request logs
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
	/* GET Sign Up A New User */
	app.get("/users/signup", function (req, res){
		res.render("users/signup");
	});

	/* GET Login User */
	app.get("/users/login", function (req, res){
		res.render('users/login');
	});

	// Insert or create a user
	app.post("/login", function (req, res){
		var user = req.body.user;
		console.log(user);
		db.User.authenticate(user, function (err, user){
			if (user) {
				req.login(user);
				res.redirect("users/profile");
			} else {
				res.redirect("users/login");
			}
		});
	});

	/* GET Logout User */
	app.get("/logout", function (req, res){
		console.log("Logging out")
		req.logout();
		res.redirect("/");
	});

	// Get all users
	app.get('/users/index', function(req, res){
		db.User.find({}, function(err, users){
			console.log(users);
			res.render('users/index', {
			allUsers: users
			});
		});
	});

	// Update user 
	app.put("/users/:id", function(req, res){
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

	/* POST submits User to database */
	app.post("/signup", function (req, res){
		// Get the user from the params
		var newUser = req.body.user;
		// Create the new user here
		console.log(newUser);
		db.User.createSecure(newUser, function (err, user){
			if (user) {
				req.login(user);
				res.redirect("users/profile");
			} else {
				res.redirect("/");
			}
		});
	});

	/* GET Read User Profile if Logged In */
	app.get("/users/profile", function (req, res){
		if(!req.session.userId) {
					res.redirect("/login");
				} else {
					db.User.findOne({
						"_id": req.session.userId
					}).done(function(err, user){
						res.render("users/profile");
						console.log(user);
					})
				}
});
		// Show specific user data
	// 	app.get("/users/:id", function(req, res){
	// 		if(!req.session.userId) {
	// 			res.redirect("users/login");
	// 		} else {
	// 			db.User.findOne({
	// 				"_id": req.session.userId
	// 			}).success(function(err, user){
	// 				res.send(user.)
	// 			})
	// 		}
	// .success(function(err, user){
	// 			res.render("users/edit", {
	// 				userInfo: user
	// 			});
	// 		});
	// 	});

	app.delete("/users/:id", function(req, res){
		db.User.findByIdAndRemove({
			_id: req.params.id
		}, function(err, user){
			user.destroy().success(function() {
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
