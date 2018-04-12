import { Component, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Fractals } from "../../fractal/fractal.module";
import { FractalColor } from "../../fractal/fractalColouring";
import { FractalEquations } from "../../fractal/fractalEquations.module"
import { ComplexNumber } from '../../fractal/complexNumbers';
import { FractalViewComponent } from '../fractalView/fractalView.component';

@Component({
  selector: 'app-juliaPicker',
  templateUrl: './juliaPicker.component.html'
})
export class JuliaPickerComponent implements Fractals.FractalChangeObserver {
  private juliaFractal: Fractals.Fractal = null;
  @ViewChild('juliadiv') juliadiv: ElementRef;
  @ViewChild('mainFractalView') mainFractalView: FractalViewComponent;
  @ViewChild('picker') picker: ElementRef;
  @Output() numberChanged = new EventEmitter<ComplexNumber>();
  @Output() numberChanging = new EventEmitter<ComplexNumber>();
  private movingMarker: boolean = false;
  //public hasInit: boolean = false
  public isOnScreen: boolean = true;
  constructor() {
  }

  init(color: FractalColor.LinearGradient, iterations: number, pickerLocR: number, pickerLocI: number, viewWidth: number) {
    //if (this.hasInit) throw new Error("Julia picker has already init");
    let canvas = <HTMLCanvasElement>this.mainFractalView.getCanvas();
    let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

    ctx.canvas.width = 250;
    ctx.canvas.height = 200;


    this.juliaFractal = new Fractals.Fractal(new Fractals.ComplexPlain(pickerLocR, pickerLocI, viewWidth, canvas), new FractalEquations.Mandelbrot, color);
    this.juliaFractal.iterations = iterations;
    this.juliaFractal.subscribe(this);
    this.mainFractalView.setFractal(this.juliaFractal)
    //this.mainFractalView.getFractal().render();

    this.setXY(125,100);
    //this.hasInit = true;
  }

  public getFractalView(): FractalViewComponent {
    return this.mainFractalView;
  }

  /*
  * Events
  */

  touchStart(event) {
    this.mousedown(event);
  }

  mousedown(event) {
    this.movingMarker = true;
  }

  touchEnd(event) {
    this.mouseup(event)
  }

  mouseup(event) {
    this.movingMarker = false;
  }

  touchMove(event) {
    this.mousemove(event);
  }

  mousemove(event) {
    if (this.movingMarker == false) return;
    this.numberChanging.emit(this.juliaFractal.complexPlain.getSquare().center);
  }

  changed() {
    this.numberChanged.emit(this.juliaFractal.complexPlain.getSquare().center);
  }

  /*
  * Public Methods
  */

  public setIterations(i: number) {
    //if (this.hasInit) {
      this.juliaFractal.iterations = i;
      if (this.isOnScreen) {
        this.juliaFractal.render();
      }
    //}
  }


  /*
  * Private Methods
  */

  private getMaxX() {
    return parseInt(getComputedStyle(this.juliadiv.nativeElement).width.replace("px", ""));
  }

  private getMaxY() {
    return parseInt(getComputedStyle(this.juliadiv.nativeElement).height.replace("px", ""));
  }

  private getPickerX() {
    return this.getMaxX() / 2;
  }

  private getPickerY() {
    return this.getMaxY() / 2;
  }

  private setXY(x: number, y: number) {
    let h = parseInt(getComputedStyle(this.picker.nativeElement).height.replace("px", "")) / 2
    let w = parseInt(getComputedStyle(this.picker.nativeElement).width.replace("px", "")) / 2
    this.picker.nativeElement.style.top = (y - h) + "px"
    this.picker.nativeElement.style.left = (x - w) + "px"
  }
}

