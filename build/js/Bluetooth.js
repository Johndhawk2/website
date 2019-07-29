var deviceDetail= new Object()
	deviceDetail.deviceGet;
	deviceDetail.devGetServer;
	deviceDetail.devGetService;
	deviceDetail.devGetChar;
	deviceDetail.devGetVal;
	deviceDetail.devGetValInt;


async function bluetoothPairing() {
	console.log('Requesting Bluetooth Device...');
	deviceDetail.deviceGet = await(navigator.bluetooth.requestDevice({filters: [{services: ['battery_service']}]}));
	/*deviceDetail.devGetServer= await(deviceDetail.deviceGet.gatt.connect());
	deviceDetail.devGetService= await(deviceDetail.devGetServer.getPrimaryService('battery_service'));
	deviceDetail.devGetChar= await(deviceDetail.devGetService.getCharacteristic('battery_level'));*/
	await(bluetoothConnect());
	console.log(deviceDetail.deviceGet);
	console.log(deviceDetail.devGetServer);
	console.log(deviceDetail.devGetService);
	console.log(deviceDetail.devGetChar);
	document.getElementById("connectedDevice").innerHTML=deviceDetail.deviceGet.name;
	batteryLevelGet();
	setPos();
}

async function bluetoothConnect(){
	deviceDetail.devGetServer= await(deviceDetail.deviceGet.gatt.connect());
	deviceDetail.devGetService= await(deviceDetail.devGetServer.getPrimaryService('battery_service'));
	deviceDetail.devGetChar= await(deviceDetail.devGetService.getCharacteristic('battery_level'));
	$("#connectedDevice").html(deviceDetail.deviceGet.name);
	console.log("Connected");
}

function bluetoothDisconnect(){
	deviceDetail.deviceGet.gatt.disconnect();
	$("#connectedDevice").html("Disconnected");
}

async function batteryLevelGet(){
	deviceDetail.devGetVal= await(deviceDetail.devGetChar.readValue());
	deviceDetail.devGetValInt= await(deviceDetail.devGetVal.getUint8());
	console.log(deviceDetail.devGetVal);
	console.log(deviceDetail.devGetValInt);
	document.getElementById("batteryLevel").innerHTML=deviceDetail.devGetValInt;
}

function setPos(){
	$(".content").css("top", $("header").outerHeight());
	$(".content").css("bottom", 0);
	$("#connectedDevice").css("top", ($("header").outerHeight()/2)-($("#connectedDevice").outerHeight()/2));
	$("#headButtons").css("top", ($("header").outerHeight()/2)-($("#headButtons").outerHeight()/2));
}