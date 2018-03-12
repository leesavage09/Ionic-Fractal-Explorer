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
              this.configFromURL(intent.data);
            }
          }, () => console.log("intent error"));
      }
      else {
        this.configFromURL(window.location.href);
      }

    });

    platform.resume.subscribe(() => {
      console.log("resume")
    });
  }

  configFromURL(url: string) {
    let st = decodeURI(url)
    st = st.substring(st.indexOf("?") + 1);
    let arr = st.split('&');

    let result: Array<Array<string>> = new Array();
    for (let i = 0; i < arr.length; i++) {
      result.push(arr[i].split('='));
    }

    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      if (element[0] == "e") {
        this.explorer.equation = element[1];
      }
      if (element[0] == "g") {
        this.explorer.color = element[1];
      }
      if (element[0] == "i") {
        this.explorer.iterations = element[1];
      }
      if (element[0] == "c") {
        this.explorer.complexCenter = element[1];
      }
      if (element[0] == "w") {
        this.explorer.complexWidth = element[1];
      }
      if (element[0] == "p") {
        this.explorer.complexJuliaPicker = element[1];
      }
    }
    this.explorer.init();
  }


}

