
var data =  require('../data.json');

exports.view = function(req, res){
	var freewall = 1;
	var sort = req.query["sort"];
	var getPop = req.query["popular"] == '1';

	if(getPop) {
		res.render("partials/coupons", {"coupons": data.popularCoupons, "freewall": freewall, "id": "popularFreewall"});
		return;
	}

	// coupons is th elist of all the coupons
	var coupons = data.popularCoupons.concat(data.availableCoupons);

	if(sort == "Expiration Date") {
		coupons.sort(function(a,b) {
			var da = new Date(a.expiration),
				db = new Date(b.expiration);
			if( da < db)
				return -1;
			else if(da > db)
				return 1;
			else{
				if( a.name.toLowerCase() < b.name.toLowerCase())
					return -1;
				if( a.name.toLowerCase() > b.name.toLowerCase() )
					return 1;
			}
			return 0;

		});
	}

	else if(sort == "Name"){
	coupons.sort(function(a,b) {
		if( a.name.toLowerCase() < b.name.toLowerCase())
			return -1;
		if( a.name.toLowerCase() > b.name.toLowerCase() )
			return 1;
		return 0;
		});	
	}

	else if(sort == "Store"){
		coupons.sort(function(a,b){
			if( a.store.toLowerCase() < b.name.toLowerCase() )
				return -1;
			else if( a.store.toLowerCase() > b.name.toLowerCase() )
				return 1;
			else{
				if( a.name.toLowerCase() < b.name.toLowerCase())
					return -1;
				if( a.name.toLowerCase() > b.name.toLowerCase() )
					return 1;
			}
			return 0;
		});
	}

	res.render("partials/coupons", {"coupons":coupons, "freewall": freewall, "id": "availableFreewall"});
};

