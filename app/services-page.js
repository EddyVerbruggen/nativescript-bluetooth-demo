var observableArray = require("data/observable-array");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var bluetooth = require("nativescript-bluetooth");

var peripheral;

function pageLoaded(args) {
    var page = args.object;

    // the Observable-wrapped object from the previous page
    peripheral = page.navigationContext.peripheral;
    console.log("---- @ details page, peripheral.name: " + peripheral.name);
    
    peripheral.services = new observableArray.ObservableArray();
    page.bindingContext = peripheral;
    peripheral.set('isLoading', true);

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
}

function onServiceTap(args) {
  var index = args.index;
  console.log('!!&&&&***** Clicked service with index ' + args.index);

  var service = peripheral.services.getItem(index);
  console.log("--- service selected: " + service.UUID);

  var navigationEntry = {
    moduleName: "characteristics-page",
    context: {
      peripheral: peripheral,
      service: service
    },
    animated: true
  };
  var topmost = frameModule.topmost();
  topmost.navigate(navigationEntry);
}

exports.pageLoaded = pageLoaded;
exports.onServiceTap = onServiceTap;