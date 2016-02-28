var observableArray = require("data/observable-array");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var bluetooth = require("nativescript-bluetooth");
var dialogs = require("ui/dialogs");

var peripheral;

function pageLoaded(args) {
  var page = args.object;

  // might as well not load the rest of the page in this case (nav back)
  if (page.navigationContext === undefined) {
    return;
  }
  
  console.log("--- page.navigationContext: " + page.navigationContext);
  
  peripheral = page.navigationContext.peripheral;
  peripheral.services = new observableArray.ObservableArray();
  page.bindingContext = peripheral;
  peripheral.set('isLoading', true);

  bluetooth.connect(
    {
      UUID: peripheral.UUID,
      // NOTE: we could just use the promise as this cb is only invoked once
      onConnected: function (device) {
        console.log("------- Device connected: " + JSON.stringify(device));
        device.services.forEach(function(value) {
          console.log("---- ###### adding service: " + value.UUID);
          peripheral.services.push(value);
        });
        peripheral.set('isLoading', false);
      },
      onDisconnected: function (device) {
        dialogs.alert({
          title: "Disconnected",
          message: "Disconnected from device: " + JSON.stringify(device),
          okButtonText: "OK, thanks"
        });
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

function onDisconnectTap(args) {
  console.log("Disconnecting peripheral " + peripheral.UUID);
  bluetooth.disconnect(
    {
      UUID: peripheral.UUID
    }
  ).then(
    function() {
      // going back to previous page
      frameModule.topmost().navigate({
        moduleName: "main-page",
        animated: true,
        transition: {
          name: "slideRight"
        }
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
}

exports.pageLoaded = pageLoaded;
exports.onServiceTap = onServiceTap;
exports.onDisconnectTap = onDisconnectTap;