import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";

import { AlertComponent } from "../../angularComponents/alert/alert.component";

@Component({ 
  selector: 'app-alert',
  templateUrl: '../../angularComponents/alert/alert.component.html',
})
export class AlertIonicComponent extends AlertComponent {
} 
