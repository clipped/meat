'use strict';

var fw = 1;		// make freewall default
var startTime; 
var firstAddClicked = 0, firstGenerate = 0;
var wall;

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	var tab = window.location.hash || "#about";
	$("#navbar-collapse .navlink").each(function() {
		if($(this).attr("href") == tab) {
			$(this).parent().addClass("active");
			return false;
		}
	});
	window.location.hash = "";
	$(tab).addClass("active");
	startTime = new Date().getTime();
	initializePage();
});

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
	// AJAX to populate list of coupons
	$.get("coupons", {sort: "", popular: 1, freewall: fw}, function(data) {
		$("#popular").append(data);
		$.get("coupons", {sort: "", popular: 0, freewall: fw}, function(data) {
			$("#available").append(data);
			// Add coupon click handler
			$(".addCoupon").click(addCoupon);

			if($("#popular").hasClass("active")) {
				setTimeout(function() {
					organizeCoupons("#popularFreewall");
				}, 400);
			}
			if($("#available").hasClass("active")) {
				setTimeout(function() {
					organizeCoupons("#availableFreewall");
				}, 400);
			}
		});
	});

	$("#checkoutBtn").prop('disabled', true);

	// Click handler for "checkout" i.e. Generate QR Code btn
	$("#checkoutBtn").click(function(e){
		// The button will be disabled when there are no items.
		if(parseInt($("#cartItems").text()) == 0) {
			e.preventDefault();
			return false;
		}
		// hide modal when checkout btn is clicked
		$("#walletModal").modal("hide");
		// remove highlighting of nav tab by removing active class
		$("#navbar-collapse > ul > li.active").removeClass("active");
		if(!firstGenerate)
			ga("send", "timing", "Generate Coupon", "First Generate", new Date().getTime() - startTime, {"page": window.location.pathnam});
		ga("send", "event", "Generate Coupon", "click", {"page": window.location.pathnam});
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
		$(".navbar-nav li a").each(function() {
			if($(this).attr("href") == newActive) {
				var activeTab = $(this).parent();
				setTimeout(function() {
					activeTab.addClass("active");
				}, 400);
				$(this).tab("show");
				if(fw) {
					organizeCoupons(newActive+"Freewall");
					$("#couponFilter").val("");
				}
				return;
			}
		});
	});

	// hide drop down when click outside
	$('.tab-content').click(function(){
		if($("#navbar-collapse").hasClass("in")) {
				$(".navbar-toggle").click();
		}
	});

	// Filtering coupons
	$("#couponFilter").keyup(function(){
		// Retrieve the input field text and reset the count to zero
		var filter = $(this).val();
 
		var selector = fw? $("#available .brick") : $("#available li");
		selector.each(function(){
			var found = $(this).text().search(new RegExp(filter, "i")) < 0;
			// If the list item does not contain the text phrase fade it out
			if ($(this).text().search(new RegExp(filter, "i")) < 0) {
				if(!fw)
					$(this).fadeOut();
				else
					$(this).removeClass("filterMe");
			} else {
				if(!fw)
					$(this).show();
				else
					$(this).addClass("filterMe");
			}
		});
		if(fw) {
			wall && wall.destroy();// && delete wall;
			wall = new freewall("#availableFreewall");
			wall.reset({
				selector: '.brick',
				animate: true,
				cellW: function(width){return width/2;},
				cellH: 'auto',
				onResize: function() {
					//wall.refresh();
				}
			});
			if (filter) {
				wall.filter(".filterMe");
			} else {
				wall.unFilter();
			}

			wall.fitWidth();
		}
	});

	$(".sortByBtn").click(function(e) {
		e.preventDefault();
		var sortBy = $(this).val();
		getCoupons(sortBy);
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
	$(".progress").hide();
	$(".progress-bar").text("0%");
	$(".progress-bar").css("width", "0%");
	ga("send", "event", "Upload Coupon", "Upload Attempt", {"page": window.location.pathnam});
	// No file selected
	if(!jqForm[0].file.value){
		$("#noFileMsg").show();
		return false;
	}
	// No name inputted
	if(!couponName){
		$("#noNameMsg").show();
		return false;
	}
	// Check if name is used
	if($(".coupons").hasClass(couponClassName)) {
		$("#dupCouponNameMsg").show();
		return false;
	}
	// Check if file has been uploaded already
	$(".origFilenames").each(function() {
		if($(this).val() == fileName) {
			duplicateFile = true;
			$("#dupCouponMsg").show();
			return false;
		}
	});

	// Disable upload button when uploading
	if(!duplicateFile) {
		$("#uploadBtn").prop("disabled", true);
		$(".progress").show();
	}
	return !duplicateFile;
}

/* 
 *	Post submit callback for upload form
 */
function showCoupon(rspTxt) {
	// Enable upload button when done
	$("#uploadBtn").prop("disabled", false);
	$(".progress-bar").text("100%");
	$(".progress-bar").css("width", "100%");
	if(!rspTxt.result) {
		$("#invalidQRMsg").show();
		return false;
	}
	ga("send", "event", "Upload Coupon", "Upload Success", {"page": window.location.pathnam});
	var str;
	str = '<li class="media coupon ' + rspTxt.className + '">'
		str += '<a class="pull-left disable">';
			str += '<img class="media-object couponThumbnail" src="images/tmp/' + rspTxt.src+ '" alt="...">';
		str += '</a>';
		str += '<div class="media-body">';
			str += '<h5 class="media-heading">';
			str += rspTxt.title; 
			str += '<a class="pull-right addCoupon"><span class="glyphicon glyphicon-plus"></span></a>';
			str += '</h5>';
			str += '<br>' + rspTxt.result + '<br>';
			str += '<input type="hidden" class="origFilenames" value="' + rspTxt.origFilename + '">';
		str += '</div>';
	str += '</li>';
	$("#camera ul").append(str);
	$("#camera ul li").last().find(".addCoupon").click(addCoupon);
}

function progressCallback(e, pos, total, percent) {
	// show 100% only when response recieved from /upload
	$(".progress-bar").text(percent+"%");
	$(".progress-bar").css("width", (percent-1)+"%");
	if(percent == 100) {
		$(".progress-bar").text("Processing");
	}
}

/*
 *	Click handler for adding a coupon to myClip
 */
function addCoupon(e) {
	e.preventDefault();
	if(!firstAddClicked) {
		firstAddClicked = 1;
		ga("send", "timing", "Add Coupon", "First Add Clicked", new Date().getTime() - startTime, {"page": window.location.pathnam});
	}
	ga("send", "event", "Add Coupon", "click", {"page": window.location.pathnam});
	// change cartItems text (num items in myClip)
	var num = parseInt($("#cartItems").text()) + 1;
	$("#cartItems").text(num);

	var isBrick = $(this).closest(".coupon").hasClass("brick");
	// Get the coupon name
	var couponClasses = $(this).closest(".coupon").attr("class").split(" ");
	var couponName = couponClasses[couponClasses.length-1];
	// Get the glyphicon span
	var couponGlyph = $("." + couponName).find(".glyphicon");

	// change + icons to check icons and unbind addCoupon
	couponGlyph.toggleClass("glyphicon-plus glyphicon-check");
	couponGlyph.parent().unbind("click");

	// Clone the coupon to add to myCLip
	var couponClone = $("." + couponName).clone()[0];
	if(isBrick) {
		var str, tmp;
		str = '<li class="media coupon ' + couponName + '">'
			str += '<a class="pull-left disable">';
				str += '<img class="media-object couponThumbnail" src="' + $(couponClone).children("img").attr("src") + '" alt="...">';
			str += '</a>';
		str += '</li>';
		tmp = $(str);
		tmp.append($(couponClone).find(".info"));
		$(tmp).find(".info").removeClass("info").addClass("media-body");
		$(tmp).find("h5").addClass("media-heading");
		
		couponClone = tmp;
	}
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
	var couponClasses = $(this).closest(".coupon").attr("class").split(" ");
	var couponName = couponClasses[couponClasses.length-1];
	var couponGlyph = $("." + couponName).find(".glyphicon");

	// change check icons to + icons
	couponGlyph.toggleClass("glyphicon-check glyphicon-plus");
	couponGlyph.parent().unbind("click");
	couponGlyph.parent().click(addCoupon);
}

function getCoupons(method) {
	$.get("/coupons",{sort: method, freewall: fw}, function(data) {
		// Update current list of coupons to sorted data
		$("#available .couponlist").remove();
		$("#available").append(data);
		if(fw) {
			setTimeout(function() {
					organizeCoupons("#availableFreewall");
				}, 300);
		}

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

function organizeCoupons(id) {
	wall && wall.destroy();// && delete wall;
	wall = new freewall(id);
	wall.reset({
		selector: '.brick',
		animate: true,
		cellW: function(width){return width/2;},
		cellH: 'auto',
		onResize: function() {
			//wall.refresh();
		}
	});
	
	var images = wall.container.find('.brick');
	var length = images.length;
	wall.fitWidth();
}