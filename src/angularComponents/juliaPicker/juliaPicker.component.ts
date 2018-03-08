import { Component, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Fractals } from "../../fractal/fractal.module";
import { FractalColor } from "../../fractal/fractalColouring";
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

    let centerJuliaPicker = pickerLoc.split(",");
    let centercenterJuliaPickerR = parseFloat(centerJuliaPicker[0]);
    let centercenterJuliaPickerI = parseFloat(centerJuliaPicker[1]);

    this.juliaFractal = new Fractals.Fractal(new Fractals.ComplexPlain(centercenterJuliaPickerR, centercenterJuliaPickerI, 3, canvas), new FractalEquations.Mandelbrot, color);
    this.juliaFractal.iterations = iterations;
    this.mainFractalView.setFractal(this.juliaFractal)

    this.setXY(this.getPickerX(),this.getPickerY());
    this.hasInit = true;
  }

  public getFractalView(): FractalViewComponent {
    return this.mainFractalView;
  }

  /*
  * Events
  */

  viewChanged() {
    if (this.getMaxX()!=0 && this.getMaxY()!=0) {
      this.numberChanged.emit(new ComplexNumber(this.getRealNumber(0), this.getImaginaryNumber(0)));
    }
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
    this.numberChanged.emit(new ComplexNumber(this.getRealNumber(offsetX), this.getImaginaryNumber(offsetY)));
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

  private getRealNumber(offset) {
    return this.juliaFractal.complexPlain.getRealNumber(this.getPickerX()-offset)
  }
  private getImaginaryNumber(offset) {
    return this.juliaFractal.complexPlain.getImaginaryNumber(this.getPickerY()-offset)
  }

  private getMaxX() {
    return parseInt(getComputedStyle(this.juliadiv.nativeElement).width.replace("px", ""));
  }

  private getMaxY() {
    return parseInt(getComputedStyle(this.juliadiv.nativeElement).height.replace("px", ""));
  }

  private getPickerX() {
    return this.getMaxX()/2;
  }

  private getPickerY() {
    return this.getMaxY()/2;
  }

  private setXY(x: number, y: number) {
    let h = parseInt(getComputedStyle(this.picker.nativeElement).height.replace("px", "")) / 2
    let w = parseInt(getComputedStyle(this.picker.nativeElement).width.replace("px", "")) / 2
    this.picker.nativeElement.style.top = (y - h) + "px"
    this.picker.nativeElement.style.left = (x - w) + "px"
  }
}

