import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  constructor(platform: Platform, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //statusBar.styleDefault();
      if (platform.is("android") && platform.is("cordova")) {
        splashScreen.hide();
      }
      

      if ((<any>window).plugins)
      (<any>window).plugins.intentShim.getIntent((intent) => {
        if (intent && intent.data) {
          console.log("URL",intent.data)
        }
      }, () => console.log("intent error"));
    });

    platform.resume.subscribe(() => {
      console.log("resume")
    });
  }

  
}

