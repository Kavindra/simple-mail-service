var express  = require('express');
var app      = express(); // Create the app with express
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
// Initialize the port
const port = 3000;

app.use(express.static(__dirname + '/public')); // Set the static files location /public
app.use(morgan('dev')); // Log all the requests to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // Parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // Parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // Parse application/vnd.api+json as json
app.use(methodOverride());

// configure the routes
require('./app/routes')(app);
// Start the app with Nodejs on specified port
app.listen(port);
console.log('Server running on port ' + port);

// export app
exports = module.exports = app;


