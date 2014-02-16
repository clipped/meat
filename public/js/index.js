'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
	$.get("coupons", {sort: "", popular: 1}, function(data) {
		$("#popular").append(data);
		$.get("coupons", {sort: "", popular: 0}, function(data) {
			$("#available").append(data);
			// Add coupon click handler
			$(".addCoupon").click(addCoupon);
		});
	});

	$("#checkoutBtn").click(function(){
		// hide modal when checkout btn is clicked
		$("#walletModal").modal("hide");
		// remove highlighting of nav tab by removing active class
		$("#navbar-collapse > ul > li.active").removeClass("active");
	});

	// Auto collapse nav menu when link is clicked
	$(".navbar-collapse .nav a").click(function() {
	    $(".navbar-toggle").click();
	});
}

function addCoupon(e) {
	e.preventDefault();

	// change badge text (num items in myClip)
	var num = parseInt($(".badge").text()) + 1;
	$(".badge").text(num);

	var className = $(this).closest("li").attr("class").split(" ")[1];
	var childrenSpan = $("." + className).find("span");

	// change + icons to check icons
	childrenSpan.toggleClass("glyphicon-plus glyphicon-check");
	childrenSpan.parent().unbind("click");

	// update clone of coupon in myClip
	var couponClone = $("." + className).clone()[0];
	var couponCloneGlyph = $(couponClone).find(".glyphicon");
	couponCloneGlyph.toggleClass("glyphicon-check glyphicon-remove");
	couponCloneGlyph.parent().click(removeCoupon);
	
	// add item to myClip
	if(num == 1) 
		$("#walletModal .modal-body").html('<ul class="media-list"></ul>');

	$("#walletModal .modal-body ul").append(couponClone);
}

function removeCoupon(e) {
	e.preventDefault();

	// change badge text (num items in myClip)
	var num = parseInt($(".badge").text()) - 1;
	$(".badge").text(num);

	var coupon = $(this).closest("li");
	if(num == 0) {
		$("#walletModal .modal-body").html('There is nothing in your wallet.');
	} 
	else {
		coupon.remove();
	}

	var className = $(this).closest("li").attr("class").split(" ")[1];
	var childrenSpan = $("." + className).find("span");

	// change check icons to + icons
	childrenSpan.toggleClass("glyphicon-check glyphicon-plus");
	childrenSpan.parent().unbind("click");
	childrenSpan.parent().click(addCoupon);

}

function getCoupons(sel) {
    var value = sel.options[sel.selectedIndex].value;

    $.get("/coupons?sort="+value, function(data) {
    	$("#available .couponlist").remove();
    	$("#available").append(data);
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