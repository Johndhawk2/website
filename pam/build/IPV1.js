google.charts.load('current', {'packages':['corechart','line']}); // Load google charts

var IDType = [256];
var IDName = [256];
var IDCount = [];
var IDCountFlag = 0;
var cardTypeArray = [];
var graphArray = [];

var tempTest = [];

var TransparentService = "49535343-fe7d-4ae5-8fa9-9fafd205e455";	// Values to transparent uart communication
var TXCharacteristic = "49535343-1e4d-4bd9-ba61-23c647249616";
var RXCharacteristic = "49535343-8841-43f4-a8d4-ecbe34729bb3";

var bleOptions = {													// Options for BLE devices
	filters: [{name: " P.A.M"}],
	optionalServices: [TransparentService]
	};

var dataArray = [];
var dataArraySorted = [];

IDType[0] = "Time";													//Setup known data sources
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

var PAM = new Object()												// BLE Device
	PAM.Main;
	PAM.Device;
	PAM.Service;
	PAM.ServerRX;
	PAM.ServerTX;

function sleep(ms) {												// Sleep for ms
	return new Promise(resolve => setTimeout(resolve, ms));
}

function dataSort(){												// Sort received data
	var cardTypesData = [];
//	console.log(dataArray);
	for(var i=0; i<dataArray.length; i++){
		for(var j=0; j<dataArray[i].length; j+=2){
			if(cardTypesData.indexOf(dataArray[i][j]) == -1 && dataArray[i][j] < 256)cardTypesData.push(dataArray[i][j]);	//Find what data has been sent
		}
	}
	cardTypeArray = cardTypesData.sort();							// Sort the card types into the correct order 
	for(var i=1; i<cardTypeArray.length; i++){						// Add the card types to the dropdown menu
		document.getElementById("buttonHolder").innerHTML +=`
		<button type="button" class="btn text-left pr-0" onclick="cardCreation('${cardTypeArray[i]}')">
			${IDName[cardTypeArray[i]]}
		</button>`
	}
	dataArraySorted[0] = cardTypeArray;								// Add sorted cards to sorted data
	var k = 0;
	var maxErr = 5;													// Define maximum tries before ignoring incorect data
	var errLim = 0;
	for(var i=0; i<dataArray.length; i++){
		var tempArr = new Array(dataArraySorted[0].length).fill(0);
		var done = [];
//		console.log("Test: " + dataArray[i][1] + ", Comp: " + dataArraySorted[k][0]);
		if((dataArray[i][1] > dataArraySorted[k][0] || i==0 || errLim > maxErr) && dataArray[i][1] <= 86400){ // Check if the data is valid and hasn't been recorded yet
			for(var j=0; j<dataArraySorted[0].length; j++){
				var location = dataArraySorted[0].indexOf(dataArray[i][2*j]); // Store data in correct column dependant on type
				if(location != -1 && done.indexOf(dataArraySorted[0][location]) == -1){
					if(dataArraySorted[0][location] != 1 || i == 0)tempArr[location] = dataArray[i][2*j+1];
					else tempArr[location] = dataArray[i][2*j+1] + dataArraySorted[k][j];
					done.push(dataArraySorted[0][location]);
				}
			}
			dataArraySorted.push(tempArr); 							// Add row of sorted data
			k++
			errLim=0;
		}
		else{														// If there's an error, 
			console.log("Error Caught");
			errLim++;
		}
	}
	dataArraySorted.sort(sortFunction);
	console.log(dataArraySorted);
}

function sortFunction(a, b) {										// Sort data from lowest to highest
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

async function bluetoothConnect(){									// Connect to bluetooth device
	$("#overlay").css("background-color","rgba(0,0,0,0.5)");		// Setup loading ring
	$("#text").css("left","calc(50% - 45px)");
	document.getElementById("text").innerHTML="Connecting";
	$("#overlay").css("display","block");
	try{
		PAM.Main = await navigator.bluetooth.requestDevice(bleOptions); // Ask to connect to BLE device
		PAM.Device = await PAM.Main.gatt.connect();					// Connect to selected device
		PAM.Service = await PAM.Device.getPrimaryService("49535343-fe7d-4ae5-8fa9-9fafd205e455");
		PAM.ServerRX = await PAM.Service.getCharacteristic(RXCharacteristic);	// Connect to send data to the device
		PAM.ServerTX = await PAM.Service.getCharacteristic(TXCharacteristic);	// Connect to receive data from the device
		PAM.ServerTX.startNotifications().then(_ => {				// Setup function to act when new data is received
			PAM.ServerTX.addEventListener('characteristicvaluechanged',	handleNotifications);
		});
		PAM.Main.addEventListener('gattserverdisconnected',bluetoothDisconnect); // Setup function when BLE device disconnects
		var enc = new TextEncoder();
		await PAM.ServerRX.writeValue(enc.encode("connecting" + '\n' + '\n')); // Send connecting to device to ensure connection functions
		$("#text").css("left","calc(50% - 60px)");					// Update loading ring
		document.getElementById("text").innerHTML="Requesting Data";
		document.getElementById("connection").innerHTML = `
			<button type="button" class="btn text-left pr-0" onclick="bluetoothDisconnect()">
				Disonnect Bluetooth
			</button>`;												// Add disconnect button
	}
	catch(err){
		$("#overlay").css("background-color","rgba(255,0,0,0.5)");	// Show failed to connect screen
		$("#text").css("left","calc(50% - 65px)");
		document.getElementById("text").innerHTML="Failed to Connect";
		await sleep(200);
		$("#overlay").css("display","none");
		console.log(err);
	}
	await PAM.ServerRX.writeValue(enc.encode("datReq" + '\n'));		// Request data from device
}

async function bluetoothDisconnect(){								// Handles BLE disconnections
	await PAM.Main.gatt.disconnect();								// Disconnect if not already disconnected
	dataArray = [];													// Reset stored values
	dataArraySorted = [];
	IDCount = [];
	IDCountFlag = 0;
	cardTypeArray = [];
	graphArray = [];
	tempTest = [];
	document.getElementById("cardContainer").innerHTML = `	
		<div class="card mb-3" id="Welcome">
			<div class="card-header">
				Welcome
				<button type="button" class="close py-0" aria-label="Close" onclick="closeCard(this)">
					<span aria-hidden="true"><i class="material-icons">close</i></span>
				</button>
			</div>
			<div class="card-body px-4" id="Welcome body">
				<p class="lead">Welcome to your P.A.M device.<br></p>
				<p>To begin, click on the dropdown menu in the top left and select <mark>Connect Bluetooth</mark>.</p>
				<p>Ensure both bluetooth and location are enabled, and select your P.A.M device from the menu.</p>
				<p>Please be patient while your P.A.M device transfers your daily data to this application.</p>
				<p>Once the loading wheel has disappeared, you will be able to view any recorded data by selecting it in the dropdown menu.</p>
				<p>If for some reason the connection fails, please try again, or refresh the application.</p>
				<p>If you have any further questions or issues, contact us <a href="//github.johnhawk.tech">here</a>.</p>
			</div>
		</div>`;													// Reset UI
	document.getElementById("buttonHolder").innerHTML = '';
	document.getElementById("connection").innerHTML = `
		<button type="button" class="btn text-left pr-0" onclick="bluetoothConnect()">
			Connect Bluetooth
		</button>`;
	console.log("Bluetooth device disconnected");
}

function handleNotifications(event){								// Called when new data is received
	let value = event.target.value.buffer;							// Store received data
//	console.log(value);
	var testVal = new Uint8Array(value);							// Convert from bufferArray, to Uint8Array
	switch(testVal[0]){
		case 100:													// Receiving new data
			$("#overlay").css("background-color","rgba(0,0,0,0.5)");// Update loading screen
			$("#text").css("left","calc(50% - 55px)");
			document.getElementById("text").innerHTML="Receiving Data";
//			console.log(testVal[1]);
			$("#overlay").css("display","block");
			var datNum = (testVal.length-1)/8;						// Length of arary
			var testData = [];
			for(var i=0; i<datNum*2; i++){							// Convert 8 bit segments of the data back to 32 bit 
				var recData = (testVal[4*i+1]<<24) + (testVal[4*i+2]<<16) + (testVal[4*i+3]<<8) + (testVal[4*i+4]);
				testData.push(recData);								// Add 32 bit integer to array
			}
			document.getElementById("textNum").innerHTML=`${testData[1]}`;
			if(testData.length%2==0 && testData.length>2)dataArray.push(testData);
			else console.log("Not Valid Data");						// Check if data is valid
			break;
		case 200:													// If end of data
			$("#text").css("left","calc(50% - 60px)");				// Update loading screen
			document.getElementById("text").innerHTML="Processing Data";
			dataSort();												// Sort the received data
			$("#overlay").css("display","none");					// Close the loading screen
			break;
		default:
			break;
	}
}

function cardCreation(cardType){									// Create cards to display data
	if(cardTypeArray.indexOf(IDType[cardType]) == -1){				// Check if the card already exists
		cardTypeArray.push(IDType[cardType]);						// Add card type to array of active cards
		cardHTML(cardType);											// Create card
	}
}

function epochConvert(dayTime){										// Convert epoch time to required format
	var Hours = Math.floor(dayTime/3600);
	var Minutes = Math.floor((dayTime-Hours*3600)/60);
	var Seconds = dayTime-Hours*3600-Minutes*60;
	return [Hours,Minutes,Seconds];
}

function cardHTML(cardType){										// Insert HTML for new cards
	var data = new google.visualization.DataTable();				// Prepare data for google charts
	data.addColumn('timeofday', 'Time');							// Add Time column
	data.addColumn('number', IDName[cardType]);						// Add Data column
	for(var i=1; i<dataArraySorted.length; i++)data.addRows([[epochConvert(dataArraySorted[i][0]), dataArraySorted[i][dataArraySorted[0].indexOf(parseInt(cardType))]]]); // Add data to the data table
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
	</div>`;														// Add HTML for card
	$("#"+IDType[cardType]).fadeIn(300,"swing",function(){			// Add animation for card
		if(cardType != 252)drawChart(IDType[cardType], data, cardType); // Create graph on card
		else formCreate(cardType);
	});
}

function formCreate(cardType){										// Form for user entry (Unused)
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

function formSubmit(){												// Form for user entry (Unused)
	console.log($("#dataInput").val());
	var enc = new TextEncoder();
	var test = enc.encode($("#dataInput").val() + '\n');
	PAM.ServerRX.writeValue(test);
	$("#dataInput").val('');
}

function closeCard(element){										// Close cards
	elemId = element.parentNode.parentNode.id						// Get id of host element for the close button
	cardTypeArray.splice(cardTypeArray.indexOf(elemId),1);			// Remove card type from list of card types
	$("#"+elemId).fadeOut(300,"swing",function(){					// Add animation
		document.getElementById(elemId).remove();					// Remove id
	});
}

function drawChart(elem, data, idNum) {								// Draw charts
	var elemId = elem + " body";									// Get the name of the element body
	var elemWidth = document.getElementById(elemId).offsetWidth;	// Get width of the element
	var chartOptions = {	legend: {position: 'none'},				// Set chart options
					chartArea: {left: 50, right: 20, top: 10, bottom: 30},
					hAxis: {title: data.getColumnLabel(0)},
					vAxis: {title: data.getColumnLabel(1)},
					'width': elemWidth,
					'height': 2*elemWidth/3};
	var graphType = idNum >= 253 ? 'ColumnChart':'LineChart';		// Set type to bar chart for some types, and line graphs for others
	var wrapper = new google.visualization.ChartWrapper({			// Set up graphs
		chartType: graphType,
		dataTable: data,
		options: chartOptions,
		containerId: 'visualisation'
	});
	if (idNum >=253) wrapper.setOption('bar.groupWidth',5);			// Make the bar charts look nicer 

	graphArray.push(wrapper);										// Add the graph to global graph array
	wrapper.draw(document.getElementById(elemId));					// Draw graph
}