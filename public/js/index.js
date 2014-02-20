'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
	// AJAX to populate list of coupons
	$.get("coupons", {sort: "", popular: 1}, function(data) {
		$("#popular").append(data);
		$.get("coupons", {sort: "", popular: 0}, function(data) {
			$("#available").append(data);
			// Add coupon click handler
			$(".addCoupon").click(addCoupon);
		});
	});

	// Click handler for "checkout" i.e. Generate QR Code btn
	$("#checkoutBtn").click(function(e){
		// Flash message when there are no items in myClip
		if(parseInt($(".badge").text()) == 0) {
			e.preventDefault();
			$(".modal-body").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
			return false;
		}
		// hide modal when checkout btn is clicked
		$("#walletModal").modal("hide");
		// remove highlighting of nav tab by removing active class
		$("#navbar-collapse > ul > li.active").removeClass("active");
	});

	// Auto collapse nav menu when link is clicked
	$(".navbar-collapse .nav a").click(function() {
		if(parseInt($(window).width()) < 768 )
			$(".navbar-toggle").click();
	});

	// Filtering coupons
	$("#couponFilter").keyup(function(){
		// Retrieve the input field text and reset the count to zero
		var filter = $(this).val(), count = 0;
 
		// Loop through the comment list
		$("#available li").each(function(){
			// If the list item does not contain the text phrase fade it out
			if ($(this).text().search(new RegExp(filter, "i")) < 0) {
				$(this).fadeOut();
 
			// Show the list item if the phrase matches and increase the count by 1
			} else {
				$(this).show();
				count++;
			}
		});
 
		// Update the count
		var numberItems = count;
		$("#filter-count").text("Number of Comments = "+count);
	});

	$(".modal .modal-body").css("max-height", parseInt($(window).height()*0.5));

	$("#cameraForm").ajaxForm({dataType: "json", success: function(rspTxt) {
		// Do something w/ rspTxt which is a json object
		console.log(rspTxt);
		$("#camera ul").append('<li class="media ' + rspTxt.className + '"><a class="pull-left disable"><img class="media-object couponThumbnail" src="images/tmp/'+rspTxt.src+ '" alt="..."></a><div class="media-body"><h4 class="media-heading">'+ rspTxt.title + '<a class="pull-right addCoupon"><span class="glyphicon glyphicon-plus"></span></a></h4><br>' + rspTxt.result + '<br></div></li>');
		$("#camera ul li").last().find(".addCoupon").click(addCoupon);
	}});
}

/*
 *	Click handler for adding a coupon to myClip
 */
function addCoupon(e) {
	e.preventDefault();

	// change badge text (num items in myClip)
	var num = parseInt($(".badge").text()) + 1;
	$(".badge").text(num);

	// Get the coupon name
	var couponName = $(this).closest("li").attr("class").split(" ")[1];
	// Get the glyphicon span
	var couponGlyph = $("." + couponName).find(".glyphicon");

	// change + icons to check icons and unbind addCoupon
	couponGlyph.toggleClass("glyphicon-plus glyphicon-check");
	couponGlyph.parent().unbind("click");

	// Clone the coupon to add to myCLip
	var couponClone = $("." + couponName).clone()[0];
	var couponCloneGlyph = $(couponClone).find(".glyphicon");

	// update clone of coupon in myClip
	couponCloneGlyph.toggleClass("glyphicon-check glyphicon-remove");
	couponCloneGlyph.parent().click(removeCoupon);
	
	// add item to myClip
	if(num == 1) 
		$("#walletModal .modal-body").html('<ul class="media-list"></ul>');

	$("#walletModal .modal-body ul").append(couponClone);
}

/*
 *	Click handler for removing a coupon from myClip
 */
function removeCoupon(e) {
	e.preventDefault();

	// change badge text (num items in myClip)
	var num = parseInt($(".badge").text()) - 1;
	$(".badge").text(num);

	var coupon = $(this).closest("li");
	if(num == 0) {
		$("#walletModal .modal-body").html('Start clipping and start saving!');
	} 
	else {
		coupon.remove();
	}

	// Find coupons to update
	var couponName = $(this).closest("li").attr("class").split(" ")[1];
	var couponGlyph = $("." + couponName).find(".glyphicon");

	// change check icons to + icons
	couponGlyph.toggleClass("glyphicon-check glyphicon-plus");
	couponGlyph.parent().unbind("click");
	couponGlyph.parent().click(addCoupon);
}

/*
 *	Update available coupon list based on sort
 */
function getCoupons(sel) {
	var value = sel.options[sel.selectedIndex].value;

	$.get("/coupons?sort="+value, function(data) {
		// Update current list of coupons to sorted data
		$("#available .couponlist").remove();
		$("#available").append(data);

		// New list of coupons don't have old infomation such as if it were already added or not
		// Check added coupons and fix the list
		var added = [];
		$("#walletModal .modal-body li").each(function() {
			added.push("." + $(this).attr('class').split(' ')[1]);
		});
		added = added.join(", ");

		var availCoupons = $("#available li");
		var addedCouponsGlphySpan = availCoupons.filter(added).find("span");

		availCoupons.not(added).find(".addCoupon").click(addCoupon);
		addedCouponsGlphySpan.removeClass("glyphicon-plus");
		addedCouponsGlphySpan.addClass("glyphicon-check");
	});
}