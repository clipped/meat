var data =  require('../data.json');

exports.view = function(req, res){
	var sort = req.query["sort"];

// coupons is th elist of all the coupons
	var coupons = data.popularCoupons.concat(data.availableCoupons);

	if(sort == "Expiration Date") {
		coupons.sort(function(a,b) {
			var da = new Date(a.expiration),
				db = new Date(b.expiration);
			    console.log(da.getDay());
			    return 1;
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
	
	res.json(data);
};
