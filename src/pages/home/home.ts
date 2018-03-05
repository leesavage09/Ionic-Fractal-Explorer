import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit, ViewChild, ElementRef } from "@angular/core";
import { ExplorerIonicComponent } from "../../ionicComponents/explorer/explorer.component";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

}
