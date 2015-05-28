var express = require("express"),
	bodyParser = require("body-parser"),
	path = require("path"),
	request = require("request"),
	db = require("./models"),
	session = require("express-session"),
	_ = require("underscore");

var app = express();
// var views = path.join(process.cwd(), "views");
var views = path.join(__dirname, "views");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("bower_components"));
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

/* GET Home Page */
app.get("/", function (req, res){
	var homePath = path.join(views, "home.html");
	res.sendFile(homePath);
});

/* GET Sign Up Page */
app.get("/signup", function (req, res){
	var signupPath = path.join(views, "signup.html");
	res.sendFile(signupPath);
});

/* GET Login Page */
app.get("/login", function (req, res){
	var loginPath = path.join(views, "login.html");
	res.sendFile(loginPath);
});

/* GET Logout Page */
app.get("/logout", function (req, res){
	req.logout();
	res.redirect("/");
});

/* GET Profile Page */
app.get("/profile", function (req, res){
	req.currentUser(function (err, user){
		if (!err) {
			res.send();		
		} else {
			res.redirect("/login");
		}
	});
});

/* GET JSON data from Socrata 	*/
app.get("/arts", function (req, res){
	console.log("Requesting data from Socrata...")

	request.get({
		uri: "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, created_at, title, geometry, medium&$limit=50",
		// qs: {
		// 	limit: 1,
		// 	api_key: "3lWj6pK22BaDixjnFjFF06inN"
		// }
	}, function (err, apiRes, apiBody){

		if (err) {
			console.log("uh oh! Got an error from Socrata")
			res.send("There was an error")
		}
			console.log("Socrata API response is back")
			
			var body = JSON.parse(apiRes.body);
			// var coordinates = JSON.parse(body[3].geometry).coordinates.reverse();

			console.log("Grabbing the civic art data")
			res.send(body)
	});
});

// User submits sign-up form
app.post("/signup", function (req, res){
// grabs user from params
	var newUser = req.body.user;
// Create new user
	db.User.createSecure(newUser, function (err, user){
		if (user) {
			req.login(user);
			res.redirect("/profile");
		} else {
			res.redirect("/signup");
		}
	});
});

app.post("/login", function (req, res){
	var user = req.body.user;

	db.User.authenticate(user, function (err, user){
		console.log(user);
		console.log(err);
		if (!err) {
			req.login(user);
			res.redirect("/profile");
		} else {
			res.redirect("/login");
		}
	});
});

app.listen(3000, function (){

	console.log("this still works");
});