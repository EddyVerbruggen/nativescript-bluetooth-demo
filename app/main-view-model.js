var observable = require("data/observable");
var BLE = require("nativescript-bluetooth");
var dialogs = require("ui/dialogs");
var DemoAppModel = (function (_super) {
  __extends(DemoAppModel, _super);
  function DemoAppModel() {
    _super.call(this);
  }
  
  var mostRecentlyFoundDeviceUUID,
    mostRecentlyConnectedDeviceUUID;

  DemoAppModel.prototype.doIsBluetoothEnabled = function () {
    BLE.isBluetoothEnabled().then(function(enabled) {
      dialogs.alert({
        title: "Enabled?",
        message: enabled ? "Yes" : "No",
        okButtonText: "OK, thanks"
      });
    })
  };

  DemoAppModel.prototype.doStartScanning = function () {
    BLE.startScanning(
      {
        serviceUUIDs: [], // pass an empty array to scan for all services
        // seconds: 20, // passing in seconds makes the plugin stop scanning after <seconds> seconds
        onDeviceDiscovered: function (device) {
          mostRecentlyFoundDeviceUUID = device.UUID;
          dialogs.alert({
            title: "Device found",
            message: JSON.stringify(device),
            okButtonText: "Sweet!"
          });
          // note that alerts can't overlap, so a second/third device may not be alerted - but they are logged:
          console.log("Device found: " + JSON.stringify(device));
        }
      }
    ).then(function() {
      dialogs.alert({
        title: "Scanning started",
        message: "We'll scan until you press the 'stop scanning' button",
        okButtonText: "OK, thanks"
      });
    },
    function (err) {
      dialogs.alert({
        title: "Whoops!",
        message: err,
        okButtonText: "OK, got it"
      });
    })
  };

  DemoAppModel.prototype.doStopScanning = function () {
    BLE.stopScanning().then(function() {
      dialogs.alert({
        title: "Scanning stopped",
        message: "You manually stopped scanning",
        okButtonText: "Duh :)"
      });
    },
    function (err) {
      dialogs.alert({
        title: "Whoops!",
        message: err,
        okButtonText: "OK, so be it"
      });
    })
  };

  DemoAppModel.prototype.doConnect = function () {
    BLE.connect(
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
    )
  };

  DemoAppModel.prototype.doIsConnected = function () {
    BLE.isConnected(
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
    )
  };

  DemoAppModel.prototype.doRead = function () {
    BLE.read(
      {
        deviceUUID: mostRecentlyFoundDeviceUUID,
        serviceUUID: "B9401000-F5F8-466E-AFF9-25556B57FE6D", // TODO dummy
        characteristicUUID: "B9402001-F5F8-466E-AFF9-25556B57FE6D" // TODO dummy
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
    )
  };

  // this is a bit silly to actually include in the demo as it really depends on the device what you should send to it
  DemoAppModel.prototype.doWrite = function () {
    // send 1 byte to switch a light on
    var data = new Uint8Array(1);
    data[0] = 1;

    BLE.write(
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
    )
  };

  DemoAppModel.prototype.doDisconnect = function () {
    BLE.disconnect(
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
    )
  };

  // TODO add start/stopNotification (or more to the point: start/stopListeningForCharacteristicChanges)


  return DemoAppModel;
})(observable.Observable);
exports.DemoAppModel = DemoAppModel;
exports.mainViewModel = new DemoAppModel();
