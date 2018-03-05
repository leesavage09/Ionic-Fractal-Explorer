import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Fractals } from "../../fractal/fractal.module";
import { FractalColor, FractalHistogram } from "../../fractal/fractalColouring";
import { General } from "../../helper/helper.module";
import { ColoursliderComponent } from "./colourslider/colourslider.component";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements OnInit, FractalHistogram.HistogramObserver, FractalColor.LinearGradientObserver {
  @ViewChild('histogramCanvas') histogramCanvas: ElementRef;
  private fractal: Fractals.Fractal = null;
  @ViewChild('markerMin') markerMin: ElementRef;
  @ViewChild('markerMid') markerMid: ElementRef;
  @ViewChild('markerMax') markerMax: ElementRef;
  @ViewChild('container') container: ElementRef;
  @ViewChild('gradientSlider') HTMLgradientSlider: ColoursliderComponent;
  private movingMarker: HTMLDivElement;
  private data: Array<number>;
  private startX: number;
  constructor() {
  }

  ngOnInit() {

  }


  setFractal(fractal: Fractals.Fractal) {
    if (this.fractal != null) {
      this.fractal.getHistogram().unsubscribe(this);
      this.fractal.getColor().unsubscribe(this);
    }
    this.fractal = fractal;
    if (this.fractal != null) {
      fractal.getHistogram().subscribe(this);
      this.fractal.getColor().subscribe(this);
      this.HTMLgradientSlider.color = this.fractal.getColor();
      this.windowResized()
    }
    else {
      this.HTMLgradientSlider.color = null;
    }
  }

  /*
  * Events
  */

  windowResized() {
    if (this.fractal == undefined) return;
    General.resizeCanvasToFillParent(this.histogramCanvas.nativeElement);

    let cssMin = this.getMinCSSLeft(this.markerMin.nativeElement);
    let cssMax = this.getMaxCSSLeft(this.markerMax.nativeElement);

    let min = this.fractal.getColor().getMin()
    min = General.mapInOut(min, 0, 1, cssMin, cssMax);

    let mid = this.fractal.getColor().getMid()
    mid = General.mapInOut(mid, 0, 1, cssMin, cssMax);

    let max = this.fractal.getColor().getMax()
    max = General.mapInOut(max, 0, 1, cssMin, cssMax);

    this.markerMin.nativeElement.style.left = min.toString() + "px";
    this.markerMid.nativeElement.style.left = mid.toString() + "px";
    this.markerMax.nativeElement.style.left = max.toString() + "px";

    this.histogramChanged()
  }

  histogramChanged() {
    this.data = this.fractal.getHistogram().getData()
    this.drawHistogram();
  }

  linearGradientChanged(){
    this.windowResized();
  }

  touchStart(event) {
    event.screenX = event.targetTouches[0].screenX
    this.mousedown(event);
  }

  mousedown(event) {
    this.movingMarker = event.target || event.srcElement || event.currentTarget;
    this.startX = event.screenX
  }

  touchEnd(event) {
    this.mouseup(event)
  }

  mouseup(event) {
    this.movingMarker = null;
  }

  touchMove(event) {
    event.screenX = event.targetTouches[0].screenX
    this.mousemove(event);
  }

  mousemove(event) {
    if (this.movingMarker == null) return;

    let offset = event.screenX - this.startX

    let currentPos = this.getCSSLeft(this.movingMarker)
    let newPos = currentPos + offset

    let min = this.getMinCSSLeft(this.movingMarker);
    let max = this.getMaxCSSLeft(this.movingMarker);
    if (newPos > max) newPos = max
    else if (newPos < min) newPos = min

    this.movingMarker.style.left = newPos.toString() + "px";
    this.startX = event.screenX
    this.updateGradient()
  }

  /*
  * Public Methods
  */


  /*
  * Private Methods
  */

  private drawHistogram() {
    const ctx = <CanvasRenderingContext2D>this.histogramCanvas.nativeElement.getContext("2d");
    const numBin = this.data.length - 1
    var total = 0;
    for (var i = 0; i <= this.data.length-1; i++) {
      total += this.data[i];
    }
    var avg = total / this.data.length;
    let max = Math.max(...this.data);

    const widthBin = ctx.canvas.width / numBin
    const hightCount = ctx.canvas.height / (avg)//(max*1.1)

    const img = ctx.getImageData(0, 0, ctx.canvas.width, 1);
    let c
    for (var y = 0; y < ctx.canvas.height; ++y) {
      for (var x = 0; x < ctx.canvas.width; ++x) {
        let binNum = Math.trunc(x / widthBin)

        if ((y / hightCount) < this.data[binNum]) c = new FractalColor.RGBcolor(0, 0, 0)
        else c = new FractalColor.RGBcolor(255, 255, 255)

        img.data[(x * 4) + 0] = c.r;
        img.data[(x * 4) + 1] = c.g;
        img.data[(x * 4) + 2] = c.b;
        img.data[(x * 4) + 3] = 255;
      }
      ctx.putImageData(img, 0, ctx.canvas.height - y);
    }
  }

  private updateGradient() {
    this.fractal.getColor().setMin(this.getMinVal())
    this.fractal.getColor().setMid(this.getMidVal())
    this.fractal.getColor().setMax(this.getMaxVal())
    this.fractal.getColor().notify(null);
  }

  private getMinVal() {
    let left = this.getCSSLeft(this.markerMin.nativeElement)
    return General.mapInOut(left, this.getMinCSSLeft(this.markerMin.nativeElement), this.getMaxCSSLeft(this.markerMax.nativeElement), 0, 1);
  }

  private getMidVal() {
    let left = this.getCSSLeft(this.markerMid.nativeElement)
    return General.mapInOut(left, this.getMinCSSLeft(this.markerMin.nativeElement), this.getMaxCSSLeft(this.markerMax.nativeElement), 0, 1);
  }

  private getMaxVal() {
    let left = this.getCSSLeft(this.markerMax.nativeElement)
    return General.mapInOut(left, this.getMinCSSLeft(this.markerMin.nativeElement), this.getMaxCSSLeft(this.markerMax.nativeElement), 0, 1);
  }

  private getMinCSSLeft(marker: HTMLElement) {
    let start
    if (marker == this.markerMax.nativeElement) start = this.getCSSLeft(this.markerMid.nativeElement)
    else if (marker == this.markerMid.nativeElement) start = this.getCSSLeft(this.markerMin.nativeElement)
    else start = 0 - this.getCSSWidth(marker);
    return start + (this.getCSSWidth(marker) / 2);
  }

  private getMaxCSSLeft(marker: HTMLElement): number {
    let start
    if (marker == this.markerMin.nativeElement) start = this.getCSSLeft(this.markerMid.nativeElement)
    else if (marker == this.markerMid.nativeElement) start = this.getCSSLeft(this.markerMax.nativeElement)
    else start = this.getCSSWidth(this.container.nativeElement);
    return start - (this.getCSSWidth(marker) / 2);
  }

  private getCSSWidth(marker: HTMLElement): number {
    let left = getComputedStyle(marker).borderLeftWidth;
    let right = getComputedStyle(marker).borderRightWidth;
    let border =  parseInt(left)+parseInt(right);
    let width = parseInt(getComputedStyle(marker).width.replace("px", ""));
    return border + width    
  }

  private getCSSLeft(marker: HTMLElement): number {
    return parseInt(getComputedStyle(marker).left.replace("px", ""));
  }
}
