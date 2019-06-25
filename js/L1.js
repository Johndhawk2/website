const weatherKey = '3b74fe5b0c7443428c1125904192406';
const locCheck  = 'Bromley';

var wForecast = [];
var locForecast = [];

function getForecast(i, jsonResponse){
	this.date = jsonResponse.forecast.forecastday[i].date;
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

async function refresh(){
	cardBuild("Bromley", 0);
	cardBuild("Durham", 1);
	cardBuild("Paris", 2);
	cardBuild("New York", 3);
	cardBuild("Sidney", 4);
	cardBuild("Berlin", 5);
	cardBuild("Moscow", 6);
	cardBuild("Hong Kong", 7);
	cardBuild("Deli", 8);
	cardBuild("Huston", 9);
//	var weatherForecast = await getWeatherForecast(locCheck);
//	console.log(document.getElementById("weatherCards"));
}

async function getWeatherForecast(desiredLocation, cardNo){
	const response = await fetch(`https://api.apixu.com/v1/forecast.json?key=${weatherKey}&q=${desiredLocation}&days=7`);
	const jsonResponse = await response.json();
	for(i=0; i<7; i++){
		var item = new getForecast(i, jsonResponse);
		wForecast[i] = item;
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
	var position = idNum * 10
	document.getElementsByClassName("weatherCards")[0].innerHTML +=`
	<div class="weatherCard" id="weatherCard${idNum}" style="top: ${position}px;">
	</div>`;
	document.getElementById("weatherCard" + idNum).innerHTML=`
	<div id="Header">
		<h1 class="Date"></h1>
		<p class="Place"></p>
	</div>`
	for(i=0;i<7;i++){
		document.getElementById("weatherCard" + idNum).innerHTML+=`
		<div class="Day Day${i}">
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