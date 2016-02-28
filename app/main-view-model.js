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

  DemoAppModel.prototype.doScanForHeartrrateMontitor = function () {
    var heartrateService = "180d";
    var omegaService = "12345678-9012-3456-7890-1234567890ee";

    var that = this;
    that.set('isLoading', true);
    // reset the array
    observablePeripheralArray.splice(0, observablePeripheralArray.length); 
    bluetooth.startScanning(
      {
        // beware: the device must advertise ALL these services
        serviceUUIDs: [heartrateService],
        seconds: 4,
        onDiscovered: function (peripheral) {
          var obsp = new observable.Observable(peripheral);
          observablePeripheralArray.push(obsp);
        }
      }
    ).then(function() {
      that.set('isLoading', false);
    });
  };

  DemoAppModel.prototype.doStartScanning = function () {
    var that = this;
    that.set('isLoading', true);
    // reset the array
    observablePeripheralArray.splice(0, observablePeripheralArray.length); 
    bluetooth.startScanning(
      {
        serviceUUIDs: [], // pass an empty array to scan for all services
        seconds: 4, // passing in seconds makes the plugin stop scanning after <seconds> seconds
        onDiscovered: function (peripheral) {
          var obsp = new observable.Observable(peripheral);
          observablePeripheralArray.push(obsp);
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

/*
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
*/
  return DemoAppModel;
})(observable.Observable);
exports.DemoAppModel = DemoAppModel;
exports.mainViewModel = new DemoAppModel();
