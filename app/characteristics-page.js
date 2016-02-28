var observableArray = require("data/observable-array");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var bluetooth = require("nativescript-bluetooth");
var dialogs = require("ui/dialogs");

function pageLoaded(args) {
    var page = args.object;

    // the Observable-wrapped objects from the previous page
    var peripheral = page.navigationContext.peripheral;
    var service = page.navigationContext.service;
    service.peripheral = peripheral;
    page.bindingContext = new observable.Observable(service);
}

function onCharacteristicTap(args) {
  var index = args.index;
  var page = args.object;
  var service = page.bindingContext;
  var characteristic = service.characteristics[index];

  // show an actionsheet which contains the most relevant possible options
  var p = characteristic.properties;
  var actions = [];
  
  if (p.read) actions.push("read");
  if (p.write) actions.push("write");
  if (p.writeWithoutResponse) actions.push("writeWithoutResponse");
  if (p.notify) actions.push("notify start");
  if (p.notify) actions.push("notify stop");

  dialogs.action({
    message: "Pick a property",
    cancelButtonText: "Cancel",
    actions: actions
  }).then(function (result) {

    console.log("Dialog result: " + result);
    
    function getTimestamp() {
      return new Date().toLocaleString();
    }

    if (result === "read") {
      bluetooth.read({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID
      }).then(function (result) {
        console.log("READ RESULT: " + JSON.stringify(result));
        service.set("feedback", result.valueDecoded || 'Empty value received');
        service.set("feedbackTimestamp", getTimestamp());
      }, function(error) {
        service.set("feedback", error);
        service.set("feedbackTimestamp", getTimestamp());
      });
    } else if (result === "write") {
      dialogs.prompt({
        title: "Write what exactly?",
        message: "The plugin will try to write a binary representation of this value to the device.",
        cancelButtonText: "Cancel",
        okButtonText: "Write it!"
      }).then(function(response) {
        console.log("-- prompt result: " + JSON.stringify(result));
        if (response.result) {
          bluetooth.write({
            deviceUUID: service.peripheral.UUID,
            serviceUUID: service.UUID,
            characteristicUUID: characteristic.UUID,
            value: response.text,
            // TODO note that this will not yet be called
            onWritten: function(result) {
              console.log("------@@@@@ got write result: " + JSON.stringify(result));
              service.set("feedback", 'value written');
              service.set("feedbackTimestamp", getTimestamp());
            }
          });
        }
      });
    } else if (result === "writeWithoutResponse") {
      dialogs.prompt({
        title: "Write what exactly?",
        message: "The plugin will try to write a binary representation of this value to the device.",
        cancelButtonText: "Cancel",
        okButtonText: "Write it!"
      }).then(function(response) {
        console.log("-- prompt result: " + JSON.stringify(result));
        if (response.result) {
          bluetooth.writeWithoutResponse({
            deviceUUID: service.peripheral.UUID,
            serviceUUID: service.UUID,
            characteristicUUID: characteristic.UUID,
            value: response.text
          }).then(function (result) {
            // TODO note that this will not yet be called after writing the value
            console.log("------@@@@@ got writeWithoutResponse result: " + JSON.stringify(result));
            service.set("feedback", 'value write requested');
            service.set("feedbackTimestamp", getTimestamp());
          });
        }
      });
    } else if (result === "notify start") {
      bluetooth.startNotifying({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID,
        onNotify: function(result) {
          service.set("feedback", result.valueDecoded || 'No notification value received');
          service.set("feedbackTimestamp", getTimestamp());
        }
      }).then(function (result) {
        service.set("feedback", 'subscribed for notifications');
        service.set("feedbackTimestamp", getTimestamp());
      });
    } else if (result === "notify stop") {
      bluetooth.stopNotifying({
        deviceUUID: service.peripheral.UUID,
        serviceUUID: service.UUID,
        characteristicUUID: characteristic.UUID
      }).then(function (result) {
        service.set("feedback", 'notification stopped');
        service.set("feedbackTimestamp", getTimestamp());
      }, function(error) {
        service.set("feedback", error);
      });
    }
  });
}

exports.pageLoaded = pageLoaded;
exports.onCharacteristicTap = onCharacteristicTap;