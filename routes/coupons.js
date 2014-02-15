var data =  require('../data.json');

exports.view = function(req, res){
	var sort = req.query["sort"];
	var getPop = req.query["popular"] == '1';

	if(getPop) {
		res.render("partials/coupons", {"coupons": data.popularCoupons});
		return;
	}

	// coupons is th elist of all the coupons
	var coupons = data.popularCoupons.concat(data.availableCoupons);

	if(sort == "Expiration Date") {
		coupons.sort(function(a,b) {
			var da = new Date(a.expiration),
				db = new Date(b.expiration);
			return a < b;
		});
	}
	res.render("partials/coupons", {"coupons":coupons});
};
