google.charts.load('current', {'packages':['corechart','line']});
// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChartA);

var IDType = [256];
var IDName = [256];
var IDCount = [];
var IDCountFlag = 0;
var cardTypeArray = [];
var graphArray = [];

var tempTest = [];

var TransparentService = "49535343-fe7d-4ae5-8fa9-9fafd205e455";
var TXCharacteristic = "49535343-1e4d-4bd9-ba61-23c647249616";
var RXCharacteristic = "49535343-8841-43f4-a8d4-ecbe34729bb3";

var bleOptions = {
	filters: [{name: " P.A.M"}],
	optionalServices: [TransparentService]
	};

var dataArray = [];
var dataArraySorted = [];

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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function dataSort(){
	var cardTypesData = [];
	for(var i=0; i<dataArray.length; i++){
		for(var j=0; j<dataArray[i].length; j+=2){
			if(cardTypesData.indexOf(dataArray[i][j]) == -1 && dataArray[i][j] < 256)cardTypesData.push(dataArray[i][j]);
		}
	}
	cardTypeArray = cardTypesData.sort();
	for(var i=1; i<cardTypeArray.length; i++){
		document.getElementById("buttonHolder").innerHTML +=`
		<button type="button" class="btn text-left pr-0" onclick="cardCreation('${cardTypeArray[i]}')">
			${IDName[cardTypeArray[i]]}
		</button>`
	}
	dataArraySorted[0] = cardTypeArray;
	console.log(cardTypeArray);
	for(var i=0; i<dataArray.length; i++){
		var tempArr = new Array(dataArraySorted[0].length).fill(0);
		var done = [];
		for(var j=0; j<dataArraySorted[0].length; j++){
			var location = dataArraySorted[0].indexOf(dataArray[i][2*j]);
			if(location != -1 && done.indexOf(dataArraySorted[0][location]) == -1){
				if(dataArraySorted[0][location] != 1 || i == 0)tempArr[location] = dataArray[i][2*j+1];
				else tempArr[location] = dataArray[i][2*j+1] + dataArraySorted[i][j];
				done.push(dataArraySorted[0][location]);
			}
		}
		dataArraySorted.push(tempArr);
	}
	console.log(dataArraySorted);
}

async function bluetoothConnect(){
	$("#overlay").css("background-color","rgba(0,0,0,0.5)");
	$("#text").css("left","calc(50% - 45px)");
	document.getElementById("text").innerHTML="Connecting";
	$("#overlay").css("display","block");
	try{
		PAM.Main = await navigator.bluetooth.requestDevice(bleOptions);
		PAM.Device = await PAM.Main.gatt.connect();
		PAM.Service = await PAM.Device.getPrimaryService("49535343-fe7d-4ae5-8fa9-9fafd205e455");
		PAM.ServerRX = await PAM.Service.getCharacteristic(RXCharacteristic);
		PAM.ServerTX = await PAM.Service.getCharacteristic(TXCharacteristic);
		PAM.ServerTX.startNotifications().then(_ => {
			PAM.ServerTX.addEventListener('characteristicvaluechanged',	handleNotifications);
		});
		PAM.Main.addEventListener('gattserverdisconnected',bluetoothDisconnect);
		var enc = new TextEncoder();
		await PAM.ServerRX.writeValue(enc.encode("connecting" + '\n'));
		$("#text").css("left","calc(50% - 60px)");
		document.getElementById("text").innerHTML="Requesting Data";
		document.getElementById("connection").innerHTML = `
			<button type="button" class="btn text-left pr-0" onclick="bluetoothDisconnect()">
				Disonnect Bluetooth
			</button>`;
	}
	catch(err){
		$("#overlay").css("background-color","rgba(255,0,0,0.5)");
		$("#text").css("left","calc(50% - 65px)");
		document.getElementById("text").innerHTML="Failed to Connect";
		await sleep(200);
		$("#overlay").css("display","none");
		console.log(err);
	}
	await PAM.ServerRX.writeValue(enc.encode("datReq" + '\n'));
}

async function bluetoothDisconnect(){
	await PAM.Main.gatt.disconnect();
	dataArray = [];
	dataArraySorted = [];
	IDCount = [];
	IDCountFlag = 0;
	cardTypeArray = [];
	graphArray = [];
	tempTest = [];
	document.getElementById("cardContainer").innerHTML = `
		<div class="card mb-3" id="Test">
			<div class="card-header">
				Test
				<button type="button" class="close py-0" aria-label="Close" onclick="closeCard(this)">
					<span aria-hidden="true"><i class="material-icons">close</i></span>
				</button>
			</div>
			<div class="card-body px-0" id="Test body">

			</div>
		</div>`;
		drawChartA();
	document.getElementById("buttonHolder").innerHTML = '';
	document.getElementById("connection").innerHTML = `
		<button type="button" class="btn text-left pr-0" onclick="bluetoothConnect()">
			Connect Bluetooth
		</button>`;
	console.log("Bluetooth device disconnected");
}

function handleNotifications(event){
	let value = event.target.value.buffer;
//	console.log(value);
	var testVal = new Uint8Array(value);
	switch(testVal[0]){
		case 100:											////Receiving Data////
			$("#overlay").css("background-color","rgba(0,0,0,0.5)");
			$("#text").css("left","calc(50% - 55px)");
			document.getElementById("text").innerHTML="Receiving Data";
			$("#overlay").css("display","block");
			var datNum = (testVal.length-1)/8;
			var testData = [];
			for(var i=0; i<datNum*2; i++){
				var recData = (testVal[4*i+1]<<24) + (testVal[4*i+2]<<16) + (testVal[4*i+3]<<8) + (testVal[4*i+4]);
				testData.push(recData);
			}
			dataArray.push(testData);
			break;
		case 200:										////End of Data////
			$("#text").css("left","calc(50% - 60px)");
			document.getElementById("text").innerHTML="Processing Data";
			dataSort();
			$("#overlay").css("display","none");
			break;
		default:
			break;
	}
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
	var data = new google.visualization.DataTable();
	data.addColumn('timeofday', 'Time');
	data.addColumn('number', IDName[cardType]);
	for(var i=1; i<dataArraySorted.length; i++)data.addRows([[epochConvert(dataArraySorted[i][0]), dataArraySorted[i][dataArraySorted[0].indexOf(parseInt(cardType))]]]);
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
	var test = enc.encode($("#dataInput").val() + '\n');
	PAM.ServerRX.writeValue(test);
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