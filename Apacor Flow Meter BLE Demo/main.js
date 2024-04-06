var ble = {
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

var sensorData = [-1, -1, -1, -1, -1];
var batteryData = -1;
var sensorModule = -1;
var flowDivisor = 100;			// L40 100, L240 10
var tempSubtractor = 0;			// L40 0, L240 50

function pageLoad(){
	console.log("Starting version: 0.1.0");
}


async function bleSend(command, value){
	// var input = document.getElementById("ble_input").value;
	// input += '\n';
	// document.getElementById("ble_input").value = '';
	// var encoder = new TextEncoder();
	// var message = encoder.encode(input);
	// for (i = 0; i < message.byteLength; i+=maxPackageLength)await bleConnectedDevice.RXcharacteristic.writeValue(message.slice(i,i+maxPackageLength));
	var testA = [0xAA, 0x55, command, value];
	var arrChecksum = checksumCalc(new Uint8Array(testA));
	testA.push(arrChecksum);
	var test = new Uint8Array(testA);

	console.log(`Sending: ${testA}`)

	await bleConnectedDevice.RXcharacteristic.writeValue(test);
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
	var buffer = new Uint8Array(bleConnectedDevice.TXcharacteristic.value.buffer);
	var length = buffer.byteLength;

	var errVal = 0;		// 0 = OK, 1 = Incorrect checksum, 2 = Invalid start bytes, ...

	if(checksumCalc(buffer) != 0){ errVal = 1; }
	else if((buffer[0] != 0xAA) || (buffer[1] != 0x55)){ errVal = 2; }

	switch(errVal){
		case 0:
			valArray = parseMessage(buffer);
			break;
		case 1:
			console.error("Invalid checksum");
			break;
		case 2:
			console.error("Invalid start bytes");
			break;
		default:
			console.error("Unknown error");
			break;
	}
	updateValues();
	console.log(sensorData);
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
		filters:[{services: [ble.sendRecService]}],
	});
	return device;
}

function checksumCalc(buffer){
	var checksum = 0;
	for(i = 0; i < buffer.byteLength; i++)
	{
		checksum ^= buffer[i];
	}
	return checksum;
}

function parseMessage(message)
{
	const flow 	= [0, 2];
	const oxygen= [1, 2];
	const temp 	= [2, 2];
	const humid = [3, 1];
	const press = [4, 1];

	var msgLength = message[2];	// Length of message
	sensorData[flow[0]] 	= -10;
	sensorData[oxygen[0]] 	= -10;
	sensorData[temp[0]] 	= -10;
	sensorData[humid[0]] 	= -10;
	sensorData[press[0]] 	= -10;


	if(msgLength != 0x00)
	{
		var parsedLength = 3;
		msgLength += 3;
		while(parsedLength < msgLength)
		{
			switch(message[parsedLength])
			{
				case flow[0]:
					sensorData[flow[0]] = message[parsedLength + 1] << 8 | message[parsedLength + 2];
					parsedLength += flow[1] + 1;
					break;

				case oxygen[0]:
					sensorData[oxygen[0]] = message[parsedLength + 1] << 8 | message[parsedLength + 2];
					parsedLength += oxygen[1] + 1;
					break;
				case temp[0]:
					sensorData[temp[0]] = message[parsedLength + 1] << 8 | message[parsedLength + 2];
					parsedLength += temp[1] + 1;
					break;
				case humid[0]:
					sensorData[humid[0]] = message[parsedLength + 1];
					parsedLength += humid[1] + 1;
					break;
				case press[0]:
					sensorData[press[0]] = message[parsedLength + 1];
					parsedLength += press[1] + 1;
					break;

				case 0xA5:
					console.log("ACK RECEIVED");
					parsedLength += 1;
					break;
				case 0x5A:
					console.log("NACK RECEIVED");
					parsedLength += 1;
					break;

				default:
					console.error("Unknown type");
					console.log(message);
					console.log(message[parsedLength]);
					parsedLength = msgLength;
					break;
			}
		}
	}
}

function updateValues()
{
	var flow 	= (sensorData[0]/flowDivisor).toFixed(1);
	var oxygen 	= (sensorData[1]/10).toFixed(1);
	var temp 	= ((sensorData[2]/10) - tempSubtractor).toFixed(1);
	var humid 	= (sensorData[3]/10).toFixed(1);
	var press 	= (sensorData[4]/10).toFixed(1);
	var battery = (batteryData).toFixed(0);

	if(flow < 0)	{ flow 	= "N/A"; }
	if(oxygen < 0)	{ oxygen= "N/A"; }
	if(temp < 0)	{ temp 	= "N/A"; }
	if(humid < 0)	{ humid = "N/A"; }
	if(press < 0)	{ press = "N/A"; }
	if(battery < 0)	{ battery = "N/A"; }

	document.getElementById("flow").innerHTML = `${flow}`;
	document.getElementById("oxygen").innerHTML = `${oxygen}`;
	document.getElementById("temperature").innerHTML = `${temp}`;
	document.getElementById("humidity").innerHTML = `${humid}`;
	document.getElementById("pressure").innerHTML = `${press}`;
	document.getElementById("battery").innerHTML = `${battery}`;
}