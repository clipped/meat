var data =  require('../data.json');

exports.view = function(req, res){
	var sort = req.query["sort"];

// coupons is th elist of all the coupons
	var coupons = [data.popularCoupons + data.availableCoupons];
	console.log(data);

	if(sort == "Expiration Date") {
		coupons.sort(function(a,b) {
			var da = new Date(a.expiration),
				db = new Date(b.expiration);
			return a < b;
		});
	}
	
	res.json(data);
};
