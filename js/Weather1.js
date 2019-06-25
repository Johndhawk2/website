const weatherKey = '3b74fe5b0c7443428c1125904192406';
const locCheck  = 'Bromley';
const DoWList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MonList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const locList = ["Amsterdam", "Barcelona", "Belfast", "Bordeaux", 
				 "Brighton", "Bristol", "Bromley", "California",
				 "Cannes", "Córdoba", "Durham", "Dublin",
				 "Edinburgh", "Glasgow", "Leeds", "Lille",
				 "Liverpool", "Marseilles", "Manchester", "Newcastle",
				 "New york", "Paris", "Seville", "Southampton"];

var wForecast = [];
var locForecast = [];

function getForecast(i, jsonResponse){
	this.date = jsonResponse.forecast.forecastday[i].date;
	this.dayHolder = new Date(this.date);
	this.day = DoWList[this.dayHolder.getDay()] + " " + MonList[this.dayHolder.getMonth()] + " "  + this.dayHolder.getDate();
	this.place = jsonResponse.location.name;
	this.avgtemp_c = jsonResponse.forecast.forecastday[i].day.avgtemp_c;
	this.maxtemp_c = jsonResponse.forecast.forecastday[i].day.maxtemp_c;
	this.mintemp_c = jsonResponse.forecast.forecastday[i].day.mintemp_c;
	this.icon = jsonResponse.forecast.forecastday[i].day.condition.icon;
	this.text = jsonResponse.forecast.forecastday[i].day.condition.text;
}

function getLocForecast(desiredLocation){
	this.location = desiredLocation;
	this.forecast = getWeatherForecast(desiredLocation);
}

function load(){
	for(var i=0;i<locList.length;i++){
		document.getElementById("location").innerHTML += `<option value="${locList[i]}">${locList[i]}</option>`
	}
}

function refresh(){
//	for(var j=0; j<locForecast.length; j++)getWeatherForecast(locForecast[j]);
	addCard();
}

function addCard(){
	var location = document.getElementById("location").value;
	if(locForecast.indexOf(location) == -1){
		locForecast.push(location);
		cardBuild(location);
	}
}

function deleteCard(location){
	locForecast.splice(locForecast.indexOf(location),1);
	document.getElementById("weatherCard" + location).remove();
}

async function getWeatherForecast(desiredLocation){
	const response = await fetch(`https://api.apixu.com/v1/forecast.json?key=${weatherKey}&q=${desiredLocation}&days=7`);
	const jsonResponse = await response.json();
	for(i=0; i<7; i++){
		var item = new getForecast(i, jsonResponse);
		wForecast[i] = item;
		try{document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Day" + i)[0].getElementsByClassName("DoW")[0].innerHTML = wForecast[i].day}catch{};
		try{document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Day" + i)[0].getElementsByClassName("Icon")[0].src = wForecast[i].icon}catch{};
		try{document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Day" + i)[0].getElementsByClassName("Temp")[0].innerHTML = "Avg:" + wForecast[i].avgtemp_c + "°C"}catch{};
		try{document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Day" + i)[0].getElementsByClassName("MaxTemp")[0].innerHTML = "Max:" + wForecast[i].maxtemp_c + "°C"}catch{};
		try{document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Day" + i)[0].getElementsByClassName("MinTemp")[0].innerHTML = "Min:" + wForecast[i].mintemp_c + "°C"}catch{};
		try{document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Day" + i)[0].getElementsByClassName("Text")[0].innerHTML = wForecast[i].text}catch{};
	}
	document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Date")[0].innerHTML = "Weekly forecast: " + dateInvert(wForecast[0].date);
	document.getElementById("weatherCard" + desiredLocation).getElementsByClassName("Place")[0].innerHTML = wForecast[0].place;
	console.log(wForecast);
	console.log(jsonResponse);
	return jsonResponse;
}

function dateInvert(date){
	return date.split('-').reverse().join('-');
}

function cardBuild(desiredLocation){
	var locTest = "'" + desiredLocation + "'";
	document.getElementsByClassName("weatherCards")[0].innerHTML +=`
	<div class="weatherCard" id="weatherCard${desiredLocation}">
	</div>`;
	document.getElementById("weatherCard" + desiredLocation).innerHTML=`
	<div class="Header">
		<h1 class="Date"></h1>
		<p class="Place"></p>
		<img src="./Images/Close.png" class="close" onClick="deleteCard(${locTest})">
	</div>`
	for(i=0;i<7;i++){
		document.getElementById("weatherCard" + desiredLocation).innerHTML+=`
		<div class="Day Day${i}">
			<p class="DoW"></p>
			<img src="" class="Icon temp">
			<p class="Temp temp"></p>
			<p class="MaxTemp temp"></p>
			<p class="MinTemp temp"></p>
			<br/>
			<p class="Text temp"></p>
		</div>`
	}
	getWeatherForecast(desiredLocation);
}