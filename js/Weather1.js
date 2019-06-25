const weatherKey = '3b74fe5b0c7443428c1125904192406';
const locCheck  = 'Bromley';
const DoWList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MonList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var wForecast = [];
var locForecast = ["Bromley", "Durham", "Paris", "New York", "Sidney", "Berlin", "Moscow", "Hong Kong", "Deli", "Huston"];

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
	for(var j=0; j<7; j++)cardBuild(locForecast[j], j);
}

function refresh(){
	for(var j=0; j<7; j++)getWeatherForecast(locForecast[j], j);
}

async function getWeatherForecast(desiredLocation, cardNo){
	const response = await fetch(`https://api.apixu.com/v1/forecast.json?key=${weatherKey}&q=${desiredLocation}&days=7`);
	const jsonResponse = await response.json();
	for(i=0; i<7; i++){
		var item = new getForecast(i, jsonResponse);
		wForecast[i] = item;
		try{document.getElementById("weatherCard" + cardNo).getElementsByClassName("Day" + i)[0].getElementsByClassName("DoW")[0].innerHTML = wForecast[i].day}catch{};
		try{document.getElementById("weatherCard" + cardNo).getElementsByClassName("Day" + i)[0].getElementsByClassName("Icon")[0].src = wForecast[i].icon}catch{};
		try{document.getElementById("weatherCard" + cardNo).getElementsByClassName("Day" + i)[0].getElementsByClassName("Temp")[0].innerHTML = "Avg:" + wForecast[i].avgtemp_c + "°C"}catch{};
		try{document.getElementById("weatherCard" + cardNo).getElementsByClassName("Day" + i)[0].getElementsByClassName("MaxTemp")[0].innerHTML = "Max:" + wForecast[i].maxtemp_c + "°C"}catch{};
		try{document.getElementById("weatherCard" + cardNo).getElementsByClassName("Day" + i)[0].getElementsByClassName("MinTemp")[0].innerHTML = "Min:" + wForecast[i].mintemp_c + "°C"}catch{};
		try{document.getElementById("weatherCard" + cardNo).getElementsByClassName("Day" + i)[0].getElementsByClassName("Text")[0].innerHTML = wForecast[i].text}catch{};
	}
	document.getElementById("weatherCard" + cardNo).getElementsByClassName("Date")[0].innerHTML = "Weekly forecast: " + dateInvert(wForecast[0].date);
	document.getElementById("weatherCard" + cardNo).getElementsByClassName("Place")[0].innerHTML = wForecast[0].place;
	console.log(wForecast);
	console.log(jsonResponse);
	return jsonResponse;
}

function dateInvert(date){
	return date.split('-').reverse().join('-');
}

function cardBuild(desiredLocation, idNum){
	document.getElementsByClassName("weatherCards")[0].innerHTML +=`
	<div class="weatherCard" id="weatherCard${idNum}">
	</div>`;
	document.getElementById("weatherCard" + idNum).innerHTML=`
	<div id="Header">
		<h1 class="Date"></h1>
		<p class="Place"></p>
	</div>`
	for(i=0;i<7;i++){
		document.getElementById("weatherCard" + idNum).innerHTML+=`
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
	getWeatherForecast(desiredLocation, idNum);
}