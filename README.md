# nativescript-bluetooth demo app - angular version

Demo app for the [NativeScript Bluetooth plugin](https://github.com/EddyVerbruggen/nativescript-bluetooth)

<img src="bluetooth-demo-ng.gif"/>

## Installation

This app is built with the [NativeScript CLI](https://github.com/NativeScript/nativescript-cli).
Once you have the [CLI installed](https://github.com/NativeScript/nativescript-cli#installation), start by cloning the repo:

```
$ git clone https://github.com/EddyVerbruggen/nativescript-bluetooth-demo
$ cd nativescript-bluetooth-demo
$ git checkout angular
$ cd Bluetooth-ng
```

Next, install the app's iOS and Android runtimes, as well as the app's npm dependencies:

```
$ tns install
```

From there you can use the `run` command to run the demo app on iOS:

```
$ tns run ios
```

.. or on Android

```
$ tns run android
```

Don't use an emulator as you can only test Bluetooth connectivity on a real device.
