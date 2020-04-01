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
	for(var i=0; i<dataArray.length; i++){
		var tempArr = [];
		for(var j=0; j<dataArraySorted[0].length; j++){
			tempArr.push(0);
			if(dataArraySorted[0].indexOf(dataArray[i][2*j]) != -1)tempArr[j] = dataArray[i][2*dataArraySorted[0].indexOf(dataArray[i][2*j])+1];
		}
		dataArraySorted.push(tempArr);
	}
	console.log(dataArraySorted);
}

async function bluetoothConnect(){
	$("#overlay").css("background-color","rgba(0,0,0,0.5)");
	$("#overlay").css("display","block");
	try{
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
		await PAM.ServerRX.writeValue(enc.encode("connecting" + '\n'));
		await PAM.ServerRX.writeValue(enc.encode("cardReq" + '\n'));
//		console.log(PAM.Main);
//		console.log(PAM.ServerRX);
//		console.log(PAM.ServerTX);
		while(IDCountFlag == 0){
			await sleep(200);
			await PAM.ServerRX.writeValue(enc.encode("cardReq" + '\n'));
		}
	}
	catch(err){
		$("#overlay").css("background-color","rgba(255,0,0,0.5)");
		await sleep(200);
		$("#overlay").css("display","none");
		console.log(err);
	}
	await PAM.ServerRX.writeValue(enc.encode("datReq" + '\n'));
}

function handleNotifications(event){
	let value = event.target.value.buffer;
	if(IDCountFlag == 0){
		var testVal = new Uint8Array(value);
		testVal.forEach((element) => {
			IDCount.push(element);
		});
		IDCount.forEach((element) => {
			document.getElementById("buttonHolder").innerHTML +=`
			<button type="button" class="btn text-left pr-0" onclick="cardCreation('${element}')">
				${IDName[element]}
			</button>`});
//		$("#overlay").css("display","none");
		IDCountFlag = 1;
		var temp = []
		temp.push(0);
		IDCount.forEach(element => {
			temp.push(element);
		});
		dataArraySorted[0]=temp;
		console.log(testVal);
		console.log(IDCount);
	}
	if(IDCountFlag == 1){
		var enc = new TextDecoder("utf-8");
		//console.log(enc.decode(value));
		var testVal = new Uint8Array(value);
//		console.log(testVal);
		switch(testVal[0]){
			case 100:											////Receiving Data////
				$("#overlay").css("background-color","rgba(0,0,0,0.5)");
				$("#overlay").css("display","block");
				var datNum = testVal[1];
	//			dataArray.push(new  google.visualization.DataTable());
	//			dataArray[0].addColumn('timeofday','Time');
	//			dataArray[0].addColumn('number',IDName[1]);
				var testData = [];
				for(var i=0; i<36; i++){
					var recData = (testVal[4*i+2]<<24) + (testVal[4*i+3]<<16) + (testVal[4*i+4]<<8) + (testVal[4*i+5]);
	//				console.log(testVal[4*i+2] + "," + testVal[4*i+3] + "," + testVal[4*i+4] + "," + testVal[4*i+5]);
					testData.push(recData);
	//				console.log(testData[i]);
				}
	//			console.log(Math.floor(153/(datNum*8)));
				for(var i=0; i<Math.floor(153/(datNum*8)); i++){
					var out = "";
					var testArr = [];
					for(var j=0; j<datNum*2; j++){
						testArr.push(testData[i*datNum*2+j]);
						out += testData[i*datNum*2+j];
						out += ",";
					}
					if(isNaN(testData[i*datNum]) == 0){
						dataArray.push(testArr);
					}
				}
				break;
			case 200:										////End of Data////
				console.log(dataArray);
				dataSort();
				$("#overlay").css("display","none");
				break;
			default:
				break;
		}
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