
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var Canvas = require('canvas');
var Image = Canvas.Image;
var qrcode = require('jsqrcode')(Canvas);

var index = require('./routes/index');
var coupons = require('./routes/coupons');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars({
	helpers: {
		couponClassName : generateClassName
	}
}));

function generateClassName(name) {
			return (name.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~\s]/g, '').toLowerCase());
}

app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser({uploadDir: path.join(__dirname, "/public/images/tmp/")}));
app.use(express.methodOverride());
app.use(express.cookieParser('Intro HCI secret key'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Add routes here
app.get('/', index.welcome);
app.get('/view', index.view);
//app.get('/freewall', index.freewall);
app.get('/coupons', coupons.view);
app.post('/upload', function(req, res, next) {
	// may want to remove tmp files created during upload, 
	// check out from nodejs api the 'fs' module
	// use readdir, unlink, stat  to remove remove old uploaded images
	var image = new Image();
	var result;
	// should return more useful information to client to display 
	// sucess or failure
	image.onload = function() {
		try{
        	result = qrcode.decode(image);
        	console.log('result of qr code: ' + result);
      	}catch(e){
        	console.log('unable to read qr code');
      	}
	};
	image.src = req.files.file.path;

	// Maybe we want to return a coupon json object?
	res.json({
		result: result, 
		src: path.basename(image.src), 
		title: req.body.title,
		className: generateClassName(req.body.title),
		origFilename: req.files.file.originalFilename
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
