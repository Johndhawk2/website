google.charts.load('current', {'packages':['corechart','line']});
var cardTypeArray = [];

function test(){
	console.log("Test");
}

function cardCreation(cardType){
	if(cardType == "Step"){
		if(cardTypeArray.indexOf("Step") == -1){
			cardTypeArray.push("Step");
//			console.log("Step Count Card");
//			console.log(cardTypeArray);
			cardHTML("Step", "Step Counter");
		}
	}
	if(cardType == "HR"){
		if(cardTypeArray.indexOf("HR") == -1){
			cardTypeArray.push("HR");
//			console.log("Heart Rate Card");
//			console.log(cardTypeArray);
			cardHTML("HR", "Heart Rate");
		}
	}
	if(cardType == "TD"){
		if(cardTypeArray.indexOf("TD") == -1){
			cardTypeArray.push("TD");
//			console.log("Test Data Card");
//			console.log(cardTypeArray);
			cardHTML("TD", "Test Data");
		}
	}
}

function epochConvert(dayTime){
	var Hours = Math.floor(dayTime/3600);
	var Minutes = Math.floor((dayTime-Hours*3600)/60);
	var Seconds = dayTime-Hours*3600-Minutes*60;
	return [Hours,Minutes,Seconds];
}

function cardHTML(cardType, text){
	var randData = [];
	for(i=0; i<5; i++)randData.push(Math.random());
	// Create the data table.
	var data = new google.visualization.DataTable();
	data.addColumn('timeofday', 'Time');
	data.addColumn('number', 'Steps');
	data.addRows([
	[epochConvert(10000), randData[0]],
	[epochConvert(25000), randData[1]],
	[epochConvert(40204), randData[2]],
	[epochConvert(60660), randData[3]],
	[epochConvert(80000), randData[4]]
	]);

	document.getElementById("cardContainer").innerHTML += `
	<div class="card mb-3" id="${cardType}" style="display:none">
		<div class="card-header">
			${text}
			<button type="button" class="close py-0" aria-label="Close" onclick="closeCard(this)">
				<span aria-hidden="true"><i class="material-icons">close</i></span>
			</button>
		</div>
		<div class="card-body px-0" id="${cardType} body">

		</div>
	</div>`;
	$("#"+cardType).fadeIn(300,"swing",function(){
		drawChart(cardType, data);
	});
}

function closeCard(element){
	elemId = element.parentNode.parentNode.id
	cardTypeArray.splice(cardTypeArray.indexOf(elemId),1);
	$("#"+elemId).fadeOut(300,"swing",function(){
		document.getElementById(elemId).remove();
	});
}

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChartA);

function drawChartA(){
	// Create the data table.
	var data = new google.visualization.DataTable();
	data.addColumn('timeofday', 'Time');
	data.addColumn('number', 'Steps');
	data.addRows([
	[[1,0,0], 3],
	[[4,0,0], 1],
	[[12,0,0], 1],
	[[15,0,0], 1],
	[[23,0,0], 2]
	]);
	drawChart("Test", data);
}

function drawChart(elem, data) {
	var elemId = elem + " body"
	var elemWidth = document.getElementById(elemId).offsetWidth;

	// Set chart options
	var chartOptions = {	legend: {position: 'none'},
					chartArea: {left: 50, right: 20, top: 10, bottom: 30},
					hAxis: {title: data.getColumnLabel(0), baseline: 0},
					vAxis: {title: data.getColumnLabel(1)},
//					curveType: 'function',
					explorer: {axis: 'horizontal', keepInBounds: true},
					'width': elemWidth,
					'height': 2*elemWidth/3};

	var wrapper = new google.visualization.ChartWrapper({
		chartType: 'LineChart',
		dataTable: data,
		options: chartOptions,
		containerId: 'visualisation'
	});
	wrapper.draw(document.getElementById(elemId));
}