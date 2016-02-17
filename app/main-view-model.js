var observable = require("data/observable");
var observableArray = require("data/observable-array");
var frameModule = require("ui/frame");
var bluetooth = require("nativescript-bluetooth");
var dialogs = require("ui/dialogs");
var DemoAppModel = (function (_super) {
  __extends(DemoAppModel, _super);
  function DemoAppModel() {
    _super.call(this);
  }
  
  var mostRecentlyFoundDeviceUUID,
    mostRecentlyConnectedDeviceUUID;

  DemoAppModel.prototype.doIsBluetoothEnabled = function () {
    bluetooth.isBluetoothEnabled().then(function(enabled) {
      dialogs.alert({
        title: "Enabled?",
        message: enabled ? "Yes" : "No",
        okButtonText: "OK, thanks"
      });
    });
  };

  var observablePeripheralArray = new observableArray.ObservableArray();

  DemoAppModel.prototype.peripherals = observablePeripheralArray;
  
  DemoAppModel.prototype.onPeripheralTap = function (args) {
    var index = args.index;
    console.log('!!&&&&***** Clicked item with index ' + index);
    var peri = DemoAppModel.prototype.peripherals.getItem(index);
    console.log("--- peri selected: " + peri.UUID);

    var navigationEntry = {
      moduleName: "services-page",
      context: {
        info: "something you want to pass to your page",
        foo: 'bar',
        peripheral: peri
      },
      animated: true
    };
    var topmost = frameModule.topmost();
    topmost.navigate(navigationEntry);
  };

  DemoAppModel.prototype.doStartScanning = function () {
    var that = this;
    that.set('isLoading', true);
    // reset the array
    observablePeripheralArray.splice(0, observablePeripheralArray.length); 
    bluetooth.startScanning(
      {
        serviceUUIDs: [], // pass an empty array to scan for all services
        seconds: 5, // passing in seconds makes the plugin stop scanning after <seconds> seconds
        onDeviceDiscovered: function (peripheral) {
          // mostRecentlyFoundDeviceUUID = peripheral.UUID;

          var found = false;
          observablePeripheralArray.forEach(function(value, index, array) {
            if (value.UUID == peripheral.UUID) {
              found = true;
              // let's update the relevant values of the observable object so the UI updates
              value.RSSI = peripheral.RSSI;
              value.state = peripheral.state;
            }
          });

          if (!found) {
            // scan for services
            console.log("--- connecting to device: @ " + peripheral.UUID);
            // peripheral.services = new observableArray.ObservableArray();

            var obsp = new observable.Observable(peripheral);
            observablePeripheralArray.push(obsp);
            /*
            bluetooth.connect(
              {
                UUID: peripheral.UUID,
                onDeviceConnected: function (device) {
                  // mostRecentlyConnectedDeviceUUID = device.UUID;
                  console.log("------- Device connected: " + JSON.stringify(device));
                  device.services.forEach(function(value) {
                    peripheral.services.push(value);                      
                  });
                }
              }
            );
            */
          }
        }
      }
    ).then(function() {
      that.set('isLoading', false);
    },
    function (err) {
      dialogs.alert({
        title: "Whoops!",
        message: err,
        okButtonText: "OK, got it"
      });
    });
  };


  DemoAppModel.prototype.doStopScanning = function () {
    var that = this;
    bluetooth.stopScanning().then(function() {
      that.set('isLoading', false);
    },
    function (err) {
      dialogs.alert({
        title: "Whoops!",
        message: err,
        okButtonText: "OK, so be it"
      });
    });
  };

  DemoAppModel.prototype.doConnect = function () {
    bluetooth.connect(
      {
        UUID: mostRecentlyFoundDeviceUUID,
        // TODO add other callbacks, like onDeviceConnectionFailed? send those to the delegate object and keep them there..
        onDeviceConnected: function (device) {
          mostRecentlyConnectedDeviceUUID = device.UUID;
          dialogs.alert({
            title: "Device connected",
            message: JSON.stringify(device),
            okButtonText: "Awesome!"
          });
          console.log("Device connected: " + JSON.stringify(device));
        }
      }
    ).then(
      function() {
        console.log("Attempting to connect to device");
        dialogs.alert({
          title: "Attempting to connect",
          message: "Lifecycle updates are sent through the 'onDeviceConnected' callback",
          okButtonText: "Ehm, OK.."
        });
      },
      function (err) {
        dialogs.alert({
          title: "Whoops!",
          message: err,
          okButtonText: "OK, shame"
        });
      }
    );
  };

  DemoAppModel.prototype.doIsConnected = function () {
    bluetooth.isConnected(
      {
        UUID: mostRecentlyFoundDeviceUUID
      }
    ).then(
      function(connected) {
        dialogs.alert({
          title: "Connected?",
          message: connected ? "Yes" : "No",
          okButtonText: "OK, merci"
        });
      },
      function (err) {
        dialogs.alert({
          title: "Whoops!",
          message: err,
          okButtonText: "OK, cheers"
        });
      }
    );
  };

  DemoAppModel.prototype.doRead = function () {
    bluetooth.read(
      {
        deviceUUID: mostRecentlyFoundDeviceUUID,
        serviceUUID: "6217FF4B-FB31-1140-AD5A-A45545D7ECF3", // Polar
        characteristicUUID: "6217FF4B-FB31-1140-AD5A-A45545D7ECF3" // Polar
      }
    ).then(
      function(result) {
        dialogs.alert({
          title: "Read result",
          message: JSON.stringify(result),
          okButtonText: "OK, cool"
        });
      },
      function (err) {
        dialogs.alert({
          title: "Whoops!",
          message: err,
          okButtonText: "OK"
        });
      }
    );
  };

  // this is a bit silly to actually include in the demo as it really depends on the device what you should send to it
  DemoAppModel.prototype.doWrite = function () {
    // send 1 byte to switch a light on
    var data = new Uint8Array(1);
    data[0] = 1;

    bluetooth.write(
      {
        deviceUUID: mostRecentlyFoundDeviceUUID,
        serviceUUID: "B9401000-F5F8-466E-AFF9-25556B57FE6D", // TODO dummy
        characteristicUUID: "B9402001-F5F8-466E-AFF9-25556B57FE6D", // TODO dummy
        value: data.buffer,
        awaitResponse: true // if false you will not get notified of errors (fire and forget) 
      }
    ).then(
      function(result) {
        dialogs.alert({
          title: "Write result",
          message: JSON.stringify(result),
          okButtonText: "OK, splendid"
        });
      },
      function (err) {
        dialogs.alert({
          title: "Whoops!",
          message: err,
          okButtonText: "Hmmkay"
        });
      }
    );
  };

  DemoAppModel.prototype.doDisconnect = function () {
    bluetooth.disconnect(
      {
        UUID: mostRecentlyFoundDeviceUUID
      }
    ).then(
      function() {
        console.log("Attempting to disconnect a device");
        dialogs.alert({
          title: "Attempting to connect",
          message: "Lifecycle updates are sent through the 'onDeviceConnected' callback",
          okButtonText: "Ehm, OK.."
        });
      },
      function (err) {
        dialogs.alert({
          title: "Whoops!",
          message: err,
          okButtonText: "Darn!"
        });
      }
    );
  };

  // TODO add start/stopNotification (or more to the point: start/stopListeningForCharacteristicChanges)

  return DemoAppModel;
})(observable.Observable);
exports.DemoAppModel = DemoAppModel;
exports.mainViewModel = new DemoAppModel();
