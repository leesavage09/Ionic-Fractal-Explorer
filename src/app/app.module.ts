import { BrowserModule } from '@angular/platform-browser';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { IonicStorageModule } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { MyApp } from './app.component';

import { ExplorerComponent } from "../components/explorer/explorer.component";
import { ColoursliderComponent } from '../components/histogram/colourslider/colourslider.component';
import { GradientBuilderComponent } from '../components/gradientBuilder/gradientBuilder.component';
import { StopMarkerComponent } from '../components/gradientBuilder/stop-marker/stop-marker.component';
import { HistogramComponent } from '../components/histogram/histogram.component';
import { JuliaPickerComponent } from '../components/juliaPicker/juliaPicker.component';
import { FractalViewComponent } from '../components/fractalView/fractalView.component';
import { AlertComponent } from '../components/alert/alert.component';

declare var Hammer: any;

export class MyHammerConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    var dir = element.className == "colorPullDown-btn" ? Hammer.DIRECTION_ALL : Hammer.DIRECTION_HORIZONTAL;
    return new Hammer.Manager(element, {
      recognizers: [
        [Hammer.Swipe, { direction: dir }]
      ]
    });
  }
}

@NgModule({
  declarations: [
    MyApp,
    ExplorerComponent,
    ColoursliderComponent,
    GradientBuilderComponent,
    StopMarkerComponent,
    HistogramComponent,
    JuliaPickerComponent,
    FractalViewComponent,
    AlertComponent,
    StopMarkerComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    StopMarkerComponent
  ],
  providers: [
    SocialSharing,
    PhotoLibrary,
    AndroidFullScreen,
    SplashScreen,
    ScreenOrientation,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
  ]
})
export class AppModule { }
