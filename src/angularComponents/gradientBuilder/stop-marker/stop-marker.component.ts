import { Component, OnInit, ComponentFactoryResolver, ComponentRef, ElementRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { General } from "../../../helper/helper.module";

import { GradientBuilderComponent } from '../gradientBuilder.component';
import { FractalColor } from "../../../fractal/fractalColouring";

@Component({
  selector: 'app-stop-marker',
  templateUrl: './stop-marker.component.html',
  styleUrls: ['./stop-marker.component.scss']
})
export class StopMarkerComponent {
  @ViewChild('marker') stopMarker: ElementRef;
  @ViewChild('jscolor') jscolor: ElementRef;
  public thisRef: ComponentRef<StopMarkerComponent>;
  private lastCSSLeft: number;
  private stopValue: number;
  private parent: GradientBuilderComponent;
  private lastMouseX: number
  private moveStarted: boolean = false
  private color: FractalColor.RGBcolor = { r: Math.round(Math.random() * 255), g: Math.round(Math.random() * 255), b: Math.round(Math.random() * 255) };
  private colorPicker:ElementRef
  constructor() { }

  
  ngOnInit() {
    this.setColor(this.color);
  }

  public setColorPicker(colorPicker:ElementRef){
    this.colorPicker = colorPicker;
  }

  /*
  * Events
  */

  touchStart(event) {
    event.screenX = event.targetTouches[0].screenX
    this.mousedown(event);
  }

  touchEnd(event) {
    this.mouseup(event)
  }

  mousedown(event): void {
    event.stopPropagation();
    this.lastMouseX = event.screenX;
    this.lastCSSLeft = this.getCSSLeft();
    this.parent.setSelectedMarker(this, event.screenX);
    this.parent.setActiveMarker(this);
  }

  mouseup(event): void {
    if (this.moveStarted) {
      this.moveStarted = false
      this.mouseupWindow(event)
    } else {
      this.colorPicker.nativeElement.jscolor.show();
     }
  }

  mouseupWindow(event) {
    event.stopPropagation();
    this.parent.dropMarker();
  }

  windowResized() {
    this.setStopValue(this.stopValue);
  }

  /*
  * Public Methods
  */

  offsetCSSLeft(x: number, loop: boolean = false) {
    let newCSSleft = x - this.lastMouseX + this.lastCSSLeft;
    this.setCSSLeft(newCSSleft, loop);
  }

  setStopValue(stop: number) {
    let cssLeft = General.mapInOut(stop, 0, 1, this.getMinCSSLeft(), this.getMaxCSSLeft());  
    this.setCSSLeft(cssLeft);
  }

  setCSSLeftTop(x: number, y: number) {
    this.stopMarker.nativeElement.style.left = x.toString() + "px";
    this.stopMarker.nativeElement.style.top = y.toString() + "px";
  }

  resetCSSTop() {
    this.stopMarker.nativeElement.style.top = "auto";
  }

  setCSSLeft(x: number, loop: boolean = false) {
    this.moveStarted = true;
    let maxLeft = this.getMaxCSSLeft();
    let minLeft = this.getMinCSSLeft();

    if (loop) {
      let width = maxLeft - minLeft
      while (x > maxLeft + width) x = x - maxLeft - width - this.getCSSWidth() / 2;
      while (x < minLeft - width) x = x + maxLeft + width + this.getCSSWidth() / 2;
    }
    else {
      if (x > maxLeft) x = maxLeft;
      if (x < minLeft) x = minLeft;
    }

    this.stopMarker.nativeElement.style.left = x.toString() + "px";
    let cssLeft = this.getCSSLeft() + this.getCSSWidth() / 2;
    this.stopValue = General.mapInOut(cssLeft, 0, this.parent.maxCSSleft, 0, 1);
  }

  getScreenY() {
    let y = this.stopMarker.nativeElement.getBoundingClientRect().top + (this.stopMarker.nativeElement.getBoundingClientRect().width / 2)
    return y;
  }

  regesterParent(parent, componentRef): void {
    this.thisRef = componentRef;
    this.parent = parent;
  }

  styleActive(flag: boolean) {
    if (flag) {
      this.stopMarker.nativeElement.style.borderWidth = "2px"
    }
    else {
      this.stopMarker.nativeElement.style.borderWidth = "0px"
    }
  }

  getStopValue(): number {
    return this.stopValue;
  }

  setColor(rgb: { r: number, g: number, b: number }) {
    this.color = rgb;
    this.stopMarker.nativeElement.style.backgroundColor = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")"
  }

  getColor(): { r: number, g: number, b: number } {
    return this.color;
  }

  getMaxCSSLeft(): number {
    return this.parent.maxCSSleft - Math.round(this.getCSSWidth() / 2)
  }

  getMinCSSLeft(): number {
    return 0 - Math.round(this.getCSSWidth() / 2)
  }

  setCSSclass(s: string) {
    this.stopMarker.nativeElement.className = s
  }

  getCSSWidth(): number {
    let left = getComputedStyle(this.stopMarker.nativeElement).borderLeftWidth;
    let right = getComputedStyle(this.stopMarker.nativeElement).borderRightWidth;
    let border =  parseInt(left)+parseInt(right);
    let width = parseInt(getComputedStyle(this.stopMarker.nativeElement).width.replace("px", ""));
    return border + width
  }

  getCSSLeft(): number {
    return parseInt(this.stopMarker.nativeElement.style.left.replace("px", ""));
  }

}
