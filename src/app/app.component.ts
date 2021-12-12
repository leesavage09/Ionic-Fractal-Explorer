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

  public onboardingToDo: boolean = false;

  constructor(private platform: Platform, splashScreen: SplashScreen, private storage: Storage, private screenOrientation: ScreenOrientation) {
    if (platform.is("cordova")) {
      splashScreen.hide();
    }

    platform.ready().then(() => {
      this.explorer.myApp = this;
      var self = this;

      if (this.platform.is("android") && this.platform.is("cordova") && (<any>window).plugins) {
        //the intent that we launch with
        (<any>window).plugins.intentShim.getIntent((intent) => {
          self.handelAndroidIntent(intent);
        }, () => console.log("intent error"));

        //future intents callback!
        (<any>window).plugins.intentShim.onIntent((intent) => {
          self.intentHandled = false;
          self.showSplash();
          self.handelAndroidIntent(intent);
        }, () => console.log("intent error"));
      }
      else {
        self.handelWebIntent();
      }


      this.storage.get("onboardingToDo").then((val) => {
        var doOnboarding = true;
        if (val != null) doOnboarding = val;
        if (doOnboarding) {
          this.openOnboarding();
        }
        this.onboardingDecided = true;
        this.hideSplashIf()
      });
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

  private showSplash() {
    document.getElementById("splash").style.display = "block";
  }

  private onboardingDecided: boolean = false;
  private intentHandled: boolean = false;
  private hideSplashIf() {
    if (this.onboardingDecided && this.intentHandled) {
      document.getElementById("splash").style.display = "none";
    }
  }

  private handelWebIntent() {
    this.explorer.init(window.location.href);
    this.intentHandled = true;
    this.hideSplashIf();
  }

  private handelAndroidIntent(intent: any) {
    if (intent && intent.data) {
      if (intent.data.includes("getShareUrl.php")) {
        let st = intent.data.substring(intent.data.indexOf("?") + 1);
        let id = st.split('=')[1];
        var self = this;
        var xhttp = new XMLHttpRequest();
        let server = 'https://fractal-explorer-leesavage.herokuapp.com/getShareUrlString.php?id=' + id;
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            if (this.responseText.includes("error")) {
              alert("Share link not found :(");
            } else {
              self.explorer.init(this.responseText);
            }
          }
          else if (this.readyState == 4 && this.status != 200) {
            alert("Sorry, The link cant be opened. You might not have a network connection?");
          }
          self.intentHandled = true;
          self.hideSplashIf();
        };
        xhttp.open("POST", server, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send();
      }
      else {
        this.explorer.init(intent.data);
        this.intentHandled = true;
        this.hideSplashIf();
      }
    }
    else {
      this.intentHandled = true;
      this.hideSplashIf();
    }
  }
}

