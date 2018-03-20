import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { IonicSwipeAllModule } from 'ionic-swipe-all';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';

import { ExplorerComponent } from "../components/explorer/explorer.component";
import { ColoursliderComponent } from '../components/histogram/colourslider/colourslider.component';
import { GradientBuilderComponent } from '../components/gradientBuilder/gradientBuilder.component';
import { StopMarkerComponent } from '../components/gradientBuilder/stop-marker/stop-marker.component';
import { HistogramComponent } from '../components/histogram/histogram.component';
import { JuliaPickerComponent } from '../components/juliaPicker/juliaPicker.component';
import { FractalViewComponent } from '../components/fractalView/fractalView.component';
import { AlertComponent } from '../components/alert/alert.component';

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
    IonicSwipeAllModule,
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
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
