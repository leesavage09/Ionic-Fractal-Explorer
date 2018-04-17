import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, Slides } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { ExplorerComponent } from '../components/explorer/explorer.component'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('explorer') explorer: ExplorerComponent;
  @ViewChild('onboarding') onboarding: ElementRef;
  @ViewChild('onboardingSlides') onboardingSlides: Slides;

  public onboardingToDo: boolean = true;

  constructor(private platform: Platform, splashScreen: SplashScreen, private storage: Storage, private screenOrientation: ScreenOrientation) {
    platform.ready().then(() => {

      this.explorer.myApp = this;
      if (platform.is("android") && platform.is("cordova")) {
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


      this.storage.get("onboardingToDo").then((val) => {
        if (val != null) this.onboardingToDo = val;
        console.log("onboarding enabled for dev", this.onboardingToDo);
        this.onboardingToDo = true;
        if (this.onboardingToDo) {
          this.openOnboarding();
        }
        if (platform.is("android") && platform.is("cordova")) {
          splashScreen.hide();
        }
      });
    });

    platform.resume.subscribe(() => {
    });
  }

  public closeOnboarding() {
    this.storage.set("onboardingToDo", this.onboardingToDo = false);
    if (this.platform.is("android")) {
      this.screenOrientation.unlock();
    }
  }

  public openOnboarding() {
    if (this.platform.is("android")) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
    this.onboardingToDo = true;
  }
}

