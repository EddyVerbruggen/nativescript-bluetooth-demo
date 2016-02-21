var observableArray = require("data/observable-array");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var bluetooth = require("nativescript-bluetooth");
var dialogs = require("ui/dialogs");

// var peripheral;
// var service;

// var wrapper;

function pageLoaded(args) {
    var page = args.object;

    // the Observable-wrapped objects from the previous page
    var peripheral = page.navigationContext.peripheral;
    var service = page.navigationContext.service;
    service.peripheral = peripheral;

    page.bindingContext = new observable.Observable(service);

    // console.log("---- @ details page, service.UUID: " + service.UUID);
    // console.log("---- @ details page, service.peripheral: " + peripheral.UUID);

/*
    var chars = service.characteristics;
    service.characteristics = new observableArray.ObservableArray();
    chars.forEach(function(value) {
      var obsc = new observable.Observable(value);
      service.characteristics.push(obsc);
      // console.log("---- adding char " + service.characteristics.push(value));                      
    });
 */
}

function onCharacteristicTap(args) {
  var index = args.index;
  var page = args.object;
  var service = page.bindingContext;

  var characteristic = service.characteristics[index];
  // console.log("--- characteristic selected: " + characteristic.UUID);

  // show an actionsheet which contains the possible options (read, write, notify at least)
  
  var p = characteristic.properties;
  var actions = [];
  
  if (p.read) actions.push("read");
  if (p.read2) actions.push("read2"); // TO HANDLER
  if (p.write) actions.push("write");
  if (p.writeWithoutResponse) actions.push("writeWithoutResponse");
  if (p.notify) actions.push("notify start");
  if (p.notify) actions.push("notify stop");

/*  
      broadcast: (props & CBCharacteristicPropertyBroadcast) == CBCharacteristicPropertyBroadcast,
      read: (props & CBCharacteristicPropertyRead) == CBCharacteristicPropertyRead,
      broadcast2: (props & CBCharacteristicPropertyBroadcast) == CBCharacteristicPropertyBroadcast,
      read2: (props & CBCharacteristicPropertyRead) == CBCharacteristicPropertyRead,
      write: (props & CBCharacteristicPropertyWrite) == CBCharacteristicPropertyWrite,
      writeWithoutResponse: (props & CBCharacteristicPropertyWriteWithoutResponse) == CBCharacteristicPropertyWriteWithoutResponse,
      notify: (props & CBCharacteristicPropertyNotify) == CBCharacteristicPropertyNotify,
      indicate: (props & CBCharacteristicPropertyIndicate) == CBCharacteristicPropertyIndicate,
      authenticatedSignedWrites: (props & CBCharacteristicPropertyAuthenticatedSignedWrites) == CBCharacteristicPropertyAuthenticatedSignedWrites,
      extendedProperties: (props & CBCharacteristicPropertyExtendedProperties) == CBCharacteristicPropertyExtendedProperties,
      notifyEncryptionRequired: (props & CBCharacteristicPropertyNotifyEncryptionRequired) == CBCharacteristicPropertyNotifyEncryptionRequired,
      indicateEncryptionRequired: (props & CBCharacteristicPropertyIndicateEncryptionRequired) == CBCharacteristicPropertyIndicateEncryptionRequired
*/

  // TODO write, awaitResponse
  dialogs.action({
    message: "Pick a property",
    cancelButtonText: "Cancel",
    actions: actions
  }).then(function (result) {
    console.log("Dialog result: " + result);
    if (result === "read") {
      bluetooth.read({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID
      }).then(function (result) {
        console.log("READ RESULT: " + JSON.stringify(result));
        service.set("feedback", result.decodedvalue || 'Empty value received');
      }, function(error) {
        service.set("feedback", error);        
      });
    } else if (result === "write") {
      bluetooth.write({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID,
        onWritten: function(result) {
          console.log("------@@@@@ got write result: " + JSON.stringify(result));
          service.set("feedback", 'value written');
        }
      });
    } else if (result === "writeWithoutResponse") {
      bluetooth.write({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID
      }).then(function (result) {
        console.log("------@@@@@ got write result: " + JSON.stringify(result));
        service.set("feedback", 'value written');
      });
    } else if (result === "notify start") {
      bluetooth.startNotifying({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID,
        onNotify: function(result) {
          // console.log("------@@@@@ got notification result: " + JSON.stringify(result));
          service.set("feedback", result.decodedvalue || 'No notification value received');
        }
      });
    } else if (result === "notify stop") {
      bluetooth.stopNotifying({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID
      }).then(function (result) {
        service.set("feedback", 'notification stopped');
      }, function(error) {
        service.set("feedback", error);
      });
    }
  });
}

exports.pageLoaded = pageLoaded;
exports.onCharacteristicTap = onCharacteristicTap;