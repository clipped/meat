/*
 * GET home page.
 */
var coupons =  require('../data.json');

exports.view = function(req, res){
  res.render('index', coupons);
};