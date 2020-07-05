function dropdownCollapse(){
	$('.collapse').collapse('hide');
}

function openNav() {
	document.getElementById("navbarSide").style.width = "100%";
}

function closeNav() {
	document.getElementById("navbarSide").style.width = "0";
}

$(document).ready(function(){
	$('.nav-tabs a:first').tab('show')
	imgFade();
	addLoadEvent(preloader);

	$('.navSelector a').on('shown.bs.tab', function(event){
		var oldTag = $(event.relatedTarget).get()[0].hash	// previous tab
		var newTag = $(event.target).get()[0].hash	// active tab
		imgFade(oldTag,newTag);
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
function imgFade(oldImg, newImg, fadeTime){
	var oldImgID = oldImg + "Background";
	var newImgID = newImg + "Background";
	$(`${oldImgID}`).fadeOut(fadeTime);
	$(`${newImgID}`).fadeIn(fadeTime);
}