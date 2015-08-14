// FILE STRUCTURE

	bower_components
	node_modules
	models --> contains application model logic used to interact with database
	public --> assets directory
	 - js
	 - css
	 - img
	views --> contains all html files being sent ot client
	 - home.html --> home page with the map
	 - login.html
	 - signup.html
	 - profile.html
	index.js --> main application file


// CREATE NODE APP

npm init

// SET UP EXPRESS SERVER

npm install --save express

// STARTER CODE

var express = require('express'),
	app = express();

app.get('/', function (req, res) {
  var homePath = path.join(views, "home.html"); --> uses home.html in root route 
  res.sendFile(homePath);
})

var server = app.listen(3000, function () {
	console.log("This thing still works");
});

// ADD BODY PARSER

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

It populates req.body with the value of the POST parameters
See: http://stackoverflow.com/questions/18171749/what-does-the-bodyparser-in-connect-middleware-do

////// ROUTES //////

// CREATE
app.get("/login")
app.get("/signup")
app.get("/logout")

// READ
app.post("/users") --> accepts user signup requests
app.post("/login")
app.post("/signup")

// UPDATE
app.put("/profile")

// DELETE PROFILE
app.delete("/profile")

// SERVER PORT

app.listen(3000, function () {
	CONSOLE.LOG("This is still running.")
});

// INSTALL, REQUIRE MONGOOSE & ADD TO DATABASE

npm install --save mongoose

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test");

// CREATE MODELS & SCHEMAS

 - models/user.js
 - models.art.js

var userSchema = new mongoose.Schema
var User = mongoose.model('User', UserSchema);

var artSchema = new mongoose.Schema
var Art = mongoose.model('ArtPiece', ArtSchema);

// VERIFY THAT YOU CAN CREATE A USER IN NODE CONSOLE

var db = require("./models")
db.User.create({
    email: "gertrude@gmail.com",
    passwordDigest: "dolly"
}, function (err, user) {
  console.log(user);
});

// ADD STATICS METHOD TO SECURELY CREATE USER WITH bcrypt TO ENCRYPT PASSWORD

npm install --save bcrypt

var bcrypt = require("bcrypt"); —> securely creates a user

// ADD USER SIGN UP PAGE

Add form to signup.html
The method and action match the name of user route
<form method="POST" action="/users">

Make route to recieve post from the signup page

// AUTHENTICATE IN user.js

verify their email and password combination matches our DB and then log them in

// MAKE LOGIN PAGE

// CREATE PROFILE PAGE

// CREATE SESSIONS

npm install --save express-session

// LOGIN ROUTING



// AT SOME POINT I'LL HAVE OT MAKE A REQUEST OUT TO SODA API USING REQUEST

npm install --save request

Add to index.js:
var request = require('request');

Add to app.get:
request.get({
		uri: "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, created_at, title, geometry, medium&$limit=50", function (error, ApiRes, ApiBody) {
		if (!error && response.statusCode == 200) {
		var artData = JSON.parse(body);
	}
});