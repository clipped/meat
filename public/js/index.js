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
	$(".addCoupon").click(function(e) {
		e.preventDefault();
		var num = parseInt($(".badge").text());
		$(".badge").text( num + 1);

		var className = $(this).closest("li").attr("class").split(" ")[1];
		var childrenSpan = $("." + className).find("span");
		childrenSpan.removeClass("glyphicon-plus");
		childrenSpan.parent().unbind("click");
		childrenSpan.addClass("glyphicon-check");
	});

	$(".disable").click(function(e) {
		e.preventDefault();
		return false;
	});
}

function addCoupon(e) {
}