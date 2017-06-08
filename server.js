var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

mongoose.Promise = Promise;

if(process.env.MONGODB_URI){
    mongoose.connect(process.env.MONGODB_URI);
} else{
    mongoose.connect("mongodb://localhost/newsdb");
}


var app = express();
var PORT = process.env.PORT || 4500;

// Allows morgan and body-parser to be used.
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
// Sets the handlebars engine
app.set('view engine', 'handlebars');

// Creates a public static directory to serve the static files
app.use(express.static("public"));

// Provides access to the MongoDB.
mongoose.connect("mongodb://localhost/newsdb");
var db = mongoose.connection;

db.on("error", function (error) {
  console.log("Mongoose Error: ", error);
});

// display a console message when mongoose has a conn to the db
db.once("open", function () {
  console.log("Mongoose connection successful.");
});

// Require the routes in our controllers js file
require("./controllers/controller.js")(app);

app.listen(PORT, function () {
  console.log("App running on port 4500.");
});