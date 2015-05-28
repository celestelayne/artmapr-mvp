var REPL = require("repl");
var db = require("./models");

var repl = REPL.start("User > ");
repl.context.db = db;

repl.on("exit", function () {
  console.log("GOODBYE!!");
  process.exit();
});