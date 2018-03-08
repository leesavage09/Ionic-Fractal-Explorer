import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';

import { FractalColor } from "../../../fractal/fractalColouring";
import { General } from "../../../helper/helper.module";

@Component({
  selector: 'app-colourslider',
  templateUrl: './colourslider.component.html',
  styleUrls: ['./colourslider.component.scss']
})
export class ColoursliderComponent implements OnInit, FractalColor.LinearGradientObserver {
  @ViewChild('slider') HTMLslider: ElementRef;
  // private trackingMove: boolean = false;
  // private startX: number = null;
  // private startPhase;
  private linearGradient: FractalColor.LinearGradient = null;
  constructor() { }

  ngOnInit() {
    this.windowResized()
  }



  @Input()
  set color(c: FractalColor.LinearGradient) {
    if (this.linearGradient != null) this.linearGradient.unsubscribe(this)
    this.linearGradient = c;
    if (this.linearGradient != null) {
      this.linearGradient.subscribe(this)
      this.windowResized();
    }
  }



  /*
  * Events
  */

  windowResized() {
    if (this.linearGradient == null) return;
    General.resizeCanvasToFillParent(this.HTMLslider.nativeElement);
    this.updateImg();
  }

  linearGradientChanged() {
    this.updateImg();
  }

  // start(event) {
  //   this.trackingMove = true;
  //   this.startX = event.offsetX;
  //   this.startPhase = this.linearGradient.getPhase();
  // }

  // end(event) {
  //   this.trackingMove = false;
  // }

  // move(event) {
  //   if (!this.trackingMove) return;
  //   let offset = this.startX - event.offsetX;
  //   let style = getComputedStyle(this.HTMLslider.nativeElement);
  //   let percent = offset / parseInt(style.width);
  //   this.linearGradient.setPhase(this.startPhase + percent)
  //   this.updateImg();
  //   this.linearGradient.notify(this);
  // }

  // touchMove(event) {
  //   if (!this.trackingMove) return;
  // }

  /*
  * Private
  */

  private updateImg() {
    let slider = this.HTMLslider.nativeElement;
    let img = slider.getContext("2d").getImageData(0, 0, slider.width, 1);
    for (var i = 0; i < slider.width; ++i) {
      let val = i / slider.width
      let rgb = this.linearGradient.getColorAt(val);
      img.data[(i * 4) + 0] = rgb.r;
      img.data[(i * 4) + 1] = rgb.g;
      img.data[(i * 4) + 2] = rgb.b;
      img.data[(i * 4) + 3] = 255;
    }
    for (var i = 0; i < slider.height; ++i) {
      slider.getContext("2d").putImageData(img, 0, i);
    }
  }
}
