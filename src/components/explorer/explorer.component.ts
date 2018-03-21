import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Platform, Toast } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Fractals } from "../../fractal/fractal.module";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { ComplexNumber } from "../../fractal/complexNumbers";
import { FractalColor } from "../../fractal/fractalColouring";
import { GradientBuilderComponent } from '../gradientBuilder/gradientBuilder.component';
import { HistogramComponent } from "../histogram/histogram.component";
import { JuliaPickerComponent } from "../juliaPicker/juliaPicker.component";
import { FractalViewComponent } from '../fractalView/fractalView.component';
import { AlertComponent } from "../alert/alert.component";

@Component({
  selector: "ExplorerComponent",
  templateUrl: "./explorer.component.html"
})
export class ExplorerComponent implements OnInit, Fractals.MaxZoomListner, FractalColor.LinearGradientObserver {
  @ViewChild('fractalView') readonly mainFractalView: FractalViewComponent;
  @ViewChild('juliaPicker') readonly HTMLjuliaPicker: JuliaPickerComponent;
  @ViewChild('juliaPullOut') readonly HTMLjuliaPullOut: ElementRef;
  @ViewChild('alert') readonly HTMLalert: ElementRef;
  @ViewChild('iterationControls') readonly HTMLiterationControls: ElementRef;
  @ViewChild('zoomControls') readonly HTMLzoomControls: ElementRef;
  @ViewChild('eyeControls') readonly HTMLeyeControls: ElementRef;
  @ViewChild('jscolor') readonly HTMLjscolor: ElementRef;
  @ViewChild('jscolor2') readonly HTMLjscolor2: ElementRef;
  @ViewChild('histogram') readonly HTMLhistogram: HistogramComponent;
  @ViewChild('gradient') readonly HTMLgradient: GradientBuilderComponent;
  @ViewChild('colorPullDown') readonly HTMLcolorPullDown: ElementRef;
  @ViewChild('saveButton') readonly HTMLsaveButton: ElementRef;
  @ViewChild('saveText') readonly HTMLsaveText: ElementRef;
  @ViewChild('alertComponent') readonly HTMLalertComponent: AlertComponent;
  @ViewChild('webView') readonly HTMLwebView: ElementRef;
  @ViewChild('saveSection') readonly saveSection: ElementRef;
  @ViewChild('equationSection') readonly equationSection: ElementRef;
  @ViewChild('gradientSection') readonly gradientSection: ElementRef;
  @ViewChild('LibrarySection') readonly librarySection: ElementRef;
  @ViewChild('FavoritesSection') readonly favoritesSection: ElementRef;
  @ViewChild('itSpan') readonly itSpan: ElementRef;
  @ViewChild('itInput') readonly itInput: ElementRef;
  @ViewChild('intColor') readonly intColor: ElementRef;

  readonly colorBW: string = '{"mn":0,"md":0.5,"mx":1,"arr":[{"s":0,"c":{"r":0,"g":0,"b":0}},{"s":1,"c":{"r":255,"g":255,"b":255}}]}'
  readonly colorRainbow: string = '{"mn":0,"md":0.5,"mx":1,"arr":[{"s":0,"c":{"r":255,"g":0,"b":0}},{"s":0.166,"c":{"r":255,"g":100,"b":0}},{"s":0.332,"c":{"r":249,"g":255,"b":0}},{"s":0.498,"c":{"r":0,"g":255,"b":13}},{"s":0.664,"c":{"r":0,"g":67,"b":255}},{"s":0.830,"c":{"r":133,"g":0,"b":255}},{"s":1,"c":{"r":255,"g":0,"b":215}}]}'
  readonly colorBlueGold: string = '{"mn":0,"md":0.5,"mx":1,"arr":[{"s":0,"c":{"r":0,"g":51,"b":255}},{"s":0.8041666666666667,"c":{"r":255,"g":200,"b":0}},{"s":1,"c":{"r":255,"g":115,"b":0}}]}';
  readonly colorBlackBlue: string = '{"mn":0.04325513196480939,"md":0.5,"mx":1,"arr":[{"s":0,"c":{"r":0,"g":0,"b":0}},{"s":0.21994134897360704,"c":{"r":0,"g":51,"b":255}},{"s":0.49560117302052786,"c":{"r":255,"g":200,"b":0}},{"s":1,"c":{"r":255,"g":255,"b":255}}]}'
  readonly colorCell: string = '{"mn":0,"md":0.43328445747800587,"mx":1,"arr":[{"s":0,"c":{"r":0,"g":0,"b":0}},{"s":0.1590909090909091,"c":{"r":0,"g":0,"b":0}},{"s":0.16715542521994134,"c":{"r":89,"g":255,"b":225}},{"s":0.17668621700879766,"c":{"r":0,"g":0,"b":0}},{"s":0.30058651026392963,"c":{"r":74,"g":104,"b":255}},{"s":0.5175953079178885,"c":{"r":18,"g":255,"b":0}},{"s":1,"c":{"r":255,"g":255,"b":255}}]}'
  readonly colorBlob: string = '{"mn":0,"md":0.36363636363636365,"mx":1,"arr":[{"s":0,"c":{"r":255,"g":255,"b":255}},{"s":0.1495601173020528,"c":{"r":255,"g":255,"b":255}},{"s":0.16715542521994134,"c":{"r":0,"g":0,"b":0}},{"s":0.18841642228739003,"c":{"r":255,"g":255,"b":255}},{"s":0.30058651026392963,"c":{"r":255,"g":0,"b":0}},{"s":0.5175953079178885,"c":{"r":255,"g":110,"b":63}},{"s":1,"c":{"r":255,"g":221,"b":0}}]}'
  readonly colorCrystal: string = '{"mn":0.2653958944281525,"md":0.4868035190615836,"mx":1,"arr":[{"s":0,"c":{"r":0,"g":0,"b":0}},{"s":0.001466275659824047,"c":{"r":0,"g":0,"b":0}},{"s":0.4897360703812317,"c":{"r":250,"g":255,"b":115}},{"s":1,"c":{"r":106,"g":103,"b":255}}]}'

  readonly lib1: string = '?e=Julia&g=%7B"mn":0,"md":0.5,"mx":1,"interiorColor":%7B"r":0,"g":0,"b":0%7D,"arr":%5B%7B"s":0,"c":%7B"r":255,"g":0,"b":0%7D%7D,%7B"s":0.166,"c":%7B"r":255,"g":100,"b":0%7D%7D,%7B"s":0.332,"c":%7B"r":249,"g":255,"b":0%7D%7D,%7B"s":0.498,"c":%7B"r":0,"g":255,"b":13%7D%7D,%7B"s":0.664,"c":%7B"r":0,"g":67,"b":255%7D%7D,%7B"s":0.83,"c":%7B"r":133,"g":0,"b":255%7D%7D,%7B"s":1,"c":%7B"r":255,"g":0,"b":215%7D%7D%5D,"compiledArray":%5B%7B"r":255,"g":0,"b":0%7D,%7B"r":255,"g":12,"b":0%7D,%7B"r":255,"g":25,"b":0%7D,%7B"r":255,"g":37,"b":0%7D,%7B"r":255,"g":49,"b":0%7D,%7B"r":255,"g":61,"b":0%7D,%7B"r":255,"g":74,"b":0%7D,%7B"r":255,"g":86,"b":0%7D,%7B"r":255,"g":98,"b":0%7D,%7B"r":254,"g":117,"b":0%7D,%7B"r":254,"g":136,"b":0%7D,%7B"r":253,"g":155,"b":0%7D,%7B"r":252,"g":174,"b":0%7D,%7B"r":251,"g":193,"b":0%7D,%7B"r":251,"g":212,"b":0%7D,%7B"r":250,"g":231,"b":0%7D,%7B"r":249,"g":250,"b":0%7D,%7B"r":227,"g":255,"b":1%7D,%7B"r":196,"g":255,"b":3%7D,%7B"r":165,"g":255,"b":4%7D,%7B"r":135,"g":255,"b":6%7D,%7B"r":104,"g":255,"b":8%7D,%7B"r":74,"g":255,"b":9%7D,%7B"r":43,"g":255,"b":11%7D,%7B"r":12,"g":255,"b":12%7D,%7B"r":0,"g":241,"b":31%7D,%7B"r":0,"g":218,"b":61%7D,%7B"r":0,"g":195,"b":90%7D,%7B"r":0,"g":172,"b":120%7D,%7B"r":0,"g":149,"b":150%7D,%7B"r":0,"g":126,"b":180%7D,%7B"r":0,"g":103,"b":209%7D,%7B"r":0,"g":79,"b":239%7D,%7B"r":8,"g":63,"b":255%7D,%7B"r":24,"g":55,"b":255%7D,%7B"r":40,"g":47,"b":255%7D,%7B"r":57,"g":38,"b":255%7D,%7B"r":73,"g":30,"b":255%7D,%7B"r":89,"g":22,"b":255%7D,%7B"r":106,"g":14,"b":255%7D,%7B"r":122,"g":6,"b":255%7D,%7B"r":138,"g":0,"b":253%7D,%7B"r":152,"g":0,"b":249%7D,%7B"r":167,"g":0,"b":244%7D,%7B"r":182,"g":0,"b":239%7D,%7B"r":196,"g":0,"b":234%7D,%7B"r":211,"g":0,"b":229%7D,%7B"r":226,"g":0,"b":225%7D,%7B"r":240,"g":0,"b":220%7D,%7B"r":255,"g":0,"b":215%7D,%7B"r":0,"g":0,"b":0%7D%5D%7D&i=50&c=-0.1001841532272949,0.00009339391422746868&w=1.676384839650146&p=-0.21367978066422655,-0.8230225314239187&r=0.03457161303360778';
  readonly lib2: string = '?e=Mandelbrot&g=%7B%22mn%22:0.2653958944281525,%22md%22:0.4868035190615836,%22mx%22:1,%22interiorColor%22:%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%22arr%22:%5B%7B%22s%22:0,%22c%22:%7B%22r%22:0,%22g%22:0,%22b%22:0%7D%7D,%7B%22s%22:0.001466275659824047,%22c%22:%7B%22r%22:0,%22g%22:0,%22b%22:0%7D%7D,%7B%22s%22:0.4897360703812317,%22c%22:%7B%22r%22:250,%22g%22:255,%22b%22:115%7D%7D,%7B%22s%22:1,%22c%22:%7B%22r%22:106,%22g%22:103,%22b%22:255%7D%7D%5D,%22compiledArray%22:%5B%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%7B%22r%22:1,%22g%22:1,%22b%22:0%7D,%7B%22r%22:3,%22g%22:3,%22b%22:1%7D,%7B%22r%22:5,%22g%22:5,%22b%22:2%7D,%7B%22r%22:8,%22g%22:8,%22b%22:3%7D,%7B%22r%22:10,%22g%22:10,%22b%22:5%7D,%7B%22r%22:12,%22g%22:12,%22b%22:6%7D,%7B%22r%22:14,%22g%22:15,%22b%22:7%7D,%7B%22r%22:17,%22g%22:17,%22b%22:8%7D,%7B%22r%22:19,%22g%22:19,%22b%22:9%7D,%7B%22r%22:21,%22g%22:22,%22b%22:10%7D,%7B%22r%22:24,%22g%22:24,%22b%22:11%7D,%7B%22r%22:26,%22g%22:27,%22b%22:12%7D,%7B%22r%22:28,%22g%22:29,%22b%22:13%7D,%7B%22r%22:31,%22g%22:31,%22b%22:14%7D,%7B%22r%22:33,%22g%22:34,%22b%22:15%7D,%7B%22r%22:35,%22g%22:36,%22b%22:16%7D,%7B%22r%22:38,%22g%22:38,%22b%22:17%7D,%7B%22r%22:40,%22g%22:41,%22b%22:18%7D,%7B%22r%22:42,%22g%22:43,%22b%22:19%7D,%7B%22r%22:45,%22g%22:45,%22b%22:21%7D,%7B%22r%22:47,%22g%22:48,%22b%22:22%7D,%7B%22r%22:49,%22g%22:50,%22b%22:23%7D,%7B%22r%22:52,%22g%22:53,%22b%22:24%7D,%7B%22r%22:54,%22g%22:55,%22b%22:25%7D,%7B%22r%22:56,%22g%22:57,%22b%22:26%7D,%7B%22r%22:58,%22g%22:60,%22b%22:27%7D,%7B%22r%22:61,%22g%22:62,%22b%22:28%7D,%7B%22r%22:63,%22g%22:64,%22b%22:29%7D,%7B%22r%22:65,%22g%22:67,%22b%22:30%7D,%7B%22r%22:68,%22g%22:69,%22b%22:31%7D,%7B%22r%22:70,%22g%22:71,%22b%22:32%7D,%7B%22r%22:72,%22g%22:74,%22b%22:33%7D,%7B%22r%22:75,%22g%22:76,%22b%22:34%7D,%7B%22r%22:77,%22g%22:79,%22b%22:35%7D,%7B%22r%22:79,%22g%22:81,%22b%22:36%7D,%7B%22r%22:82,%22g%22:83,%22b%22:38%7D,%7B%22r%22:84,%22g%22:86,%22b%22:39%7D,%7B%22r%22:86,%22g%22:88,%22b%22:40%7D,%7B%22r%22:89,%22g%22:90,%22b%22:41%7D,%7B%22r%22:91,%22g%22:93,%22b%22:42%7D,%7B%22r%22:93,%22g%22:95,%22b%22:43%7D,%7B%22r%22:96,%22g%22:97,%22b%22:44%7D,%7B%22r%22:98,%22g%22:100,%22b%22:45%7D,%7B%22r%22:100,%22g%22:102,%22b%22:46%7D,%7B%22r%22:103,%22g%22:105,%22b%22:47%7D,%7B%22r%22:105,%22g%22:107,%22b%22:48%7D,%7B%22r%22:107,%22g%22:109,%22b%22:49%7D,%7B%22r%22:109,%22g%22:112,%22b%22:50%7D,%7B%22r%22:112,%22g%22:114,%22b%22:51%7D,%7B%22r%22:114,%22g%22:116,%22b%22:52%7D,%7B%22r%22:116,%22g%22:119,%22b%22:54%7D,%7B%22r%22:119,%22g%22:121,%22b%22:55%7D,%7B%22r%22:121,%22g%22:123,%22b%22:56%7D,%7B%22r%22:123,%22g%22:126,%22b%22:57%7D,%7B%22r%22:126,%22g%22:128,%22b%22:58%7D,%7B%22r%22:128,%22g%22:131,%22b%22:59%7D,%7B%22r%22:130,%22g%22:133,%22b%22:60%7D,%7B%22r%22:133,%22g%22:135,%22b%22:61%7D,%7B%22r%22:135,%22g%22:138,%22b%22:62%7D,%7B%22r%22:137,%22g%22:140,%22b%22:63%7D,%7B%22r%22:140,%22g%22:142,%22b%22:64%7D,%7B%22r%22:142,%22g%22:145,%22b%22:65%7D,%7B%22r%22:144,%22g%22:147,%22b%22:66%7D,%7B%22r%22:147,%22g%22:149,%22b%22:67%7D,%7B%22r%22:149,%22g%22:152,%22b%22:68%7D,%7B%22r%22:151,%22g%22:154,%22b%22:70%7D,%7B%22r%22:153,%22g%22:157,%22b%22:71%7D,%7B%22r%22:156,%22g%22:159,%22b%22:72%7D,%7B%22r%22:158,%22g%22:161,%22b%22:73%7D,%7B%22r%22:160,%22g%22:164,%22b%22:74%7D,%7B%22r%22:163,%22g%22:166,%22b%22:75%7D,%7B%22r%22:165,%22g%22:168,%22b%22:76%7D,%7B%22r%22:167,%22g%22:171,%22b%22:77%7D,%7B%22r%22:170,%22g%22:173,%22b%22:78%7D,%7B%22r%22:172,%22g%22:175,%22b%22:79%7D,%7B%22r%22:174,%22g%22:178,%22b%22:80%7D,%7B%22r%22:177,%22g%22:180,%22b%22:81%7D,%7B%22r%22:179,%22g%22:183,%22b%22:82%7D,%7B%22r%22:181,%22g%22:185,%22b%22:83%7D,%7B%22r%22:184,%22g%22:187,%22b%22:84%7D,%7B%22r%22:186,%22g%22:190,%22b%22:86%7D,%7B%22r%22:188,%22g%22:192,%22b%22:87%7D,%7B%22r%22:191,%22g%22:194,%22b%22:88%7D,%7B%22r%22:193,%22g%22:197,%22b%22:89%7D,%7B%22r%22:195,%22g%22:199,%22b%22:90%7D,%7B%22r%22:198,%22g%22:201,%22b%22:91%7D,%7B%22r%22:200,%22g%22:204,%22b%22:92%7D,%7B%22r%22:202,%22g%22:206,%22b%22:93%7D,%7B%22r%22:204,%22g%22:209,%22b%22:94%7D,%7B%22r%22:207,%22g%22:211,%22b%22:95%7D,%7B%22r%22:209,%22g%22:213,%22b%22:96%7D,%7B%22r%22:211,%22g%22:216,%22b%22:97%7D,%7B%22r%22:214,%22g%22:218,%22b%22:98%7D,%7B%22r%22:216,%22g%22:220,%22b%22:99%7D,%7B%22r%22:218,%22g%22:223,%22b%22:100%7D,%7B%22r%22:221,%22g%22:225,%22b%22:102%7D,%7B%22r%22:223,%22g%22:227,%22b%22:103%7D,%7B%22r%22:225,%22g%22:230,%22b%22:104%7D,%7B%22r%22:228,%22g%22:232,%22b%22:105%7D,%7B%22r%22:230,%22g%22:235,%22b%22:106%7D,%7B%22r%22:232,%22g%22:237,%22b%22:107%7D,%7B%22r%22:235,%22g%22:239,%22b%22:108%7D,%7B%22r%22:237,%22g%22:242,%22b%22:109%7D,%7B%22r%22:239,%22g%22:244,%22b%22:110%7D,%7B%22r%22:242,%22g%22:246,%22b%22:111%7D,%7B%22r%22:244,%22g%22:249,%22b%22:112%7D,%7B%22r%22:246,%22g%22:251,%22b%22:113%7D,%7B%22r%22:249,%22g%22:253,%22b%22:114%7D,%7B%22r%22:250,%22g%22:255,%22b%22:115%7D,%7B%22r%22:248,%22g%22:253,%22b%22:117%7D,%7B%22r%22:247,%22g%22:252,%22b%22:118%7D,%7B%22r%22:247,%22g%22:251,%22b%22:118%7D,%7B%22r%22:246,%22g%22:251,%22b%22:119%7D,%7B%22r%22:245,%22g%22:250,%22b%22:119%7D,%7B%22r%22:245,%22g%22:250,%22b%22:120%7D,%7B%22r%22:244,%22g%22:249,%22b%22:121%7D,%7B%22r%22:244,%22g%22:248,%22b%22:121%7D,%7B%22r%22:243,%22g%22:248,%22b%22:122%7D,%7B%22r%22:243,%22g%22:247,%22b%22:122%7D,%7B%22r%22:242,%22g%22:247,%22b%22:123%7D,%7B%22r%22:242,%22g%22:246,%22b%22:123%7D,%7B%22r%22:241,%22g%22:245,%22b%22:124%7D,%7B%22r%22:240,%22g%22:245,%22b%22:124%7D,%7B%22r%22:240,%22g%22:244,%22b%22:125%7D,%7B%22r%22:239,%22g%22:244,%22b%22:125%7D,%7B%22r%22:239,%22g%22:243,%22b%22:126%7D,%7B%22r%22:238,%22g%22:243,%22b%22:126%7D,%7B%22r%22:238,%22g%22:242,%22b%22:127%7D,%7B%22r%22:237,%22g%22:241,%22b%22:128%7D,%7B%22r%22:237,%22g%22:241,%22b%22:128%7D,%7B%22r%22:236,%22g%22:240,%22b%22:129%7D,%7B%22r%22:235,%22g%22:240,%22b%22:129%7D,%7B%22r%22:235,%22g%22:239,%22b%22:130%7D,%7B%22r%22:234,%22g%22:239,%22b%22:130%7D,%7B%22r%22:234,%22g%22:238,%22b%22:131%7D,%7B%22r%22:233,%22g%22:237,%22b%22:131%7D,%7B%22r%22:233,%22g%22:237,%22b%22:132%7D,%7B%22r%22:232,%22g%22:236,%22b%22:132%7D,%7B%22r%22:232,%22g%22:236,%22b%22:133%7D,%7B%22r%22:231,%22g%22:235,%22b%22:133%7D,%7B%22r%22:231,%22g%22:234,%22b%22:134%7D,%7B%22r%22:230,%22g%22:234,%22b%22:134%7D,%7B%22r%22:229,%22g%22:233,%22b%22:135%7D,%7B%22r%22:229,%22g%22:233,%22b%22:136%7D,%7B%22r%22:228,%22g%22:232,%22b%22:136%7D,%7B%22r%22:228,%22g%22:232,%22b%22:137%7D,%7B%22r%22:227,%22g%22:231,%22b%22:137%7D,%7B%22r%22:227,%22g%22:230,%22b%22:138%7D,%7B%22r%22:226,%22g%22:230,%22b%22:138%7D,%7B%22r%22:226,%22g%22:229,%22b%22:139%7D,%7B%22r%22:225,%22g%22:229,%22b%22:139%7D,%7B%22r%22:224,%22g%22:228,%22b%22:140%7D,%7B%22r%22:224,%22g%22:227,%22b%22:140%7D,%7B%22r%22:223,%22g%22:227,%22b%22:141%7D,%7B%22r%22:223,%22g%22:226,%22b%22:141%7D,%7B%22r%22:222,%22g%22:226,%22b%22:142%7D,%7B%22r%22:222,%22g%22:225,%22b%22:143%7D,%7B%22r%22:221,%22g%22:225,%22b%22:143%7D,%7B%22r%22:221,%22g%22:224,%22b%22:144%7D,%7B%22r%22:220,%22g%22:223,%22b%22:144%7D,%7B%22r%22:220,%22g%22:223,%22b%22:145%7D,%7B%22r%22:219,%22g%22:222,%22b%22:145%7D,%7B%22r%22:218,%22g%22:222,%22b%22:146%7D,%7B%22r%22:218,%22g%22:221,%22b%22:146%7D,%7B%22r%22:217,%22g%22:220,%22b%22:147%7D,%7B%22r%22:217,%22g%22:220,%22b%22:147%7D,%7B%22r%22:216,%22g%22:219,%22b%22:148%7D,%7B%22r%22:216,%22g%22:219,%22b%22:148%7D,%7B%22r%22:215,%22g%22:218,%22b%22:149%7D,%7B%22r%22:215,%22g%22:218,%22b%22:149%7D,%7B%22r%22:214,%22g%22:217,%22b%22:150%7D,%7B%22r%22:213,%22g%22:216,%22b%22:151%7D,%7B%22r%22:213,%22g%22:216,%22b%22:151%7D,%7B%22r%22:212,%22g%22:215,%22b%22:152%7D,%7B%22r%22:212,%22g%22:215,%22b%22:152%7D,%7B%22r%22:211,%22g%22:214,%22b%22:153%7D,%7B%22r%22:211,%22g%22:214,%22b%22:153%7D,%7B%22r%22:210,%22g%22:213,%22b%22:154%7D,%7B%22r%22:210,%22g%22:212,%22b%22:154%7D,%7B%22r%22:209,%22g%22:212,%22b%22:155%7D,%7B%22r%22:208,%22g%22:211,%22b%22:155%7D,%7B%22r%22:208,%22g%22:211,%22b%22:156%7D,%7B%22r%22:207,%22g%22:210,%22b%22:156%7D,%7B%22r%22:207,%22g%22:209,%22b%22:157%7D,%7B%22r%22:206,%22g%22:209,%22b%22:158%7D,%7B%22r%22:206,%22g%22:208,%22b%22:158%7D,%7B%22r%22:205,%22g%22:208,%22b%22:159%7D,%7B%22r%22:205,%22g%22:207,%22b%22:159%7D,%7B%22r%22:204,%22g%22:207,%22b%22:160%7D,%7B%22r%22:204,%22g%22:206,%22b%22:160%7D,%7B%22r%22:203,%22g%22:205,%22b%22:161%7D,%7B%22r%22:202,%22g%22:205,%22b%22:161%7D,%7B%22r%22:202,%22g%22:204,%22b%22:162%7D,%7B%22r%22:201,%22g%22:204,%22b%22:162%7D,%7B%22r%22:201,%22g%22:203,%22b%22:163%7D,%7B%22r%22:200,%22g%22:202,%22b%22:163%7D,%7B%22r%22:200,%22g%22:202,%22b%22:164%7D,%7B%22r%22:199,%22g%22:201,%22b%22:164%7D,%7B%22r%22:199,%22g%22:201,%22b%22:165%7D,%7B%22r%22:198,%22g%22:200,%22b%22:166%7D,%7B%22r%22:197,%22g%22:200,%22b%22:166%7D,%7B%22r%22:197,%22g%22:199,%22b%22:167%7D,%7B%22r%22:196,%22g%22:198,%22b%22:167%7D,%7B%22r%22:196,%22g%22:198,%22b%22:168%7D,%7B%22r%22:195,%22g%22:197,%22b%22:168%7D,%7B%22r%22:195,%22g%22:197,%22b%22:169%7D,%7B%22r%22:194,%22g%22:196,%22b%22:169%7D,%7B%22r%22:194,%22g%22:195,%22b%22:170%7D,%7B%22r%22:193,%22g%22:195,%22b%22:170%7D,%7B%22r%22:193,%22g%22:194,%22b%22:171%7D,%7B%22r%22:192,%22g%22:194,%22b%22:171%7D,%7B%22r%22:191,%22g%22:193,%22b%22:172%7D,%7B%22r%22:191,%22g%22:193,%22b%22:173%7D,%7B%22r%22:190,%22g%22:192,%22b%22:173%7D,%7B%22r%22:190,%22g%22:191,%22b%22:174%7D,%7B%22r%22:189,%22g%22:191,%22b%22:174%7D,%7B%22r%22:189,%22g%22:190,%22b%22:175%7D,%7B%22r%22:188,%22g%22:190,%22b%22:175%7D,%7B%22r%22:188,%22g%22:189,%22b%22:176%7D,%7B%22r%22:187,%22g%22:188,%22b%22:176%7D,%7B%22r%22:186,%22g%22:188,%22b%22:177%7D,%7B%22r%22:186,%22g%22:187,%22b%22:177%7D,%7B%22r%22:185,%22g%22:187,%22b%22:178%7D,%7B%22r%22:185,%22g%22:186,%22b%22:178%7D,%7B%22r%22:184,%22g%22:186,%22b%22:179%7D,%7B%22r%22:184,%22g%22:185,%22b%22:179%7D,%7B%22r%22:183,%22g%22:184,%22b%22:180%7D,%7B%22r%22:183,%22g%22:184,%22b%22:181%7D,%7B%22r%22:182,%22g%22:183,%22b%22:181%7D,%7B%22r%22:181,%22g%22:183,%22b%22:182%7D,%7B%22r%22:181,%22g%22:182,%22b%22:182%7D,%7B%22r%22:180,%22g%22:182,%22b%22:183%7D,%7B%22r%22:180,%22g%22:181,%22b%22:183%7D,%7B%22r%22:179,%22g%22:180,%22b%22:184%7D,%7B%22r%22:179,%22g%22:180,%22b%22:184%7D,%7B%22r%22:178,%22g%22:179,%22b%22:185%7D,%7B%22r%22:178,%22g%22:179,%22b%22:185%7D,%7B%22r%22:177,%22g%22:178,%22b%22:186%7D,%7B%22r%22:177,%22g%22:177,%22b%22:186%7D,%7B%22r%22:176,%22g%22:177,%22b%22:187%7D,%7B%22r%22:175,%22g%22:176,%22b%22:188%7D,%7B%22r%22:175,%22g%22:176,%22b%22:188%7D,%7B%22r%22:174,%22g%22:175,%22b%22:189%7D,%7B%22r%22:174,%22g%22:175,%22b%22:189%7D,%7B%22r%22:173,%22g%22:174,%22b%22:190%7D,%7B%22r%22:173,%22g%22:173,%22b%22:190%7D,%7B%22r%22:172,%22g%22:173,%22b%22:191%7D,%7B%22r%22:172,%22g%22:172,%22b%22:191%7D,%7B%22r%22:171,%22g%22:172,%22b%22:192%7D,%7B%22r%22:170,%22g%22:171,%22b%22:192%7D,%7B%22r%22:170,%22g%22:170,%22b%22:193%7D,%7B%22r%22:169,%22g%22:170,%22b%22:193%7D,%7B%22r%22:169,%22g%22:169,%22b%22:194%7D,%7B%22r%22:168,%22g%22:169,%22b%22:194%7D,%7B%22r%22:168,%22g%22:168,%22b%22:195%7D,%7B%22r%22:167,%22g%22:168,%22b%22:196%7D,%7B%22r%22:167,%22g%22:167,%22b%22:196%7D,%7B%22r%22:166,%22g%22:166,%22b%22:197%7D,%7B%22r%22:166,%22g%22:166,%22b%22:197%7D,%7B%22r%22:165,%22g%22:165,%22b%22:198%7D,%7B%22r%22:164,%22g%22:165,%22b%22:198%7D,%7B%22r%22:164,%22g%22:164,%22b%22:199%7D,%7B%22r%22:163,%22g%22:163,%22b%22:199%7D,%7B%22r%22:163,%22g%22:163,%22b%22:200%7D,%7B%22r%22:162,%22g%22:162,%22b%22:200%7D,%7B%22r%22:162,%22g%22:162,%22b%22:201%7D,%7B%22r%22:161,%22g%22:161,%22b%22:201%7D,%7B%22r%22:161,%22g%22:161,%22b%22:202%7D,%7B%22r%22:160,%22g%22:160,%22b%22:203%7D,%7B%22r%22:159,%22g%22:159,%22b%22:203%7D,%7B%22r%22:159,%22g%22:159,%22b%22:204%7D,%7B%22r%22:158,%22g%22:158,%22b%22:204%7D,%7B%22r%22:158,%22g%22:158,%22b%22:205%7D,%7B%22r%22:157,%22g%22:157,%22b%22:205%7D,%7B%22r%22:157,%22g%22:157,%22b%22:206%7D,%7B%22r%22:156,%22g%22:156,%22b%22:206%7D,%7B%22r%22:156,%22g%22:155,%22b%22:207%7D,%7B%22r%22:155,%22g%22:155,%22b%22:207%7D,%7B%22r%22:154,%22g%22:154,%22b%22:208%7D,%7B%22r%22:154,%22g%22:154,%22b%22:208%7D,%7B%22r%22:153,%22g%22:153,%22b%22:209%7D,%7B%22r%22:153,%22g%22:152,%22b%22:209%7D,%7B%22r%22:152,%22g%22:152,%22b%22:210%7D,%7B%22r%22:152,%22g%22:151,%22b%22:211%7D,%7B%22r%22:151,%22g%22:151,%22b%22:211%7D,%7B%22r%22:151,%22g%22:150,%22b%22:212%7D,%7B%22r%22:150,%22g%22:150,%22b%22:212%7D,%7B%22r%22:150,%22g%22:149,%22b%22:213%7D,%7B%22r%22:149,%22g%22:148,%22b%22:213%7D,%7B%22r%22:148,%22g%22:148,%22b%22:214%7D,%7B%22r%22:148,%22g%22:147,%22b%22:214%7D,%7B%22r%22:147,%22g%22:147,%22b%22:215%7D,%7B%22r%22:147,%22g%22:146,%22b%22:215%7D,%7B%22r%22:146,%22g%22:145,%22b%22:216%7D,%7B%22r%22:146,%22g%22:145,%22b%22:216%7D,%7B%22r%22:145,%22g%22:144,%22b%22:217%7D,%7B%22r%22:145,%22g%22:144,%22b%22:218%7D,%7B%22r%22:144,%22g%22:143,%22b%22:218%7D,%7B%22r%22:143,%22g%22:143,%22b%22:219%7D,%7B%22r%22:143,%22g%22:142,%22b%22:219%7D,%7B%22r%22:142,%22g%22:141,%22b%22:220%7D,%7B%22r%22:142,%22g%22:141,%22b%22:220%7D,%7B%22r%22:141,%22g%22:140,%22b%22:221%7D,%7B%22r%22:141,%22g%22:140,%22b%22:221%7D,%7B%22r%22:140,%22g%22:139,%22b%22:222%7D,%7B%22r%22:140,%22g%22:138,%22b%22:222%7D,%7B%22r%22:139,%22g%22:138,%22b%22:223%7D,%7B%22r%22:139,%22g%22:137,%22b%22:223%7D,%7B%22r%22:138,%22g%22:137,%22b%22:224%7D,%7B%22r%22:137,%22g%22:136,%22b%22:224%7D,%7B%22r%22:137,%22g%22:136,%22b%22:225%7D,%7B%22r%22:136,%22g%22:135,%22b%22:226%7D,%7B%22r%22:136,%22g%22:134,%22b%22:226%7D,%7B%22r%22:135,%22g%22:134,%22b%22:227%7D,%7B%22r%22:135,%22g%22:133,%22b%22:227%7D,%7B%22r%22:134,%22g%22:133,%22b%22:228%7D,%7B%22r%22:134,%22g%22:132,%22b%22:228%7D,%7B%22r%22:133,%22g%22:131,%22b%22:229%7D,%7B%22r%22:132,%22g%22:131,%22b%22:229%7D,%7B%22r%22:132,%22g%22:130,%22b%22:230%7D,%7B%22r%22:131,%22g%22:130,%22b%22:230%7D,%7B%22r%22:131,%22g%22:129,%22b%22:231%7D,%7B%22r%22:130,%22g%22:129,%22b%22:231%7D,%7B%22r%22:130,%22g%22:128,%22b%22:232%7D,%7B%22r%22:129,%22g%22:127,%22b%22:233%7D,%7B%22r%22:129,%22g%22:127,%22b%22:233%7D,%7B%22r%22:128,%22g%22:126,%22b%22:234%7D,%7B%22r%22:127,%22g%22:126,%22b%22:234%7D,%7B%22r%22:127,%22g%22:125,%22b%22:235%7D,%7B%22r%22:126,%22g%22:125,%22b%22:235%7D,%7B%22r%22:126,%22g%22:124,%22b%22:236%7D,%7B%22r%22:125,%22g%22:123,%22b%22:236%7D,%7B%22r%22:125,%22g%22:123,%22b%22:237%7D,%7B%22r%22:124,%22g%22:122,%22b%22:237%7D,%7B%22r%22:124,%22g%22:122,%22b%22:238%7D,%7B%22r%22:123,%22g%22:121,%22b%22:238%7D,%7B%22r%22:123,%22g%22:120,%22b%22:239%7D,%7B%22r%22:122,%22g%22:120,%22b%22:239%7D,%7B%22r%22:121,%22g%22:119,%22b%22:240%7D,%7B%22r%22:121,%22g%22:119,%22b%22:241%7D,%7B%22r%22:120,%22g%22:118,%22b%22:241%7D,%7B%22r%22:120,%22g%22:118,%22b%22:242%7D,%7B%22r%22:119,%22g%22:117,%22b%22:242%7D,%7B%22r%22:119,%22g%22:116,%22b%22:243%7D,%7B%22r%22:118,%22g%22:116,%22b%22:243%7D,%7B%22r%22:118,%22g%22:115,%22b%22:244%7D,%7B%22r%22:117,%22g%22:115,%22b%22:244%7D,%7B%22r%22:116,%22g%22:114,%22b%22:245%7D,%7B%22r%22:116,%22g%22:113,%22b%22:245%7D,%7B%22r%22:115,%22g%22:113,%22b%22:246%7D,%7B%22r%22:115,%22g%22:112,%22b%22:246%7D,%7B%22r%22:114,%22g%22:112,%22b%22:247%7D,%7B%22r%22:114,%22g%22:111,%22b%22:248%7D,%7B%22r%22:113,%22g%22:111,%22b%22:248%7D,%7B%22r%22:113,%22g%22:110,%22b%22:249%7D,%7B%22r%22:112,%22g%22:109,%22b%22:249%7D,%7B%22r%22:112,%22g%22:109,%22b%22:250%7D,%7B%22r%22:111,%22g%22:108,%22b%22:250%7D,%7B%22r%22:110,%22g%22:108,%22b%22:251%7D,%7B%22r%22:110,%22g%22:107,%22b%22:251%7D,%7B%22r%22:109,%22g%22:106,%22b%22:252%7D,%7B%22r%22:109,%22g%22:106,%22b%22:252%7D,%7B%22r%22:108,%22g%22:105,%22b%22:253%7D,%7B%22r%22:108,%22g%22:105,%22b%22:253%7D,%7B%22r%22:107,%22g%22:104,%22b%22:254%7D,%7B%22r%22:107,%22g%22:104,%22b%22:254%7D,%7B%22r%22:106,%22g%22:103,%22b%22:255%7D,%7B%22r%22:0,%22g%22:0,%22b%22:0%7D%5D%7D&i=500&c=-0.6360253677463695,-0.38708669264908013&w=0.005019824996531184&p=0,0&r=3';
  readonly lib3: string = '?e=Mandelbrot&g=%7B"mn":0.21727019498607242,"md":0.5069637883008357,"mx":0.7298050139275766,"arr":%5B%7B"s":0,"c":%7B"r":255,"g":255,"b":255%7D%7D,%7B"s":0.06685236768802229,"c":%7B"r":0,"g":0,"b":0%7D%7D,%7B"s":0.18384401114206128,"c":%7B"r":13,"g":124,"b":87%7D%7D,%7B"s":0.3245125348189415,"c":%7B"r":0,"g":0,"b":0%7D%7D,%7B"s":1,"c":%7B"r":255,"g":255,"b":255%7D%7D%5D%7D&i=2076&c=-0.646696825417341,-0.45887499834005385&w=1.7974262295600662e-10&p=0,0&r=3.0';
  readonly lib4: string = '?e=Mandelbrot&g=%7B"mn":0.29605263157894735,"md":0.541267942583732,"mx":0.9455741626794258,"arr":%5B%7B"s":0,"c":%7B"r":0,"g":0,"b":0%7D%7D,%7B"s":0.023923444976076555,"c":%7B"r":0,"g":0,"b":0%7D%7D,%7B"s":0.2751196172248804,"c":%7B"r":168,"g":33,"b":75%7D%7D,%7B"s":0.49521531100478466,"c":%7B"r":255,"g":200,"b":0%7D%7D,%7B"s":0.8361244019138756,"c":%7B"r":255,"g":255,"b":255%7D%7D,%7B"s":1,"c":%7B"r":255,"g":255,"b":255%7D%7D%5D%7D&i=126&c=-0.9030906412416817,-0.27173533588606597&w=0.00048799920161527415&p=0,0&r=3.0';
  readonly lib5: string = '?e=Mandelbrot&g=%7B"mn":0.1742627345844504,"md":0.3646112600536193,"mx":0.6193029490616622,"arr":%5B%7B"s":0,"c":%7B"r":0,"g":0,"b":0%7D%7D,%7B"s":0.010723860589812333,"c":%7B"r":0,"g":0,"b":0%7D%7D,%7B"s":0.21983914209115282,"c":%7B"r":0,"g":51,"b":255%7D%7D,%7B"s":0.4932975871313673,"c":%7B"r":255,"g":200,"b":0%7D%7D,%7B"s":1,"c":%7B"r":255,"g":255,"b":255%7D%7D%5D%7D&i=402&c=-1.4173218221898123,0.1511562609199843&w=3.044615093243306e-8&p=0,0&r=3.0';
  readonly lib6: string = '?e=Mandelbrot&g=%7B"mn":0.23184357541899442,"md":0.3715083798882682,"mx":0.9050279329608939,"arr":%5B%7B"s":0,"c":%7B"r":0,"g":0,"b":0%7D%7D,%7B"s":0.36312849162011174,"c":%7B"r":201,"g":70,"b":207%7D%7D,%7B"s":0.5446927374301676,"c":%7B"r":255,"g":255,"b":255%7D%7D,%7B"s":0.8016759776536313,"c":%7B"r":124,"g":28,"b":124%7D%7D,%7B"s":1,"c":%7B"r":255,"g":255,"b":255%7D%7D%5D%7D&i=704&c=-0.7244526943744225,-0.28346596747692615&w=0.00019821015408880892&p=0,0&r=3.0';
  readonly lib7: string = '?e=Julia&g=%7B%22mn%22:0.2653958944281525,%22md%22:0.4868035190615836,%22mx%22:1,%22interiorColor%22:%7B%22r%22:0,%22g%22:0,%22b%22:0%7D,%22arr%22:%5B%7B%22s%22:0,%22c%22:%7B%22r%22:0,%22g%22:0,%22b%22:0%7D%7D,%7B%22s%22:0.001466275659824047,%22c%22:%7B%22r%22:0,%22g%22:0,%22b%22:0%7D%7D,%7B%22s%22:0.4897360703812317,%22c%22:%7B%22r%22:250,%22g%22:255,%22b%22:115%7D%7D,%7B%22s%22:1,%22c%22:%7B%22r%22:106,%22g%22:103,%22b%22:255%7D%7D%5D%7D&i=704&c=-0.07960284180869573,-0.49874836560785907&w=0.43637672835541086&p=0.1761133603238867,-0.5653553299492386&r=3'

  private fractal: Fractals.Fractal;
  private iterationsAreChanging: boolean = false;
  private activeSection: ElementRef = this.saveSection;
  private favorites: Array<string> = new Array();

  public complexJuliaPicker: string = "-0.7,0.0";
  public juliaPickerWidth: string = "3";
  public imageToDownload: string = null;
  public NumIterations: number = 50;

  constructor(public platform: Platform, private socialSharing: SocialSharing, private photoLibrary: PhotoLibrary, private androidFullScreen: AndroidFullScreen, private toastCtrl: ToastController, private storage: Storage) {
    this.socialSharing = socialSharing;
    this.photoLibrary = photoLibrary;
    this.platform = platform;
    this.toastCtrl = toastCtrl;
    this.storage = storage;

    console.log("this.platform", this.platform.platforms());

    if (this.platform.is("android") && this.platform.is("cordova")) {
      androidFullScreen.isImmersiveModeSupported()
        .then(() => androidFullScreen.immersiveMode())
        .catch((error: any) => console.log(error));
    }
  }

  ngOnInit() {
    this.HTMLjuliaPullOut.nativeElement.style.display = "none"
    this.HTMLgradient.setColorPicker(this.HTMLjscolor);

    if (this.platform.is("android") && this.platform.is("cordova")) {
      this.HTMLzoomControls.nativeElement.style.display = "none";
    }
    else {
      // this.HTMLalertComponent.titleStr = "Welcome";
      // this.HTMLalertComponent.textStr = "For the best experence run fullscreen";
      // this.HTMLalertComponent.enableOptions(false, true, true);
      // this.HTMLalertComponent.setCallback(function (result) {
      //   if (result == "yes") {
      //     this.requestNativeFullScreen();
      //   }
      //   this.closeAlert();
      // }.bind(this)) 
      // this.HTMLalert.nativeElement.style.visibility = "visible";
    }

    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;

    let gradient = new FractalColor.LinearGradient();
    gradient.decodeJSON(this.colorBW)

    this.fractal = new Fractals.Fractal(new Fractals.ComplexPlain(-0.8, 0, 3, canvas), new FractalEquations.Mandelbrot, gradient);
    this.fractal.iterations = this.NumIterations;
    this.fractal.setMaxZoomListener(this);
    this.mainFractalView.setFractal(this.fractal);
    this.fractal.render();
    this.fractal.getColor().subscribe(this);
    this.linearGradientChanged();

    this.ngModelChangeIterations();

    this.storage.get("favorites").then((val) => {
      if (val != null) this.favorites = val;
    });
  }

  init(url: string) {
    var equation = "Mandelbrot";
    var complexCenter = "-0.8, 0";
    var complexWidthStr = "3";
    var colorStr = this.colorBW;
    var fractalEq: FractalEquations.equation = new FractalEquations.Mandelbrot;

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
        equation = element[1];
      }
      if (element[0] == "g") {
        colorStr = element[1];
      }
      if (element[0] == "i") {
        this.NumIterations = parseInt(element[1])
        this.ngModelChangeIterations();
      }
      if (element[0] == "c") {
        complexCenter = element[1];
      }
      if (element[0] == "w") {
        complexWidthStr = element[1];
      }
      if (element[0] == "p") {
        this.complexJuliaPicker = element[1];
      }
      if (element[0] == "r") {
        this.juliaPickerWidth = element[1];
        let juliaPickerWidth = parseFloat(this.juliaPickerWidth);
      }
    }


    var centerArr = complexCenter.split(",");
    var centerR = parseFloat(centerArr[0]);
    var centerI = parseFloat(centerArr[1]);
    var complexWidth = parseFloat(complexWidthStr);
    this.fractal.getColor().decodeJSON(colorStr);
    this.fractal.iterations = this.NumIterations;

    if (equation == "MandelbrotPow4") {
      fractalEq = new FractalEquations.MandelbrotPow4;
    }
    if (equation == "MandelbrotPow6") {
      fractalEq = new FractalEquations.MandelbrotPow6;
    }
    if (equation == "Tricorn") {
      fractalEq = new FractalEquations.Tricorn;
    }
    if (equation == "BurningShip") {
      fractalEq = new FractalEquations.BurningShip;
    }
    if (equation == "Julia") {
      fractalEq = new FractalEquations.Julia;
      let jNumStr = this.complexJuliaPicker.split(",");
      (<FractalEquations.Julia>fractalEq).juliaReal = parseFloat(jNumStr[0]);
      (<FractalEquations.Julia>fractalEq).juliaImaginary = parseFloat(jNumStr[1]);
      this.HTMLjuliaPullOut.nativeElement.style.display = "block";
      this.clickJuliaPullOut(true);
    }
    else {
      this.HTMLjuliaPullOut.nativeElement.style.display = "none";
    }

    this.fractal.complexPlain.replaceView(centerR, centerI, complexWidth, <HTMLCanvasElement>this.mainFractalView.getCanvas())
    this.fractal.setCalculationFunction(fractalEq);
    this.fractal.render();
  }

  /*
  * User triggerable functions \/
  */

  onEqChanged(eqString) {
    if (eqString == "Mandelbrot") {
      this.fractal.complexPlain.replaceView(-0.8, 0, 3, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.Mandelbrot);
    }
    if (eqString == "MandelbrotPow4") {
      this.fractal.complexPlain.replaceView(-0.8, 0, 3, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.MandelbrotPow4);
    }
    if (eqString == "MandelbrotPow6") {
      this.fractal.complexPlain.replaceView(-0.8, 0, 3, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.MandelbrotPow6);
    }
    if (eqString == "Tricorn") {
      this.fractal.complexPlain.replaceView(-0.8, 0, 3, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.Tricorn);
    }
    else if (eqString == "BurningShip") {
      this.fractal.complexPlain.replaceView(-0.5, -0.5, 3, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      this.fractal.setCalculationFunction(new FractalEquations.BurningShip);
    }

    if (eqString == "Julia") {
      this.fractal.complexPlain.replaceView(0, 0, 4.6, <HTMLCanvasElement>this.mainFractalView.getCanvas())
      var julia = new FractalEquations.Julia;
      julia.juliaReal = -0.7;
      julia.juliaImaginary = 0.0;
      this.fractal.setCalculationFunction(julia);
      this.HTMLjuliaPullOut.nativeElement.style.display = "block";
      this.complexJuliaPicker = "-0.7,0.0";
      this.juliaPickerWidth = "3";
      this.clickJuliaPullOut(true);
      this.HTMLjuliaPicker.getFractalView().sizeChanged();
    }
    else {
      this.HTMLjuliaPullOut.nativeElement.style.display = "none"
    }
    this.clickWebView(false);
    this.fractal.render();
  }

  onGradientChanged(gradient) {
    this.clickWebView(false);
    this.fractal.getColor().decodeJSON(gradient);
    this.fractal.getColor().notify(null);
  }

  onLibrarySelection(event, str: string) {
    this.init(str);
    this.clickWebView(false);
  }

  startChangingIterations(i) {
    if (this.iterationsAreChanging) return;
    this.updateNumIterations(i);
    this.animateIterations(i);
  }

  stopChangingIterations() {
    this.iterationsAreChanging = false;
  }

  ngModelChangeIterations() {
    if (this.NumIterations < 2) {
      this.NumIterations = 2;
      this.iterationsAreChanging = false;
    }
    this.fractal.iterations = this.NumIterations;
    this.HTMLjuliaPicker.setIterations(this.NumIterations);
    this.fractal.render();

    this.itSpan.nativeElement.innerHTML = this.NumIterations;
    var width = getComputedStyle(this.itSpan.nativeElement).width;
    this.itInput.nativeElement.style.width = width;
  }

  saveSize(val) {
    this.clickWebView(true);
    this.HTMLsaveButton.nativeElement.setAttribute("class", "btn disabled");
    let width = this.fractal.complexPlain.getViewCanvas().width * val;
    let height = this.fractal.complexPlain.getViewCanvas().height * val;
    this.saveJpg(width, height);
  }

  clickSave(event) {
    this.HTMLwebView.nativeElement.setAttribute("class", "web-view open-full");
    this.setWebViewSection(this.saveSection);
    this.HTMLsaveButton.nativeElement.setAttribute("class", "btn");
    if (this.mainFractalView.abortDownload()) this.toastCtrl.create({
      message: 'Image save aborted',
      duration: 1000,
      position: 'bottom'
    }).present();
  }

  clickLibrary() {
    this.HTMLwebView.nativeElement.setAttribute("class", "web-view open-full");
    this.setWebViewSection(this.librarySection);
    window.dispatchEvent(new Event('resize'));
  }

  clickFavorite() {
    this.HTMLwebView.nativeElement.setAttribute("class", "web-view open-full");
    this.setWebViewSection(this.favoritesSection);
    window.dispatchEvent(new Event('resize'));
  }

  addToFavorites() {
    var url = this.getShareURL();
    this.favorites.unshift(url);
    this.storage.set('favorites', this.favorites);
  }

  deleteFavorite(event, fav: string) {
    event.stopPropagation();
    this.HTMLalertComponent.titleStr = "Delete"
    this.HTMLalertComponent.textStr = "Are you sure you want to delete this favorate?."
    this.HTMLalertComponent.noStr = "Cancel"
    this.HTMLalertComponent.yesStr = "Delete"
    this.HTMLalertComponent.enableOptions(false, true, true);
    this.HTMLalertComponent.setCallback(function (str) {
      if (str == "yes") {
        var index = this.favorites.indexOf(fav);
        if (index !== -1) {
          this.favorites.splice(index, 1);
        }
        this.storage.set('favorites', this.favorites);
        this.closeAlert(null);
      }
      else {
        this.closeAlert(null);
      }
    }.bind(this))
    this.HTMLalert.nativeElement.style.visibility = "visible";
  }

  clickEquation() {
    this.HTMLwebView.nativeElement.setAttribute("class", "web-view open-full");
    this.setWebViewSection(this.equationSection);
  }

  clickGradient() {
    this.HTMLwebView.nativeElement.setAttribute("class", "web-view open-full");
    this.setWebViewSection(this.gradientSection);
    window.dispatchEvent(new Event('resize'));
  }

  clickShare(event) {
    this.clickWebView(false);
    var content = this.getShareURL();

    if (this.platform.is("android") && this.platform.is("cordova")) {
      console.log("android share triggered");
      this.socialSharing.share("", "", null, content)
    } else {
      var textArea, copy, range, selection;

      textArea = document.createElement('textArea');
      textArea.value = content;
      textArea.style.fontSize = "xx-large";
      document.body.appendChild(textArea);

      if (navigator.userAgent.match(/ipad|iphone/i)) {
        range = document.createRange();
        range.selectNodeContents(textArea);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.select();
      }

      document.execCommand('copy');
      document.body.removeChild(textArea);

      this.HTMLalertComponent.titleStr = "Share Link"
      this.HTMLalertComponent.textStr = "The URL has been copied to your clipboard."
      this.HTMLalertComponent.noStr = "Close"
      this.HTMLalertComponent.enableOptions(false, false, true)
      this.HTMLalertComponent.setCallback(this.closeAlert.bind(this))
      this.HTMLalert.nativeElement.style.visibility = "visible";
    }

  }

  clickZoomOut(event) {
    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    this.fractal.getAnimator().zoomStart(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 0.5, 200);
  }

  clickZoomIn(event) {
    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    this.fractal.getAnimator().zoomStart(canvas.offsetWidth / 2, canvas.offsetHeight / 2, 2, 200);
  }

  clickEye() {
    if (this.HTMLeyeControls.nativeElement.className == "fa fa-eye") {
      this.HTMLeyeControls.nativeElement.className = "fa fa-eye-slash";
      this.HTMLzoomControls.nativeElement.classList.remove("fade-hide");
      this.HTMLzoomControls.nativeElement.classList.remove("fade-hide");
      this.HTMLiterationControls.nativeElement.classList.remove("fade-hide");
      this.HTMLcolorPullDown.nativeElement.classList.remove("fade-hide");
      this.HTMLjuliaPullOut.nativeElement.classList.remove("fade-hide");
      this.HTMLwebView.nativeElement.classList.remove("fade-hide");

      this.HTMLzoomControls.nativeElement.classList.add("fade-show");
      this.HTMLzoomControls.nativeElement.classList.add("fade-show");
      this.HTMLiterationControls.nativeElement.classList.add("fade-show");
      this.HTMLcolorPullDown.nativeElement.classList.add("fade-show");
      this.HTMLjuliaPullOut.nativeElement.classList.add("fade-show");
      this.HTMLwebView.nativeElement.classList.add("fade-show");
    }
    else {
      this.closeAllPullOuts();
      this.HTMLeyeControls.nativeElement.className = "fa fa-eye";
      this.HTMLzoomControls.nativeElement.classList.add("fade-hide");
      this.HTMLzoomControls.nativeElement.classList.add("fade-hide");
      this.HTMLiterationControls.nativeElement.classList.add("fade-hide");
      this.HTMLcolorPullDown.nativeElement.classList.add("fade-hide");
      this.HTMLjuliaPullOut.nativeElement.classList.add("fade-hide");
      this.HTMLwebView.nativeElement.classList.add("fade-hide");

      this.HTMLzoomControls.nativeElement.classList.remove("fade-show");
      this.HTMLzoomControls.nativeElement.classList.remove("fade-show");
      this.HTMLiterationControls.nativeElement.classList.remove("fade-show");
      this.HTMLcolorPullDown.nativeElement.classList.remove("fade-show");
      this.HTMLjuliaPullOut.nativeElement.classList.remove("fade-show");
      this.HTMLwebView.nativeElement.classList.remove("fade-show");
    }
  }

  clickJuliaPullOut(openView: boolean = null) {
    if (openView == null) {
      openView = this.HTMLjuliaPullOut.nativeElement.className.indexOf("close") > -1
    }

    if (openView) {
      this.HTMLjuliaPullOut.nativeElement.classList.remove("close");
      this.HTMLjuliaPullOut.nativeElement.classList.add("open");
      let width = parseFloat(this.juliaPickerWidth);
      let centerJuliaPicker = this.complexJuliaPicker.split(",");
      let centercenterJuliaPickerR = parseFloat(centerJuliaPicker[0]);
      let centercenterJuliaPickerI = parseFloat(centerJuliaPicker[1]);
      if (!this.HTMLjuliaPicker.hasInit) {
        this.HTMLjuliaPicker.init(this.fractal.getColor(), this.NumIterations, centercenterJuliaPickerR, centercenterJuliaPickerI, width);
      }
      else {
        this.HTMLjuliaPicker.mainFractalView.getFractal().complexPlain.replaceView(centercenterJuliaPickerR, centercenterJuliaPickerI, width, this.HTMLjuliaPicker.mainFractalView.getCanvas());
        this.HTMLjuliaPicker.getFractalView().getFractal().iterations = this.NumIterations;
        this.HTMLjuliaPicker.mainFractalView.getFractal().render();
      }
      this.HTMLjuliaPicker.isOnScreen = true;
    }
    else {
      this.HTMLjuliaPullOut.nativeElement.classList.remove("open");
      this.HTMLjuliaPullOut.nativeElement.classList.add("close");
      this.HTMLjuliaPicker.isOnScreen = false;
    }
  }

  clickColorPullDown(openView: boolean = null) {
    if (openView == null) {
      var openView = this.HTMLcolorPullDown.nativeElement.className.indexOf("close") > -1
    }
    if (openView) {
      this.HTMLgradient.setGradient(this.fractal.getColor());
      this.HTMLhistogram.setFractal(this.fractal);
      this.HTMLcolorPullDown.nativeElement.classList.remove("close");
      this.HTMLcolorPullDown.nativeElement.classList.add("open");
      this.HTMLwebView.nativeElement.classList.remove("fade-show");
      this.HTMLwebView.nativeElement.classList.add("fade-hide");
      this.HTMLzoomControls.nativeElement.classList.remove("fade-show");
      this.HTMLzoomControls.nativeElement.classList.add("fade-hide");
      this.HTMLjuliaPullOut.nativeElement.classList.remove("fade-show");
      this.HTMLjuliaPullOut.nativeElement.classList.add("fade-hide");

    }
    else {
      this.HTMLgradient.setGradient(null);
      this.HTMLhistogram.setFractal(null);
      this.HTMLcolorPullDown.nativeElement.classList.remove("open");
      this.HTMLcolorPullDown.nativeElement.classList.add("close");
      this.HTMLwebView.nativeElement.classList.remove("fade-hide");
      this.HTMLwebView.nativeElement.classList.add("fade-show");
      this.HTMLzoomControls.nativeElement.classList.remove("fade-hide");
      this.HTMLzoomControls.nativeElement.classList.add("fade-show");
      this.HTMLjuliaPullOut.nativeElement.classList.remove("fade-hide");
      this.HTMLjuliaPullOut.nativeElement.classList.add("fade-show");
    }
  }

  clickWebView(openView: boolean = null) {
    if (openView == null) {
      var openView = this.HTMLwebView.nativeElement.className.indexOf("close") > -1
    }
    if (openView) {
      this.HTMLwebView.nativeElement.setAttribute("class", "web-view open");
    }
    else {
      this.HTMLwebView.nativeElement.setAttribute("class", "web-view close");
    }
    if (this.activeSection) this.activeSection.nativeElement.setAttribute("class", "hide");
  }

  swipeWebView(event, swipeLeftOpen = true, canOpen = true, canClose = true) {
    if (swipeLeftOpen) {
      if (canOpen && event.deltaX < 0) {
        this.clickWebView(true);
      }
      else if (canClose && event.deltaX > 0) {
        this.clickWebView(false);
      }
    }
    else {
      if (canOpen && event.deltaX > 0) {
        this.clickWebView(true);
      }
      else if (canClose && event.deltaX < 0) {
        this.clickWebView(false);
      }
    }
  }

  swipeColorPullDown(event) {
    if (event.deltaY > 0) {
      this.clickColorPullDown(true);
    }
    if (event.deltaY < 0) {
      this.clickColorPullDown(false);
    }
  }

  swipeJuliaPullOut(event) {
    if (event.deltaX > 0) {
      this.clickJuliaPullOut(true);
    }
    if (event.deltaX < 0) {
      this.clickJuliaPullOut(false);
    }
  }

  clickSetInteriorColor(event) {
    if (this.HTMLjscolor2.nativeElement.jscolor != undefined) this.HTMLjscolor2.nativeElement.jscolor.fromRGB(this.fractal.getColor().getInteriorColor());
    this.HTMLjscolor2.nativeElement.jscolor.show();
  }

  setInteriorColor(event) {
    let rgb = FractalColor.hexToRGB(this.HTMLjscolor2.nativeElement.jscolor.toHEXString());
    this.fractal.getColor().setInteriorColor(rgb);
    this.fractal.getColor().notify(null);
  }

  /*
  * Callbacks
  */

  linearGradientChanged() {
    var rgb = this.fractal.getColor().getInteriorColor();
    this.intColor.nativeElement.style.backgroundColor = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")"
  }

  maxZoomReached() {
    this.HTMLalertComponent.titleStr = "Alert"
    this.HTMLalertComponent.textStr = "You have reached the max zoom, What you can see are floting point errors as the diffrences between the numbers are so small!"
    this.HTMLalertComponent.noStr = "Continue"
    this.HTMLalertComponent.enableOptions(false, false, true)
    this.HTMLalertComponent.setCallback(function () {
      this.closeAlert(event)
      this.fractal.deleteMaxZoomListener();
    }.bind(this))
    this.HTMLalert.nativeElement.style.visibility = "visible";
  }

  juliaNumberChanged(center: ComplexNumber) {
    let fun = this.fractal.getCalculationFunction();
    if (fun instanceof FractalEquations.Julia) {
      (<FractalEquations.Julia>fun).juliaReal = center.r;
      (<FractalEquations.Julia>fun).juliaImaginary = center.i;
      this.fractal.render();
    }
  }

  /*
  * Private Functions \/
  */

  private animateIterations(i) {
    var self = this;
    this.iterationsAreChanging = true;
    this.fractal.stopRendering();
    setTimeout(function () {
      if (!self.iterationsAreChanging) return;

      self.updateNumIterations(i);

      self.animateIterations(i);
    }, 100);
  }

  private updateNumIterations(i: number) {
    if (i > 1) {
      this.NumIterations = Math.ceil(this.NumIterations * i)
    } else {
      this.NumIterations = Math.floor(this.NumIterations * i)
    }

    this.ngModelChangeIterations();
  }

  private requestNativeFullScreen() {
    let body = <any>document.body;
    let requestMethod = body.requestFullScreen || body.webkitRequestFullScreen || body.mozRequestFullScreen || body.msRequestFullScreen;
    if (requestMethod) {
      requestMethod.call(body);
    }
  }

  private exitNativeFullScreen() {
    let doc = <any>document;
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }

  private closeAllPullOuts() {
    this.clickColorPullDown(false)
    this.clickJuliaPullOut(false);
  }

  private updateSaveProgress() {
    if (this.HTMLsaveButton.nativeElement.classList.contains("disabled")) {
      this.HTMLsaveText.nativeElement.innerHTML = this.mainFractalView.getDownloadProgress() + "%"
      let self = this
      setTimeout(() => {
        self.updateSaveProgress()
      }, 50);
    }
    else {
      this.HTMLsaveText.nativeElement.innerHTML = 'Save';
    }

  }

  private saveJpg(width: number, height: number) {
    if (this.platform.is("cordova")) {
      var element = {
        base: <Fractals.ChangeObserver>{
          explorer: this,
          changed(fractal: Fractals.Fractal) {
            console.log("save callback")
            fractal.unsubscribe(element.base)
            this.explorer.imageToDownload = fractal.complexPlain.getViewCanvas().toDataURL("image/png");
            this.explorer.photoLibrary.requestAuthorization().then(() => {
              console.log("photo libray premission granted")
            }).catch(err => {
              console.log('permissions weren\'t granted ' + err)
              return;
            });
            var album = 'Fractal Explorer';
            var res = this.explorer.photoLibrary.saveImage(this.explorer.imageToDownload, album, function (libraryItem) { 
              console.log("libraryItem",libraryItem);
            }, function (err) {
              console.log("err",err);
             });

             console.log("res",res);

            this.explorer.HTMLalertComponent.titleStr = "All Done"
            this.explorer.HTMLalertComponent.textStr = "Image Saved."
            this.explorer.HTMLalertComponent.closeStr = "Close"
            this.explorer.HTMLalertComponent.enableOptions(true, false, false, false)
            this.explorer.HTMLalertComponent.setCallback(this.explorer.closeDownloadAlert.bind(this.explorer))
            this.explorer.HTMLalert.nativeElement.style.visibility = "visible";

            this.explorer.HTMLsaveButton.nativeElement.setAttribute("class", "btn");
          }
        }
      }
      this.mainFractalView.downloadImage(width, height, element.base);

      this.updateSaveProgress();
    }
    else {
      var element = {
        base: <Fractals.ChangeObserver>{
          explorer: this,
          changed(fractal: Fractals.Fractal) {
            fractal.unsubscribe(element.base)
            this.explorer.imageToDownload = fractal.complexPlain.getViewCanvas().toDataURL("image/jpeg");

            this.explorer.HTMLalertComponent.titleStr = "Download Ready"
            this.explorer.HTMLalertComponent.textStr = ""
            this.explorer.HTMLalertComponent.downloadStr = "Download"
            this.explorer.HTMLalertComponent.setYesHref(this.explorer.imageToDownload)
            this.explorer.HTMLalertComponent.noStr = "Cancel"
            this.explorer.HTMLalertComponent.enableOptions(true, false, true)
            this.explorer.HTMLalertComponent.setCallback(this.explorer.closeDownloadAlert.bind(this.explorer))
            this.explorer.HTMLalert.nativeElement.style.visibility = "visible";

            this.explorer.HTMLsaveButton.nativeElement.setAttribute("class", "btn");
          }
        }
      }
      this.mainFractalView.downloadImage(width, height, element.base);

      this.updateSaveProgress();
    }
  }

  private closeAlert(event) {
    if (getComputedStyle(this.HTMLalert.nativeElement).visibility == "visible") {
      this.HTMLalert.nativeElement.style.visibility = "hidden";
      return;
    }
  }

  private closeDownloadAlert(event) {
    this.mainFractalView.abortDownload();
    if (getComputedStyle(this.HTMLalert.nativeElement).visibility == "visible") {
      this.HTMLalert.nativeElement.style.visibility = "hidden";
      return;
    }
  }

  private setWebViewSection(section: ElementRef) {
    this.activeSection = section;
    section.nativeElement.setAttribute("class", "show");
    section.nativeElement.parentElement.scrollTop = 0;
  }

  private getShareURL() {
    var host = "https://leesavage.co.uk/?";


    let equation = this.fractal.getCalculationFunction().getName();
    let color = this.fractal.getColor().encodeJSON()
    let iterations = this.fractal.iterations.toString()
    let complexCenter = this.fractal.complexPlain.getSquare().center.toString();
    let complexWidth = this.fractal.complexPlain.getSquare().width.toString();
    let complexJuliaPicker = "0.0,0.0";
    let juliaWidth = "3";

    let fun = this.fractal.getCalculationFunction();
    if (fun instanceof FractalEquations.Julia) {
      let julia = <FractalEquations.Julia>fun;
      complexJuliaPicker = new ComplexNumber(julia.juliaReal, julia.juliaImaginary).toString()
      juliaWidth = this.HTMLjuliaPicker.getFractalView().getFractal().complexPlain.getSquare().width.toString();
    }

    let content = host + "e=" + equation + "&g=" + color + "&i=" + iterations + "&c=" + complexCenter + "&w=" + complexWidth + "&p=" + complexJuliaPicker + "&r=" + juliaWidth;
    return encodeURI(content);
  }
}
