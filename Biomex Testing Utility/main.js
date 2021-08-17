var ble = {
	devName: "HMSoft",
	sendRecService: "0000ffe0-0000-1000-8000-00805f9b34fb",
	sendRecCharacteristic: "0000ffe1-0000-1000-8000-00805f9b34fb",
	msgRec: ""
}

var bleConnectedDevice = {
	device: null,
	service: null,
	characteristic: null
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


function pageLoad(){
	console.log("Starting version: 0.2.3");
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
	input += '\r\n';	//not required
	document.getElementById("ble_input").value = '';
	var encoder = new TextEncoder();
	var message = encoder.encode(input);
	for (i = 0; i < message.byteLength; i+=20)await bleConnectedDevice.characteristic.writeValue(message.slice(i,i+20));
}

async function bleSendMessage(input){
	input += '\r\n';	//not required
	var encoder = new TextEncoder();
	var message = encoder.encode(input);
	for (i = 0; i < message.byteLength; i+=20)await bleConnectedDevice.characteristic.writeValue(message.slice(i,i+20));
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
	var buffer = bleConnectedDevice.characteristic.value.buffer;
	var encoder = new TextDecoder('utf-8');
	var message = encoder.decode(buffer);
	ble.msgRec += message;
	if (ble.msgRec.charAt(ble.msgRec.length-1) == '\n'){
		console.log(ble.msgRec);
		document.getElementById("ble_output").innerHTML+=ble.msgRec;
		if(ble.msgRec == "BLE Test Message!!\r\n")bleSendMessage("Received");
		if(ble.msgRec == "App Writing Test\r\n")bleSendMessage("App Msg Received");
		ble.msgRec = "";
	}
}

async function bleConnect(){
	document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleConnect()">Connecting</button>`
	//bleConnectedDevice.device = await bleConnect();
	try{
		var device = await bleDeviceGet();
		bleConnectedDevice.device = await device.gatt.connect();
		if (bleConnectedDevice.device != null)document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleDisconnect()">Disconnect</button>`
		bleConnectedDevice.service = await bleConnectedDevice.device.getPrimaryService(ble.sendRecService);
		bleConnectedDevice.characteristic = await bleConnectedDevice.service.getCharacteristic(ble.sendRecCharacteristic);
		await bleConnectedDevice.characteristic.startNotifications();
		bleConnectedDevice.characteristic.addEventListener('characteristicvaluechanged', onReceive);
		document.getElementById("ble_connected_device").innerHTML = device.name;
	}catch{
		document.getElementById("ble_connect_button").innerHTML = `<button class="button" onclick="bleConnect()">Connect</button>`
	}
}

async function bleDeviceGet(){
	console.log('Requesting Bluetooth Device');
	device = await navigator.bluetooth.requestDevice({
		filters:[{name: ble.devName}],
		optionalServices:[ble.sendRecService]
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