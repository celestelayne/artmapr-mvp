var express = require("express"),
	bodyParser = require("body-parser"),
	path = require("path"),
	request = require("request");
var db = require("./models");
var	session = require("express-session");
var	_ = require("underscore");

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

app.set("view engine", "ejs");

// USER ROUTES

/* GET Home Page */
app.get("/", function (req, res){
	// var homePath = path.join(views, "home.html");
	// res.sendFile(homePath);
	res.render('home.ejs');
});

app.get('/users', function(req, res){
	db.User.find({}, function(err,users){
		res.send(users);
	});
});

/* GET Sign Up New User */
app.get("/signup", function (req, res){
	// var signupPath = path.join(views, "signup.html");
	// res.sendFile(signupPath);
	res.render('signup');
});

/* POST is where User submits to database? */
app.post("/users", function (req, res){
	// Get the user from the params
	var newUser = req.body.user;
	// Create the new user here

	db.User.createSecure(newUser, function (err, user){
			// console.log(newUser);
		if (user) {
			req.login(user);
			res.redirect("/profile");
		} else {
			res.redirect("/signup");
		}
		// res.send(user);
	});
});

/* GET Login User */
app.get("/login", function (req, res){
	var loginPath = path.join(views, "login.html");
	// res.sendFile(loginPath);
	res.render('login');
});

/* GET Logout User */
app.get("/logout", function (req, res){
	req.logout();
	res.redirect("/");
});

/* GET Send User to Profile if Logged In */
app.get("/profile", function (req, res){
	// var profilePath = path.join(views, "profile.html");
	req.currentUser(function (err, user){
		if (!err) {
			// res.send(user);
			res.render('profile');
		} else {
			res.redirect("/login");
		}
		// res.send("coming soon");
	});
});

app.post("/login", function (req, res){
	var user = req.body.user;
	db.User.authenticate(user, function (err, user){
		if (!err) {
			req.login(user);
			res.redirect("/profile");
		} else {
			res.redirect("/login");
		}
	});
});

// ART ROUTES

/* GET JSON data from Socrata 	*/
app.get("/arts", function (req, res){
	console.log("Requesting data from socrata...")
	request.get({uri: "https://data.sfgov.org/resource/zfw6-95su.json"},
	function(error, apiRes, apiBody){
		if (!error && apiRes.statusCode == 200) {
			console.log("uh oh! Got an error from Socrata")
		}
			console.log("Socrata API response is back")

			var artdata = JSON.parse(apiBody);

			console.log("Grabbing the civic art data")
			// res.send(artdata)
			res.render('arts', {
				allArts: JSON.parse(apiBody)
			});
	});
});


app.get("/arts/new", function(req,res){
	res.render('arts/new');
});

app.post("/arts/new", function(req, res){
	// var newArt = req.body.art;
	request({
		method: "POST",
		uri: "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, location_1, created_at, title, geometry, medium&$limit=50",
		formData: {
			title: req.body.title,
			medium: req.body.medium,
			artist: req.body.artist,
			location_1: req.body.location_1
		}
	}, function(error, response, body){
		res.redirect("/");
	});
});

app.get("/arts/:id/edit", function(req, res){
	request("https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, location_1, created_at, title, geometry, medium&$limit=50" + req.params.id,
		function(error, response, body){
			res.render('arts/edit', {
				artInfo: JSON.parse(body)
			});
		});
});

app.put("/arts/:id", function(req, res){
	request({
		method: "PUT",
		uri: "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, location_1, created_at, title, geometry, medium&$limit=50",
		formData: {
			title: req.body.title,
			medium: req.body.medium,
			artist: req.body.artist,
			location_1: req.body.location_1
		}
	});
});

// SERVER

app.listen(process.env.PORT || 3000, function (){
	console.log("this still works");
});
