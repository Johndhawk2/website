/*var ble = {
	devName: "HMSoft",
	sendRecService: "0000ffe0-0000-1000-8000-00805f9b34fb",
	sendRecCharacteristic: "0000ffe1-0000-1000-8000-00805f9b34fb",
	msgRec: ""
}*/

var ble = {
	//devName: "Test 0.0.3",
	sendRecService: "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Values to transparent uart communication
	TXCharacteristic: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
	RXCharacteristic: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
	msgRec: ""
}

var bleConnectedDevice = {
	raw: null,
	device: null,
	service: null,
	TXcharacteristic: null,
	RXcharacteristic: null
}

var serial = {
	msgRec: ""
}

var serialConnectedDevice = {
	device: null,
	write: null,
	reader: null,
	readFlag: true,
	closed: null
}

var maxPackageLength = 244;

function pageLoad(){
	console.log("Starting version: 0.3.5");
	document.getElementById("ble_input").addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			document.getElementById("ble_send").click();
		}
	});
	document.getElementById("serial_input").addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			document.getElementById("serial_send").click();
		}
	});
}


async function bleSend(){
	var input = document.getElementById("ble_input").value;
	input += '\n';
	document.getElementById("ble_input").value = '';
	var encoder = new TextEncoder();
	var message = encoder.encode(input);
	for (i = 0; i < message.byteLength; i+=maxPackageLength)await bleConnectedDevice.RXcharacteristic.writeValue(message.slice(i,i+maxPackageLength));
}

async function bleSendMessage(input){
	console.log("Sending: " + input)
	input += '\n';
	var encoder = new TextEncoder();
	var message = encoder.encode(input);
	for (i = 0; i < message.byteLength; i+=maxPackageLength)await bleConnectedDevice.RXcharacteristic.writeValue(message.slice(i,i+maxPackageLength));
}

async function bleDisconnect(){
	console.log("Disconnecting");
	if(bleConnectedDevice.device != null){
		await bleConnectedDevice.device.disconnect();
		console.log("Disconnected");
		document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleConnect()">Connect</button>`
		document.getElementById("ble_connected_device").innerHTML = "No device connected";
	}
}

function onReceive(){
	var buffer = bleConnectedDevice.TXcharacteristic.value.buffer;
	var encoder = new TextDecoder('utf-8');
	var message = encoder.decode(buffer);
	ble.msgRec += message;
	console.log(ble.msgRec);
	if (ble.msgRec.charAt(ble.msgRec.length-1) == '\n'){
		console.log(ble.msgRec);
		document.getElementById("ble_output").innerHTML+=ble.msgRec;
		if(ble.msgRec == "BLE Test Message!!\r\n"){
			console.log("'BLE Test Message!!' Received");
			bleSendMessage("Received");
		}
		if(ble.msgRec == "App Writing Test\r\n"){
			console.log("'App Writing Test' Received");
			bleSendMessage("App Msg Received");
		}
		ble.msgRec = "";
	}
}

function onDisconnected(event) {
	// Object event.target is Bluetooth Device getting disconnected.
	console.log('Bluetooth Device disconnected');
	document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleConnect()">Connect</button>`
	document.getElementById("ble_connected_device").innerHTML = "No device connected";
}
  
async function bleConnect(){
	document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleConnect()">Connecting</button>`
	//bleConnectedDevice.device = await bleConnect();
	try{
		bleConnectedDevice.raw = await bleDeviceGet();
		bleConnectedDevice.device = await bleConnectedDevice.raw.gatt.connect();
		if (bleConnectedDevice.device != null)document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleDisconnect()">Disconnect</button>`;
		bleConnectedDevice.service = await bleConnectedDevice.device.getPrimaryService(ble.sendRecService);
		bleConnectedDevice.RXcharacteristic = await bleConnectedDevice.service.getCharacteristic(ble.RXCharacteristic);
		bleConnectedDevice.TXcharacteristic = await bleConnectedDevice.service.getCharacteristic(ble.TXCharacteristic);
		await bleConnectedDevice.TXcharacteristic.startNotifications();
		bleConnectedDevice.TXcharacteristic.addEventListener('characteristicvaluechanged', onReceive);
		document.getElementById("ble_connected_device").innerHTML = device.name;
		bleConnectedDevice.raw.addEventListener('gattserverdisconnected', onDisconnected);
	}catch{
		document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleConnect()">Connect</button>`
	}
}

async function bleDeviceGet(){
	console.log('Requesting Bluetooth Device');
	device = await navigator.bluetooth.requestDevice({
		filters:[{services: [ble.sendRecService]}],//name: ble.devName}],
		//optionalServices:[ble.sendRecService]
	});
	return device;
}


async function serialDisconnect(){
	console.log("disconnecting");
	document.getElementById("serial_connect_button").innerHTML = `<button class="button" id="serial_connect" onclick="serialDisconnect()">Disconnecting</button>`
	serialConnectedDevice.readFlag = false;
	serialConnectedDevice.reader.cancel();
	await serialConnectedDevice.closed;
	console.log("disconnected");
	document.getElementById("serial_connect_button").innerHTML = `<button class="button" id="serial_connect" onclick="serialConnect()">Connect</button>`
	document.getElementById("serial_connected_device").innerHTML = "No device connected";
}

async function serialConnect(){
	console.log("connecting");
	document.getElementById("serial_connect_button").innerHTML = `<button class="button" id="serial_connect" onclick="serialConnect()">Connecting</button>`
	try{
		serialConnectedDevice.device = await await navigator.serial.requestPort();
		console.log(serialConnectedDevice.device);
		var bRateVal = document.getElementById("baudRate");
		var bRate = parseInt(bRateVal.options[bRateVal.selectedIndex].value);
		console.log(bRate);
		await serialConnectedDevice.device.open({baudRate: bRate});
		serialConnectedDevice.closed = serialRead();
		document.getElementById("serial_connect_button").innerHTML = `<button class="button" id="serial_connect" onclick="serialDisconnect()">Disconnect</button>`
		document.getElementById("serial_connected_device").innerHTML = "Device connected";
	}catch{
		document.getElementById("serial_connect_button").innerHTML = `<button class="button" id="serial_connect" onclick="serialConnect()">Connect</button>`
	}
}

async function serialRead(){
	while(serialConnectedDevice.readFlag && serialConnectedDevice.device.readable){
		serialConnectedDevice.reader = serialConnectedDevice.device.readable.getReader();
		decoder = new TextDecoder('utf-8');
		try{
			while(true){
				const {value, done} = await serialConnectedDevice.reader.read();
				if(done){
					break;
				}
				var message = decoder.decode(value);
				serial.msgRec += message;
				if (serial.msgRec.charAt(serial.msgRec.length-1) == '\n'){
					console.log(serial.msgRec);
					document.getElementById("serial_output").innerHTML+=serial.msgRec;
					serial.msgRec = "";
				}
			}
		}catch (error){
			console.log(error);
		}finally{
			serialConnectedDevice.reader.releaseLock();
		}
	}
	await serialConnectedDevice.device.close();
}

async function serialWrite(){
	serialConnectedDevice.write = serialConnectedDevice.device.writable.getWriter();
	var input = document.getElementById("serial_input").value;
	input += '\r\n'	//not required
	document.getElementById("serial_input").value = '';
	var encoder = new TextEncoder();
	await serialConnectedDevice.write.write(encoder.encode(input));
	serialConnectedDevice.write.releaseLock();
}

function csvRead(){
	const fileIn = document.getElementById("select_csv");
	if(fileIn.files.length > 0){
		var reader = new FileReader();
		reader.onload = function () {
		  csvCallback(reader.result);
		}
		reader.readAsBinaryString(fileIn.files[0]);
	}
}

function csvCallback(fileData){
	var cleanFileData = fileData.replace(/\r/g,'').replace(/ /g,'').split('\n');
	var separatedFileData = new Array;
	for(i = 0; i<cleanFileData.length; i++){
		separatedFileData[i] = cleanFileData[i].split(",");
	}
	var csvOutput = separatedFileData[0].map((_, colIndex) => separatedFileData.map(row => row[colIndex]));
	console.log(csvOutput);
}
