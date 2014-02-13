'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
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

	// Add coupon click handler
	$(".addCoupon").click(addCoupon);

	$(".disable").click(function(e) {
		e.preventDefault();
		return false;
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
	childrenSpan.removeClass("glyphicon-plus");
	childrenSpan.parent().unbind("click");
	childrenSpan.addClass("glyphicon-check");

	var couponClone = $("." + className).clone()[0];
	var couponCloneGlyph = $(couponClone).find(".glyphicon");
	couponCloneGlyph.removeClass("glyphicon-check");
	couponCloneGlyph.addClass("glyphicon-remove");
	couponCloneGlyph.parent().click(removeCoupon);
	
	// add item to myClip
	if(num == 1) {
		$("#walletModal .modal-body").html('<ul class="media-list"></ul>');
	}
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

	// change x icons to + icons
	childrenSpan.removeClass("glyphicon-check");
	childrenSpan.parent().unbind("click");
	childrenSpan.addClass("glyphicon-plus");
	childrenSpan.parent().click(addCoupon);

}