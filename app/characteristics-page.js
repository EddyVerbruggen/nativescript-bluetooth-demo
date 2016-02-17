var observableArray = require("data/observable-array");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var bluetooth = require("nativescript-bluetooth");

var peripheral;
var service;

function pageLoaded(args) {
    var page = args.object;

    // the Observable-wrapped objects from the previous page
    peripheral = page.navigationContext.peripheral;
    service = page.navigationContext.service;

    console.log("---- @ details page, service.UUID: " + service.UUID);
    console.log("---- @ details page, service.peripheral: " + peripheral.UUID);
    

    // peripheral.services = new observableArray.ObservableArray();
    page.bindingContext = service;
    // peripheral.set('isLoading', true);

/*
    bluetooth.connect(
      {
        UUID: peripheral.UUID,
        onDeviceConnected: function (device) {
          // mostRecentlyConnectedDeviceUUID = device.UUID;
          console.log("------- Device connected: " + JSON.stringify(device));
          
          // peripheral.services = device.services;
          device.services.forEach(function(value) {
            console.log("---- adding service" + peripheral.services.push(value));                      
          });
          peripheral.set('isLoading', false);
        }
      }
    );
    */
}

function onCharacteristicTap(args) {
  var index = args.index;
  console.log('!!&&&&***** Clicked characteristic listitem with index ' + index);
  var characteristic = service.characteristics[index];
  console.log("--- characteristic selected: " + characteristic.UUID);

  bluetooth.read({
    deviceUUID: peripheral.UUID,
    serviceUUID: service.UUID,
    characteristicUUID: characteristic.UUID
    // TODO callback method
  });

/*
  bluetooth.startNotifying({
    deviceUUID: peripheral.UUID,
    serviceUUID: service.UUID,
    characteristicUUID: characteristic.UUID
    // TODO callback method
  });
*/
}

exports.pageLoaded = pageLoaded;
exports.onCharacteristicTap = onCharacteristicTap;