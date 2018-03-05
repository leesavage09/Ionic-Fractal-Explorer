import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Fractals } from "../../fractal/fractal.module";
import { FractalColor, FractalHistogram } from "../../fractal/fractalColouring";
import { General } from "../../helper/helper.module";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { ComplexNumber } from '../../fractal/complexNumbers';
import { FractalViewComponent } from '../fractalView/fractalView.component';

@Component({
  selector: 'app-juliaPicker',
  templateUrl: './juliaPicker.component.html',
  styleUrls: ['./juliaPicker.component.scss']
})
export class JuliaPickerComponent {
  private juliaFractal: Fractals.Fractal = null;
  @ViewChild('juliadiv') juliadiv: ElementRef;
  @ViewChild('mainFractalView') mainFractalView: FractalViewComponent;
  @ViewChild('picker') picker: ElementRef;
  @Output() numberChanged = new EventEmitter<ComplexNumber>();
  private movingMarker: boolean = false;
  private data: Array<number>;
  private startX: number;
  private startY: number;
  public hasInit: boolean = false
  constructor() {
  }


  init(color: FractalColor.LinearGradient, iterations: number, pickerLoc: String) {
    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetHeight;

    this.juliaFractal = new Fractals.Fractal(new Fractals.ComplexPlain(-0.8, 0, 3, canvas), new FractalEquations.Mandelbrot, color);
    this.juliaFractal.iterations = iterations;
    this.mainFractalView.setFractal(this.juliaFractal)

    this.setPickerString(pickerLoc);
    this.hasInit = true;
  }

  public getFractalView(): FractalViewComponent {
    return this.mainFractalView;
  }



  public setPickerString(pickerLoc: String) {
    //set the picker location
    let centerJuliaPicker = pickerLoc.split(",");
    let centercenterJuliaPickerR = parseFloat(centerJuliaPicker[0]);
    let centercenterJuliaPickerI = parseFloat(centerJuliaPicker[1]);
    let complexCenterJuliaPicker = new ComplexNumber(centercenterJuliaPickerR, centercenterJuliaPickerI);
    this.setPicker(complexCenterJuliaPicker);
  }

  public setPicker(pickerCenter: ComplexNumber) {
    //set the picker location
    let pos = this.juliaFractal.complexPlain.getMouse(pickerCenter)
    this.setXY(pos.x, pos.y);
  }


  /*
  * Events
  */

  viewChanged() {
    this.numberChanged.emit(new ComplexNumber(this.getRealNumber(), this.getImaginaryNumber()));
  }

  touchStart(event) {
    event.screenX = event.targetTouches[0].screenX
    this.mousedown(event);
  }

  mousedown(event) {
    this.movingMarker = true;
    this.startX = event.screenX
    this.startY = event.screenY
  }

  touchEnd(event) {
    this.mouseup(event)
  }

  mouseup(event) {
    this.movingMarker = false;
  }

  touchMove(event) {
    event.screenX = event.targetTouches[0].screenX
    event.screenY = event.targetTouches[0].screenY
    this.mousemove(event);
  }

  mousemove(event) {
    if (this.movingMarker == false) return;
    let offsetX = event.screenX - this.startX
    let offsetY = event.screenY - this.startY

    this.startX = event.screenX
    this.startY = event.screenY

    let y = this.getCurrentY() + offsetY
    let x = this.getCurrentX() + offsetX

    if (y < 0) y = 0;
    else if (y > this.getMaxY()) y = this.getMaxY();

    if (x < 0) x = 0;
    else if (x > this.getMaxX()) x = this.getMaxX();

    this.setXY(x, y);


    this.numberChanged.emit(new ComplexNumber(this.getRealNumber(), this.getImaginaryNumber()));

  }

  /*
  * Public Methods
  */

  public setIterations(i: number) {
    if (this.hasInit) {
      this.juliaFractal.iterations = i;
      this.juliaFractal.render();
    }
  }


  /*
  * Private Methods
  */

  private getRealNumber() {
    return this.juliaFractal.complexPlain.getRealNumber(this.getCurrentX())
  }
  private getImaginaryNumber() {
    return this.juliaFractal.complexPlain.getImaginaryNumber(this.getCurrentY())
  }

  private getMaxX() {
    return parseInt(getComputedStyle(this.juliadiv.nativeElement).width.replace("px", ""));
  }

  private getMaxY() {
    return parseInt(getComputedStyle(this.juliadiv.nativeElement).height.replace("px", ""));
  }

  public getCurrentX() {
    let w = parseInt(getComputedStyle(this.picker.nativeElement).width.replace("px", "")) / 2
    return parseInt(getComputedStyle(this.picker.nativeElement).left.replace("px", "")) + w;
  }

  public getCurrentY() {
    let h = parseInt(getComputedStyle(this.picker.nativeElement).height.replace("px", "")) / 2
    return parseInt(getComputedStyle(this.picker.nativeElement).top.replace("px", "")) + h;
  }

  private setXY(x: number, y: number) {
    let h = parseInt(getComputedStyle(this.picker.nativeElement).height.replace("px", "")) / 2
    let w = parseInt(getComputedStyle(this.picker.nativeElement).width.replace("px", "")) / 2
    this.picker.nativeElement.style.top = (y - h) + "px"
    this.picker.nativeElement.style.left = (x - w) + "px"
  }
}

