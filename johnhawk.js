function dropdownCollapse(){
	$('.collapse').collapse('hide');
}

function openNav() {
	document.getElementById("navbarSide").style.left = "0";
}

function closeNav() {
	document.getElementById("navbarSide").style.left = "100%";
}

$(document).ready(function(){
	$('.nav-tabs a:first').tab('show')
	imgFade();
	addLoadEvent(preloader);
	$("html, body, .scroll").css({
		height: $(window).height()
	});

	$('.navSelector a').on('shown.bs.tab', function(event){
		var oldTag = $(event.relatedTarget).get()[0].hash	// previous tab
		var newTag = $(event.target).get()[0].hash	// active tab
		$('#pageLabel').text($(event.target).text()); // change page text
		imgFade(oldTag, newTag);
		$(`.${newTag.substring(1)}`).addClass("active");
		$(`.${oldTag.substring(1)}`).removeClass("active");
	});

	$('li>a[data-toggle="tab"]').on('click', function (e) {
		var bodyBgClass = $(this).attr("href").replace("#", "") + "-Background";
		$("body").removeClass().addClass(bodyBgClass);
	});
});

// Preload images
function preloader() {
	if (document.images) {
		var img1 = new Image();
		var img2 = new Image();
		var img3 = new Image();
		var img4 = new Image();

		img1.src = "Images/Backgrounds/Home.jpg";
		img2.src = "Images/Backgrounds/About.jpg";
		img3.src = "Images/Backgrounds/Projects.jpg";
		img4.src = "Images/Backgrounds/Contact.jpg";
	}
}

function addLoadEvent(func) {
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			if (oldonload) {
				oldonload();
			}
			func();
		}
	}
}
// End of preload

// Fade background when tabs changed
function imgFade(oldImg, newImg){
	if(oldImg != undefined){
		var newImgTag = newImg + "Background";
		var newImgID = newImgTag.substring(1);
		$(document.body).removeAttr('id');
		$(document.body).attr('id', newImgID);
	}
}

$(window).resize(function() {
	var vh = $(window).height();
	var vw = $(window).width();
	
	if (vw > 768) {
	   closeNav();
	}
});