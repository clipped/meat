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

	$("#checkoutBtn").prop('disabled', true);

	// Click handler for "checkout" i.e. Generate QR Code btn
	$("#checkoutBtn").click(function(e){
		// The button will be disabled when there are no items.
		// Flash message when there are no items in myClip
		if(parseInt($("#cartItems").text()) == 0) {
			e.preventDefault();
			$(".modal-body").animate({color: "#fff", backgroundColor: "#aa0000"}, 300);
			$(".modal-body").animate({color: "#000", backgroundColor: "#fff"}, 300);
			return false;
		}
		// hide modal when checkout btn is clicked
		$("#walletModal").modal("hide");
		// remove highlighting of nav tab by removing active class
		$("#navbar-collapse > ul > li.active").removeClass("active");
	});

	// Auto collapse nav menu when link is clicked
	$(".navlink").click(function(e) {
		e.preventDefault();
		if(parseInt($(window).width()) < 768 ) {
			if($("#navbar-collapse").hasClass("in")) {
				$(".navbar-toggle").click();
			}
		}

		// update active tab in menu 
		$(".navbar-nav").find(".active").removeClass("active");
		var newActive = $(this).attr("href");
		$(".navbar-nav li a").each(function(i) {
			if($(this).attr("href") == newActive) {
				var activeTab = $(this).parent();
				setTimeout(function() {
					activeTab.addClass("active");
				}, 400);
				$(this).tab("show");
				return;
			}
		});
	});

	// Filtering coupons
	$("#couponFilter").keyup(function(){
		// Retrieve the input field text and reset the count to zero
		var filter = $(this).val();
 
		// Loop through the comment list
		$("#available li").each(function(){
			// If the list item does not contain the text phrase fade it out
			if ($(this).text().search(new RegExp(filter, "i")) < 0) {
				$(this).fadeOut();
			} else {
				$(this).show();
			}
		});
	});

	$(".modal .modal-body").css("max-height", parseInt($(window).height()*0.5-50));

	$("#cameraForm").ajaxForm({
		dataType: "json", 
		beforeSubmit: checkCouponName, 
		success: showCoupon, 
		uploadProgress: progressCallback
	});
}

/*
 *	Pre submit callback for upload form
 */
function checkCouponName(formData, jqForm, options) {
	var fileName = jqForm[0].file.value.split(/[\\/]/).pop();
	var couponName = jqForm[0].title.value;
	var generateClassName = function(name) {
				return (name.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~\s]/g, '').toLowerCase());
	}
	var couponClassName = generateClassName(couponName);
	var duplicateFile = false;

	$(".errMsg").hide();
	$(".progress-bar").text("0%");
	$(".progress-bar").css("width", "0%");

	if($("#camera ul li").hasClass(couponClassName)) {
		$("#dupCouponNameMsg").show();
		return false;
	}
	$(".origFilenames").each(function(i, e) {
		if($(this).val() == fileName) {
			duplicateFile = true;
			$("#dupCouponMsg").show();
			return false;
		}
	});
	if(!duplicateFile)
		$("#uploadBtn").prop("disabled", true);
	return !duplicateFile;
}

/* 
 *	Post submit callback for upload form
 */
function showCoupon(rspTxt) {
	if(!rspTxt.result) {
		$("#invalidQRMsg").show();
		return false;
	}
	$("#uploadBtn").prop("disabled", false);
	var str;
	str = '<li class="media ' + rspTxt.className + '">'
		str += '<a class="pull-left disable">';
			str += '<img class="media-object couponThumbnail" src="images/tmp/' + rspTxt.src+ '" alt="...">';
		str += '</a>';
		str += '<div class="media-body">';
			str += '<h4 class="media-heading">';
			str += rspTxt.title; 
			str += '<a class="pull-right addCoupon"><span class="glyphicon glyphicon-plus"></span></a>';
			str += '</h4>';
			str += '<br>' + rspTxt.result + '<br>';
			str += '<input type="hidden" class="origFilenames" value="' + rspTxt.origFilename + '">';
		str += '</div>';
	str += '</li>';
	$("#camera ul").append(str);
	$("#camera ul li").last().find(".addCoupon").click(addCoupon);
}

function progressCallback(e, pos, total, percent) {
	$(".progress-bar").text(percent+"%");
	$(".progress-bar").css("width", percent+"%");
}

/*
 *	Click handler for adding a coupon to myClip
 */
function addCoupon(e) {
	e.preventDefault();

	// change cartItems text (num items in myClip)
	var num = parseInt($("#cartItems").text()) + 1;
	$("#cartItems").text(num);

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
	if(num == 1) {
		$("#walletModal .modal-body").html('<ul class="media-list"></ul>');
		$("#checkoutBtn").prop("disabled", false);
	}

	$("#walletModal .modal-body ul").append(couponClone);
}

/*
 *	Click handler for removing a coupon from myClip
 */
function removeCoupon(e) {
	e.preventDefault();

	// change cartItems text (num items in myClip)
	var num = parseInt($("#cartItems").text()) - 1;
	$("#cartItems").text(num);

	var coupon = $(this).closest("li");
	if(num == 0) {
		$("#walletModal .modal-body").html('You have not clipped any coupons.');
		$("#checkoutBtn").prop("disabled", true);
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