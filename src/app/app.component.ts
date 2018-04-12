import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ExplorerComponent } from '../components/explorer/explorer.component'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('explorer') explorer: ExplorerComponent;

  constructor(platform: Platform, splashScreen: SplashScreen) {
    platform.ready().then(() => {

      if (platform.is("android") && platform.is("cordova")) {
        splashScreen.hide();
        if ((<any>window).plugins)
          (<any>window).plugins.intentShim.getIntent((intent) => {
            if (intent && intent.data) {
              this.explorer.init(intent.data);
            }
          }, () => console.log("intent error"));
      }
      else {
        this.explorer.init(window.location.href);
      }

    });

    platform.resume.subscribe(() => {
    });
  }


}

