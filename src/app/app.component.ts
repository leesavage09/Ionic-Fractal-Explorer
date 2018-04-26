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
    platform.ready().then(() => {
      if (platform.is("cordova")) {
        splashScreen.hide();
      }

      this.explorer.myApp = this;
      this.processIntent();


      this.storage.get("onboardingToDo").then((val) => {
        var doOnboarding = true;
        if (val != null) doOnboarding = val;
        if (doOnboarding) {
          this.openOnboarding();
        }
        document.getElementById("splash").style.display = "none";
      });
    });

    platform.resume.subscribe(() => {
      this.processIntent();
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

  private processIntent() {
    if (this.platform.is("android") && this.platform.is("cordova")) {
      if ((<any>window).plugins)
        (<any>window).plugins.intentShim.onIntent((intent) => {      
          if (intent && intent.data) {
            if (intent.data.includes("getShareUrl.php")) {
              let st = intent.data.substring(intent.data.indexOf("?") + 1);
              let id = st.split('=')[1];
              var exp = this.explorer;
              var xhttp = new XMLHttpRequest();
              let server = 'https://fractic.leesavage.co.uk/getShareUrlString.php?id=' + id;
              xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                  if (this.responseText.includes("error")) {
                    exp.alertNoNetwork("Share link not found :(");
                  } else {
                    exp.init(this.responseText);
                  }
                }
                else if (this.readyState == 4 && this.status != 200) {
                  exp.alertNoNetwork("Sorry, The link cant be opened. You might not have a network connection?");
                }
              };
              xhttp.open("POST", server, true);
              xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
              xhttp.send();
            }
            else {
              this.explorer.init(intent.data);
            }
          }
        }, () => console.log("intent error"));
    }
    else {
      this.explorer.init(window.location.href);
    }
  }
}

