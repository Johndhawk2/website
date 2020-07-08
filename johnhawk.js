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
	getViewportSize();
	var vw = $(window).width();
	getelemPos(vw);

	$('.navSelector a').on('shown.bs.tab', function(event){
		var oldTag = $(event.relatedTarget).get()[0].hash	// previous tab
		var newTag = $(event.target).get()[0].hash	// active tab
		$('#pageLabel').text($(event.target).text()); // change page text
		imgFade(oldTag,newTag,500);
		$(`.${newTag.substring(1)}`).addClass("active");
		$(`.${oldTag.substring(1)}`).removeClass("active");
	});

	$('li>a[data-toggle="tab"]').on('click', function (e) {
		var bodyBgClass = $(this).attr("href").replace("#", "") + "-Background";
		$("body").removeClass().addClass(bodyBgClass);
	});

	$('input#submit').click( function() {
		$.ajax({
			url: 'contact.php',
			type: 'post',
			dataType: 'json',
			data: $('form#myForm').serialize(),
			success: function(data) {
					   // ... do something with the data...
					 }
		});
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

function getViewportSize(){
	let vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function getelemPos(vw){
	if(vw <= 1200){
		$("#contactTitle").remove();
		$("#contCont").prepend(`<div class="pageTitle" id="contactTitle">Get in touch</div>`);
		$("#contactWriting").insertBefore("#contMe");
	}
	else{
		$("#contactTitle").remove();
		$("#contMe").prepend(`<div class="pageTitle" id="contactTitle">Get in touch</div>`);
		$("#contMe").insertBefore("#contactWriting");
	}
}

$(window).resize(function() {
	var vh = $(window).height();
	var vw = $(window).width();
	
	getViewportSize();
	getelemPos(vw);

	if (vw > 768) {
	   closeNav();
	}
});

/*$('#myForm').submit(function(e){
    e.preventDefault();
    $.ajax({
        url:'contact.php',
        type:'post',
        data:$('#myForm').serialize(),
        success:function(){
            //whatever you wanna do after the form is successfully submitted
        }
    });
});


function SubForm (){
    $.ajax({
        url:'/Person/Edit/@Model.Id/',
        type:'post',
        data:$('#myForm').serialize(),
        success:function(){
            alert("worked");
        }
    });
}*/

$(function() {
});