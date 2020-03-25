google.charts.load('current', {'packages':['corechart','line']});
// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChartA);

var IDType = [256];
var IDName = [256];
var IDCount = [1,2,252,253,254,255];
var cardTypeArray = [];
var graphArray = [];

var TransparentService = "49535343-fe7d-4ae5-8fa9-9fafd205e455";
var TXCharacteristic = "49535343-1e4d-4bd9-ba61-23c647249616";
var RXCharacteristic = "49535343-8841-43f4-a8d4-ecbe34729bb3";

var bleOptions = {
	acceptAllDevices: true,
	optionalServices: [TransparentService]
	};

IDType[0] = "Time";
IDType[1] = "Step";
IDType[2] = "HR";
IDType[3] = "TD";
IDType[252] = "Inp";
IDType[253] = "BtA";
IDType[254] = "BtB";
IDType[255] = "BtC";

IDName[0] = "Time";
IDName[1] = "Step Counter";
IDName[2] = "Heart Rate";
IDName[3] = "Test Data";
IDName[252] = "Custom Event";
IDName[253] = "Button A";
IDName[254] = "Button B";
IDName[255] = "Button C";

var PAM = new Object()
	PAM.Main;
	PAM.Device;
	PAM.Service;
	PAM.ServerRX;
	PAM.ServerTX;

async function bluetoothConnect(){
	PAM.Main = await navigator.bluetooth.requestDevice(bleOptions);
	PAM.Device = await PAM.Main.gatt.connect();
	PAM.Service = await PAM.Device.getPrimaryService("49535343-fe7d-4ae5-8fa9-9fafd205e455");
	PAM.ServerRX = await PAM.Service.getCharacteristic(RXCharacteristic);
	PAM.ServerTX = await PAM.Service.getCharacteristic(TXCharacteristic);
	PAM.ServerTX.startNotifications().then(_ => {
		PAM.ServerTX.addEventListener('characteristicvaluechanged',
		handleNotifications);
	});
	var enc = new TextEncoder();
	PAM.ServerRX.writeValue(enc.encode("Test"));
//	var send = new ArrayBuffer(8);
//	send = "H";
//	PAMServerRX.writeValue(send);
	console.log(PAM.Main);
	console.log(PAM.ServerRX);
	console.log(PAM.ServerTX);
	IDCount.forEach((element) => {
//		console.log(element);
		document.getElementById("buttonHolder").innerHTML +=`
		<button type="button" class="btn text-left pr-0" onclick="cardCreation('${element}')">
			${IDName[element]}
		</button>`});
//	editChart();
}

function handleNotifications(event){
	let value = event.target.value.buffer;
	var enc = new TextDecoder("utf-8");
	console.log(enc.decode(value));
}

function cardCreation(cardType){
	if(cardTypeArray.indexOf(IDType[cardType]) == -1){
		cardTypeArray.push(IDType[cardType]);
		cardHTML(cardType);
	}
}

function epochConvert(dayTime){
	var Hours = Math.floor(dayTime/3600);
	var Minutes = Math.floor((dayTime-Hours*3600)/60);
	var Seconds = dayTime-Hours*3600-Minutes*60;
	return [Hours,Minutes,Seconds];
}

function cardHTML(cardType){
	var randData = [];
	for(i=0; i<5; i++)randData.push(Math.random());
	// Create the data table.
	var data = new google.visualization.DataTable();
	data.addColumn('timeofday', 'Time');
	data.addColumn('number', IDName[cardType]);
	data.addRows([
	[epochConvert(10000), randData[0]],
	[epochConvert(25000), randData[1]],
	[epochConvert(40204), randData[2]],
	[epochConvert(60660), randData[3]],
	[epochConvert(80000), randData[4]]
	]);

	document.getElementById("cardContainer").innerHTML += `
	<div class="card mb-3" id="${IDType[cardType]}" style="display:none">
		<div class="card-header">
			${IDName[cardType]}
			<button type="button" class="close py-0" aria-label="Close" onclick="closeCard(this)">
				<span aria-hidden="true"><i class="material-icons">close</i></span>
			</button>
		</div>
		<div class="card-body px-0" id="${IDType[cardType]} body">

		</div>
	</div>`;
	$("#"+IDType[cardType]).fadeIn(300,"swing",function(){
		if(cardType != 252)drawChart(IDType[cardType], data, cardType);
		else formCreate(cardType);
	});
}

function formCreate(cardType){
	document.getElementById(IDType[cardType]).innerHTML+=`
	<form id="InputForm" class="mx-2 mb-5">
		<div class="form-group">
			<label for="datatInput"> Data Input </label>
			<textarea class="form-control" id="dataInput" placeholder="Enter Event"></textarea>
		</div>
		<button type="button" class="btn btn-primary" onClick="formSubmit()">Submit</button>
	</form>
	`;
}

function formSubmit(){
	console.log($("#dataInput").val());
	var enc = new TextEncoder();
	PAM.ServerRX.writeValue(enc.encode($("#dataInput").val()));
	$("#dataInput").val('');
}

function closeCard(element){
	elemId = element.parentNode.parentNode.id
	cardTypeArray.splice(cardTypeArray.indexOf(elemId),1);
	$("#"+elemId).fadeOut(300,"swing",function(){
		document.getElementById(elemId).remove();
	});
}

function drawChartA(){
	// Create the data table.
	var data = new google.visualization.DataTable();
	data.addColumn('timeofday', 'Time');
	data.addColumn('number', 'Test');
	data.addRows([
	[[1,0,0], 3],
	[[4,0,0], 1],
	[[12,0,0], 1],
	[[15,0,0], 1],
	[[23,0,0], 2]
	]);
	drawChart("Test", data);
}

function drawChart(elem, data, idNum) {
	var elemId = elem + " body";
	var elemWidth = document.getElementById(elemId).offsetWidth;

	// Set chart options
	var chartOptions = {	legend: {position: 'none'},
					chartArea: {left: 50, right: 20, top: 10, bottom: 30},
					hAxis: {title: data.getColumnLabel(0), baseline: 0, viewWindow: {min: [0,0,0], max: [24,0,0]}},
					vAxis: {title: data.getColumnLabel(1)},
//					curveType: 'function',
//					explorer: {axis: 'horizontal', keepInBounds: true},
					'width': elemWidth,
					'height': 2*elemWidth/3};
	var graphType = idNum >= 253 ? 'ColumnChart':'LineChart';
	var wrapper = new google.visualization.ChartWrapper({
		chartType: graphType,
		dataTable: data,
		options: chartOptions,
		containerId: 'visualisation'
	});
	if (idNum >=253) wrapper.setOption('bar.groupWidth',5);

	graphArray.push(wrapper);
	wrapper.draw(document.getElementById(elemId));
}