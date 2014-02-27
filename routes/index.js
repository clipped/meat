/*
 * GET home page.
 */
var data =  require('../data.json');

exports.view = function(req, res){
	res.render('index', data);
};

exports.welcome = function(req, res) {
	res.render('welcome');
};