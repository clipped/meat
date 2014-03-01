/*
 * GET home page.
 */
var data =  require('../data.json');

exports.view = function(req, res){
	console.log(req.query);
	data.buttons = false;
	res.render('index', data);
};

exports.welcome = function(req, res) {
	res.render('welcome');
};
exports.buttons = function(req, res) {
	data.buttons = true;
	res.render('index', data)
};