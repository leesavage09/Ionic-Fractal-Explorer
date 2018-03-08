import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { ExplorerIonicComponent } from "../ionicComponents/explorer/explorer.component";
import { ColoursliderIonicComponent } from '../ionicComponents/histogram/colourslider/colourslider.component';
import { GradientBuilderIonicComponent } from '../ionicComponents/gradientBuilder/gradientBuilder.component';
import { StopMarkerIonicComponent } from '../ionicComponents/gradientBuilder/stop-marker/stop-marker.component';
import { StopMarkerComponent } from '../angularComponents/gradientBuilder/stop-marker/stop-marker.component';
import { HistogramIonicComponent } from '../ionicComponents/histogram/histogram.component';
import { JuliaPickerIonicComponent } from '../ionicComponents/juliaPicker/juliaPicker.component';
import { FractalViewIonicComponent } from '../ionicComponents/fractalView/fractalView.component';
import { AlertIonicComponent } from '../ionicComponents/alert/alert.component';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ExplorerIonicComponent,
    ColoursliderIonicComponent,
    GradientBuilderIonicComponent,
    StopMarkerIonicComponent,
    HistogramIonicComponent,
    JuliaPickerIonicComponent,
    FractalViewIonicComponent,
    AlertIonicComponent,
    StopMarkerComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    StopMarkerComponent
  ],
  providers: [
    SocialSharing,
    PhotoLibrary,
    AndroidFullScreen,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
