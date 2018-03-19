import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Platform } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { ToastController } from 'ionic-angular';

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

  private fractal: Fractals.Fractal;
  private iterationsAreChanging: boolean = false;
  private activeSection: ElementRef = this.saveSection;

  public equation: string = "Mandelbrot";
  public color: string;
  public iterations: string = "50";
  public complexCenter: string = "-0.8, 0";
  public complexWidth: string = "3";
  public complexJuliaPicker: string = "-0.7,0.0";
  public juliaPickerWidth: string = "3";
  public imageToDownload: string = null;
  public NumIterations: number = 50;

  constructor(public platform: Platform, private socialSharing: SocialSharing, private photoLibrary: PhotoLibrary, private androidFullScreen: AndroidFullScreen, private toastCtrl: ToastController) {
    this.socialSharing = socialSharing;
    this.photoLibrary = photoLibrary;
    this.platform = platform;
    this.toastCtrl = toastCtrl;

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
  }

  init() {
    let centerArr = this.complexCenter.split(",");
    let centerR = parseFloat(centerArr[0]);
    let centerI = parseFloat(centerArr[1]);

    let complexWidth = parseFloat(this.complexWidth);

    this.NumIterations = parseInt(this.iterations)

    let juliaPickerWidth = parseFloat(this.juliaPickerWidth);

    let colorCommandString = this.colorBlackBlue;
    if (this.color != null) {
      colorCommandString = this.color;
    }

    let fractalEq: FractalEquations.equation = new FractalEquations.Mandelbrot;
    if (this.equation == "MandelbrotPow4") {
      fractalEq = new FractalEquations.MandelbrotPow4;
    }
    if (this.equation == "MandelbrotPow6") {
      fractalEq = new FractalEquations.MandelbrotPow6;
    }
    if (this.equation == "Tricorn") {
      fractalEq = new FractalEquations.Tricorn;
    }
    if (this.equation == "BurningShip") {
      fractalEq = new FractalEquations.BurningShip;
    }
    if (this.equation == "Julia") {
      fractalEq = new FractalEquations.Julia;
      let jNumStr = this.complexJuliaPicker.split(",");
      (<FractalEquations.Julia>fractalEq).juliaReal = parseFloat(jNumStr[0]);
      (<FractalEquations.Julia>fractalEq).juliaImaginary = parseFloat(jNumStr[1]);
      this.HTMLjuliaPullOut.nativeElement.style.display = "block";
      this.clickJuliaPullOut(true);
    }

    this.fractal.complexPlain.replaceView(centerR, centerI, complexWidth, <HTMLCanvasElement>this.mainFractalView.getCanvas())
    this.fractal.setCalculationFunction(fractalEq);
    this.fractal.getColor().decodeJSON(colorCommandString);
    this.fractal.iterations = this.NumIterations;
    this.fractal.render();
  }

  /*
  * User triggerable functions \/
  */


  windowResized() {
    this.mainFractalView.sizeChanged();
  }

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
      this.fractal.setCalculationFunction(new FractalEquations.Julia);
      this.HTMLjuliaPullOut.nativeElement.style.display = "block"
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
    this.fractal.getColor().decodeJSON(gradient);
    this.clickWebView(false);
    this.fractal.getColor().notify(null);
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
    this.mainFractalView.abortDownload();
    this.HTMLsaveButton.nativeElement.setAttribute("class", "btn");
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
    var host = "https://leesavage.co.uk/?";


    let equation = this.fractal.getCalculationFunction().getName();
    let color = this.fractal.getColor().encodeJSON()
    let iterations = this.fractal.iterations.toString()
    let complexCenter = this.fractal.complexPlain.getSquare().center.toString();
    let complexWidth = this.fractal.complexPlain.getSquare().width.toString();
    let complexJuliaPicker = new ComplexNumber(0, 0).toString();
    let juliaWidth = this.HTMLjuliaPicker.getFractalView().getFractal().complexPlain.getSquare().width;

    let fun = this.fractal.getCalculationFunction();
    if (fun instanceof FractalEquations.Julia) {
      let julia = <FractalEquations.Julia>fun;
      complexJuliaPicker = new ComplexNumber(julia.juliaReal, julia.juliaImaginary).toString()
    }

    let content = host + "e=" + equation + "&g=" + color + "&i=" + iterations + "&c=" + complexCenter + "&w=" + complexWidth + "&p=" + complexJuliaPicker + "&r=" + juliaWidth;
    content = encodeURI(content);

    if (this.platform.is("android") && this.platform.is("cordova")) {
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
      if (!this.HTMLjuliaPicker.hasInit) this.HTMLjuliaPicker.init(this.fractal.getColor(), this.NumIterations, this.complexJuliaPicker, width);
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
    if (this.HTMLjscolor2.nativeElement.jscolor != undefined) this.HTMLjscolor2.nativeElement.jscolor.fromRGB(50, 50, 50);
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
    this.HTMLsaveText.nativeElement.innerHTML = this.mainFractalView.getDownloadProgress() + "%"

    if (this.HTMLsaveButton.nativeElement.classList.contains("disabled")) {
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
            fractal.unsubscribe(element.base)
            this.explorer.imageToDownload = fractal.complexPlain.getViewCanvas().toDataURL("image/png");
            this.explorer.photoLibrary.requestAuthorization().then(() => {
              console.log("photo libray premission granted")
              var album = 'Fractal Explorer';
              this.explorer.photoLibrary.saveImage(this.explorer.imageToDownload, album, function (libraryItem) { }, function (err) { });

              this.explorer.HTMLalertComponent.titleStr = "All Done"
              this.explorer.HTMLalertComponent.textStr = "Image Saved."
              this.explorer.HTMLalertComponent.closeStr = "Close"
              this.explorer.HTMLalertComponent.enableOptions(true, false, false, false)
              this.explorer.HTMLalertComponent.setCallback(this.explorer.closeAlert.bind(this.explorer))
              this.explorer.HTMLalert.nativeElement.style.visibility = "visible";

              this.explorer.HTMLsaveButton.nativeElement.setAttribute("class", "btn");
            }).catch(err => {
              console.log('permissions weren\'t granted ' + err)
            });
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
            this.explorer.HTMLalertComponent.setCallback(this.explorer.closeAlert.bind(this.explorer))
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

  private setWebViewSection(section: ElementRef) {
    if (this.activeSection != undefined) this.activeSection.nativeElement.setAttribute("class", "hide");
    this.activeSection = section;
    this.activeSection.nativeElement.setAttribute("class", "show");
    this.activeSection.nativeElement.parentElement.scrollTop = 0;
  }

}
