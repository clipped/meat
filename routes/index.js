/*
 * GET home page.
 */

exports.view = function(req, res){
	res.render('index');
};

exports.welcome = function(req, res) {
	res.render('welcome');
};