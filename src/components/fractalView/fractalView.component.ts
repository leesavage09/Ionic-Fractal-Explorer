import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";

import { Fractals } from "../../fractal/fractal.module";
import { FractalEquations } from "../../fractal/fractalEquations.module";
import { FractalColor } from "../../fractal/fractalColouring";


@Component({
  selector: "app-fractalView",
  templateUrl: "./fractalView.component.html"
})
export class FractalViewComponent implements Fractals.FractalChangeObserver {
  @ViewChild('fractalCanvas') HTMLcanvas: ElementRef;
  @ViewChild('webGLCanvas') webGLCanvas: ElementRef;
  @Output() viewChanged = new EventEmitter();
  private fractal: Fractals.Fractal;
  private downloadingFractal: Fractals.Fractal;
  private zoomGestureHappening: boolean = false;
  private lastMouseDown = (new Date).getTime();

  readonly colorBW: string = '{"mn":0,"md":0.5,"mx":1,"arr":[{"s":0,"c":{"r":0,"g":0,"b":0}},{"s":1,"c":{"r":255,"g":255,"b":255}}]}'


  constructor() { }


  /*
  * Public 
  */

  @Input()
  set url(url: string) {
    var equation = "Mandelbrot";
    var numIterations = 50;
    var complexCenter = "-0.8, 0";
    var complexWidthStr = "3";
    var complexJuliaPicker = "0,0"
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
        numIterations = parseInt(element[1])
      }
      if (element[0] == "c") {
        complexCenter = element[1];
      }
      if (element[0] == "w") {
        complexWidthStr = element[1];
      }
      if (element[0] == "p") {
        complexJuliaPicker = element[1];
      }
    }

    var centerArr = complexCenter.split(",");
    var centerR = parseFloat(centerArr[0]);
    var centerI = parseFloat(centerArr[1]);
    var complexWidth = parseFloat(complexWidthStr);
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
      let jNumStr = complexJuliaPicker.split(",");
      (<FractalEquations.Julia>fractalEq).juliaReal = parseFloat(jNumStr[0]);
      (<FractalEquations.Julia>fractalEq).juliaImaginary = parseFloat(jNumStr[1]);
    }

    let gradient = new FractalColor.LinearGradient();
    gradient.decodeJSON(colorStr)

    this.fractal = new Fractals.Fractal(new Fractals.ComplexPlain(centerR, centerI, complexWidth, this.HTMLcanvas.nativeElement), fractalEq, gradient);
    this.fractal.iterations = numIterations;
    this.sizeChanged();
  }

  public setFractal(fractal: Fractals.Fractal) {
    this.fractal = fractal;
    this.fractal.webGLcanvas = this.webGLCanvas.nativeElement;
    this.fractal.subscribe(this);
    this.sizeChanged()
  }

  public getFractal(): Fractals.Fractal {
    return this.fractal;
  }

  public changed() {
    this.viewChanged.emit();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.HTMLcanvas.nativeElement;
  }

  public getBase64Image(width:number,height:number):string {
    let bufferedCanvas = document.createElement('canvas');
    bufferedCanvas.width = width;
    bufferedCanvas.height = height;

    var canvas = this.HTMLcanvas.nativeElement;
    if (this.fractal.webGL) canvas = this.webGLCanvas.nativeElement;
    if (canvas.height < (canvas.width / 16) * 9) {
      let adjustedWidth = height * canvas.width / canvas.height;
      let cropWidth = (adjustedWidth - width) / 2;
      bufferedCanvas.getContext('2d').drawImage(canvas, -cropWidth, 0, adjustedWidth, height);
    }
    else {
      let adjustedHeight = width * canvas.height / canvas.width;
      let cropHeight = (adjustedHeight - height) / 2;
      bufferedCanvas.getContext('2d').drawImage(canvas, 0, -cropHeight, width, adjustedHeight);
    }

    return bufferedCanvas.toDataURL("image/jpeg");
  }

  public sizeChanged() {
    let canvas = <HTMLCanvasElement>this.HTMLcanvas.nativeElement;
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    if (!canvas.offsetParent) {
      // console.log("of screen")
      return; // its not onscreen
    }
    if (canvas.offsetWidth == 0 || canvas.offsetHeight == 0) {
      //  console.log("size 0")
      return;
    }
    if (canvas.offsetWidth == ctx.canvas.width && canvas.offsetHeight == ctx.canvas.height) {
      //  console.log("size unchanged2",canvas.offsetWidth ,ctx.canvas.width)
      return;
    }
    //console.log("Resizing3");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;
    let cp = this.fractal.complexPlain;
    cp.replaceView(cp.getSquare().center.r, cp.getSquare().center.i, cp.getSquare().width, canvas);
    this.fractal.render();
  }

  public downloadImage(width: number, height: number, callback: Fractals.FractalChangeObserver) {
    let oldCp = this.fractal.complexPlain;

    let canvas = <HTMLCanvasElement>document.createElement('canvas');
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;
    ctx.canvas.width = width
    ctx.canvas.height = height

    let newFun = <FractalEquations.equation>this.fractal.getCalculationFunction().copy();
    let newCP = new Fractals.ComplexPlain(oldCp.getSquare().center.r, oldCp.getSquare().center.i, oldCp.getSquare().width, canvas)
    
    this.downloadingFractal = new Fractals.Fractal(newCP, newFun, this.fractal.getColor());
    this.downloadingFractal.iterations = this.fractal.iterations;
    this.downloadingFractal.updateTimeout = 100;
    this.downloadingFractal.getColor().unsubscribe(this.downloadingFractal);

    this.downloadingFractal.subscribe(callback)
    this.downloadingFractal.renderCPU(false, true);
  }

  getDownloadProgress(): number {
    let num = 100 - (100 * (this.downloadingFractal.currentScanLine / this.downloadingFractal.complexPlain.getViewCanvas().height));
    return Math.trunc(num)
  }

  abortDownload(): boolean {
    if (this.downloadingFractal != null) {
      this.downloadingFractal.stopRendering();
      this.downloadingFractal = null;
      return true;
    } else {
      return false;
    }
  }


  /*
  * Mouse wheel and trackpad events
  */

  wheel(event) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.fractal.getAnimator().zoomStart(event.offsetX, event.offsetY, 1.4, 200);
    }
    else if (event.deltaY > 0) {
      this.fractal.getAnimator().zoomStart(event.offsetX, event.offsetY, 0.6, 200);
    }
  }

  /*
  * Touch Screen Events
  */

  touchStartDrag(event) {
    if (event.cancelable) event.preventDefault();
    event = this.addTocuchOffsets(event);
    if (event.touches.length === 2) {
      this.fractal.getAnimator().dragEnd(event.offsetX, event.offsetY, false);
      this.zoomGestureHappening = true;
      var dist = Math.abs(Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY));
      let minX = Math.min(event.touches[0].clientX, event.touches[1].clientX);
      let minY = Math.min(event.touches[0].clientY, event.touches[1].clientY);
      let centerX = minX + (Math.abs(event.touches[0].clientX - event.touches[1].clientX) / 2);
      let centerY = minY + (Math.abs(event.touches[0].clientY - event.touches[1].clientY) / 2);
      var realTarget = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
      centerX = centerX - (<any>realTarget.getBoundingClientRect()).left;
      centerY = centerY - (<any>realTarget.getBoundingClientRect()).top;
      this.fractal.getAnimator().zoomByScaleStart(dist, centerX, centerY)
    }
    else {
      this.mousedown(event)
    }
  }

  touchMove(event) {
    if (event.cancelable) event.preventDefault();
    if (this.zoomGestureHappening) {
      var dist = Math.abs(Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY));
      this.fractal.getAnimator().zoomByScale(dist);
      return;
    }
    event = this.addTocuchOffsets(event);
    if (document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY) === this.HTMLcanvas.nativeElement) {
      this.mouseMove(event);
      return;
    }
    this.mouseup(event);
  }

  touchEndDrag(event) {
    if (event.cancelable) event.preventDefault();
    if (this.zoomGestureHappening) {
      this.zoomGestureHappening = false;
      this.fractal.getAnimator().zoomByScaleEnd();
      // if (event.touches.length === 1) {
      //   this.touchStartDrag(event);
      // }
    }
    else {
      event = this.addTocuchOffsets(event);
      this.mouseup(event);
    }

  }

  /*
  * Mouse pointer events
  */

  mousedown(event) {
    this.removeAllSelections();

    let now = (new Date).getTime();
    let delta = (new Date).getTime() - this.lastMouseDown;
    this.lastMouseDown = now;

    if (delta < 250) {
      this.fractal.getAnimator().zoomStart(event.offsetX, event.offsetY, 2, 200);
    } else {
      this.fractal.getAnimator().dragStart(event.offsetX, event.offsetY);
    }
  }

  mouseup(event) {
    this.fractal.getAnimator().dragEnd(event.offsetX, event.offsetY);
  }

  mouseMove(event) {
    this.fractal.getAnimator().dragMove(event.offsetX, event.offsetY);
  }

  /*
  * Private Functions \/
  */

  private addTocuchOffsets(event) {
    var touch = event.touches[0] || event.changedTouches[0];
    event.offsetX = touch.clientX - (<any>this.HTMLcanvas.nativeElement.getBoundingClientRect()).left;
    event.offsetY = touch.clientY - (<any>this.HTMLcanvas.nativeElement.getBoundingClientRect()).top;
    return event;
  }

  private removeAllSelections() {
    let doc = <any>document;
    if (doc.selection) {
      doc.selection.empty();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  }

}