import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";

import { StopMarkerComponent } from "../../../angularComponents/gradientBuilder/stop-marker/stop-marker.component";

@Component({ 
  selector: 'app-stop-marker',
  templateUrl: '../../../angularComponents/gradientBuilder/stop-marker/stop-marker.component.html',
})
export class StopMarkerIonicComponent extends StopMarkerComponent {
}
