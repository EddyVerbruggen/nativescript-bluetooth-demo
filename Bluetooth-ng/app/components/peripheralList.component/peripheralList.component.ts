import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";

import { BluetoothService } from "../../services/bluetooth.service";

@Component({
    selector: "ble-peripheral-list",
    templateUrl: "components/peripheralList.component/peripheralList.component.html",
})
export class PeripheralListComponent {

    constructor(
        private routerExtensions: RouterExtensions,
        public bluetoothService: BluetoothService)   // note: bluetoothService is public, because accessed in html
    {
        console.log("Creating PeripheralListComponent");
    }

    onPeripheralTap(args: any) {
        let peripheral = this.bluetoothService.getPeripheral(args.index);
        console.log("peripheral tapped: " + this.bluetoothService.stringify(peripheral));
        this.routerExtensions.navigate(["/services", peripheral.UUID]);
    }
}
