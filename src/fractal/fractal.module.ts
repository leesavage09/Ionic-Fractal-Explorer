import { FractalColor, FractalHistogram } from "../fractal/fractalColouring";
import { ComplexNumber, ComplexSquare } from "../fractal/complexNumbers";
import { General, EasingFunctions } from "../helper/helper.module";
import { FractalEquations } from "./fractalEquations.module";

export namespace Fractals {

	export class Fractal implements FractalColor.LinearGradientObserver {
		iterations: number = 85;
		escapeRadius: number = 10;
		private color: FractalColor.LinearGradient;
		complexPlain: ComplexPlain;
		img: ImageData;
		private calculationFunction: FractalEquations.equation;
		private renderVersion: number = 0;
		public updateTimeout: number = 100
		private lastUpdate: number = (new Date).getTime();
		private animator: FractalNavigationAnimator;
		private maxZoomListner: MaxZoomListner;
		private histogram: FractalHistogram.Histogram = new FractalHistogram.Histogram()
		private compiledColor: Array<FractalColor.RGBcolor>
		private subscribers: Array<ChangeObserver> = new Array();
		public currentScanLine = 0;
		constructor(complexPlain: ComplexPlain, fractalCalculationFunction: FractalEquations.equation, color: FractalColor.LinearGradient) {
			this.complexPlain = complexPlain;
			this.calculationFunction = fractalCalculationFunction;
			this.color = color;
			this.color.subscribe(this);
		}

		public subscribe(observer: ChangeObserver) {
			this.subscribers.push(observer);
		}

		public unsubscribe(observer: ChangeObserver) {
			this.subscribers.splice(this.subscribers.lastIndexOf(observer), 1);
		}

		public notify() {
			for (let i = 0; i < this.subscribers.length; i++) {
				this.subscribers[i].changed(this);
			}
		}

		public renderIfVersionIsNew(v: number): void {
			if (this.renderVersion <= v) {
				this.render();
			}
		}

		public setCalculationFunction(f: FractalEquations.equation): void {
			this.calculationFunction = f;
		}

		public getCalculationFunction(): FractalEquations.equation {
			return this.calculationFunction;
		}

		public linearGradientChanged() {
			this.render();
		}

		public render(fullRes: boolean = false): void {
			this.stopRendering();
			if (this.complexPlain.getSquare().width < 5.2291950245225395e-15) {
				this.notifiMaxZoomListeners();
			}
			if (!fullRes) this.complexPlain.makeAlternativeResolutionCanvas(0.2);
			this.histogram.startHistogram(this.iterations);
			this.compiledColor = this.color.getCompiledColor(this.iterations);
			var self = this;
			setTimeout(function () {
				self.scanLine(0, self.renderVersion);
			}, 0);
		}

		public getColor(): FractalColor.LinearGradient {
			return this.color;
		}

		public getHistogram() {
			return this.histogram
		}
		private scanLine(y: number, version: number): void {
			if (this.renderVersion != version) return;
			this.currentScanLine = y;
			this.img = this.complexPlain.getScanLineImage();
			var Ci = this.complexPlain.getImaginaryNumber(y);
			let width = this.complexPlain.getDrawableWidth() - 1;

			for (var x = 0; x <= width; x++) {
				var Cr = this.complexPlain.getRealNumber(x);
				let n = this.calculationFunction.calculate(Cr, Ci, this.iterations, this.escapeRadius);
				//if (n > this.iterations) throw Error("n out of bounds " + n + ">" + this.iterations)

				this.histogram.incrementData(Math.floor(n))
				let col = FractalColor.LinearGradient.smoothColorFromCompiledColor(n, this.compiledColor);

				this.img.data[(x * 4) + 0] = col.r;
				this.img.data[(x * 4) + 1] = col.g;
				this.img.data[(x * 4) + 2] = col.b;
				this.img.data[(x * 4) + 3] = 255;
			}
			this.complexPlain.updateCanvas(y);

			var self = this;
			if (y < this.complexPlain.getDrawableHeight()) {
				var now = (new Date).getTime();
				if ((now - this.lastUpdate) >= this.updateTimeout) {
					this.lastUpdate = now;
					setTimeout(function () {
						self.scanLine(y + 1, version);
					}, 1);// using timeout 1 to force thread to yeald so we can update UI
				}
				else {
					this.scanLine(y + 1, version);
				}
			}
			else if (!this.complexPlain.drawableAndViewAreEqual()) {
				this.histogram.notify(null);
				this.complexPlain.makeAlternativeResolutionCanvas(1);
				this.lastUpdate = (new Date).getTime();
				setTimeout(function () {
					self.scanLine(0, version);
				}, 1);
			}
			else {
				this.notify();
				this.histogram.notify(null);
			}
		}

		public getAnimator(): FractalNavigationAnimator {
			if (this.animator == undefined) {
				this.animator = new FractalNavigationAnimator(this);
			}
			return this.animator;
		}

		public stopRendering(): void {
			this.renderVersion = this.renderVersion + 1;
		}

		public getCurrentVersion(): number {
			return this.renderVersion;
		}

		public setMaxZoomListener(l: MaxZoomListner) {
			this.maxZoomListner = l;
		}

		public deleteMaxZoomListener() {
			this.maxZoomListner = null;
		}

		private notifiMaxZoomListeners() {
			if (this.maxZoomListner != null) {
				this.maxZoomListner.maxZoomReached();
			}
		}
	}

	export interface MaxZoomListner {
		maxZoomReached();
	}

	/*
	*    This class keeps track of the realationships between 
	*		the canvas the user sees and interacts with
	*    	the complex plain the fractal is calucated from
	*  		the image the fractal is rendered onto
	*
	*	public helper methors alow conversions between these diffrent
	*	refrence frames.
	*/
	export class ComplexPlain {
		private complexSquare: ComplexSquare;
		private drawableCanvas: HTMLCanvasElement;
		private scanLine: ImageData;
		private viewCanvas: HTMLCanvasElement;

		constructor(realCenter: number, imaginaryCenter: number, realWidth: number, canvas: HTMLCanvasElement) {
			this.replaceView(realCenter, imaginaryCenter, realWidth, canvas);
		}

		replaceView(realCenter: number, imaginaryCenter: number, realWidth: number, canvas: HTMLCanvasElement) {
			let center = new ComplexNumber(realCenter, imaginaryCenter);
			let width = realWidth;
			let height = (realWidth / canvas.width) * canvas.height

			this.complexSquare = new ComplexSquare(center, width, height);
			this.viewCanvas = canvas;
			this.makeAlternativeResolutionCanvas(1);
		}

		updateCanvas(y: number): void {
			this.drawableCanvas.getContext("2d").putImageData(this.getScanLineImage(), 0, y);
			let destCtx = this.viewCanvas.getContext("2d");
			if (!this.drawableAndViewAreEqual()) {
				destCtx.scale(this.viewCanvas.width / this.drawableCanvas.width, this.viewCanvas.height / this.drawableCanvas.height);
				destCtx.drawImage(this.drawableCanvas, 0, 0);
				destCtx.scale(this.drawableCanvas.width / this.viewCanvas.width, this.drawableCanvas.height / this.viewCanvas.height);
			}
			else {
				destCtx.drawImage(this.drawableCanvas, 0, 0);
			}
		}

		makeAlternativeResolutionCanvas(fraction: number): void {
			let canvas = document.createElement('canvas');
			canvas.setAttribute("width", (this.viewCanvas.width * fraction).toString());
			canvas.setAttribute("height", (this.viewCanvas.height * fraction).toString());
			this.drawableCanvas = canvas;
			this.scanLine = this.drawableCanvas.getContext("2d").createImageData(this.drawableCanvas.width, 1);
		}

		drawableAndViewAreEqual(): boolean {
			return (this.viewCanvas.width == this.drawableCanvas.width && this.viewCanvas.height == this.drawableCanvas.height)
		}

		/*
		*	Getters
		*/

		getSquare(): ComplexSquare {
			return this.complexSquare;
		}

		getDrawableWidth(): number {
			return this.drawableCanvas.width;
		}

		getDrawableHeight(): number {
			return this.drawableCanvas.height;
		}

		getViewCanvas(): HTMLCanvasElement {
			return this.viewCanvas;
		}

		getScanLineImage(): ImageData {
			return this.scanLine;
		}

		getComplexNumberFromMouse(x: number, y: number): ComplexNumber {
			let r = General.mapInOut(x, 0, this.getViewCanvas().width - 1, this.complexSquare.min.r, this.complexSquare.max.r);
			let i = General.mapInOut(y, 0, this.getViewCanvas().height - 1, this.complexSquare.max.i, this.complexSquare.min.i);
			return new ComplexNumber(r, i);
		}

		getMouse(complexNum: ComplexNumber): { x, y } {
			let x = General.mapInOut(complexNum.r, this.complexSquare.min.r, this.complexSquare.max.r, 0, this.getViewCanvas().width);
			let y = General.mapInOut(complexNum.i, this.complexSquare.min.i, this.complexSquare.max.i, this.getViewCanvas().height, 0);
			return { x: x, y: y };
		}

		getImaginaryNumber(pixelY: number): number {
			return General.mapInOut(pixelY, 0, this.drawableCanvas.height - 1, this.complexSquare.max.i, this.complexSquare.min.i);
		}

		getRealNumber(pixelX: number): number {
			return General.mapInOut(pixelX, 0, this.drawableCanvas.width - 1, this.complexSquare.min.r, this.complexSquare.max.r);
		}
	}


	export interface ChangeObserver {
		changed(fractal: Fractal);
	}



	export class FractalNavigationAnimator {
		fractal: Fractal;
		driftAnimationTime: number = 800;
		zoomAnimationTime: number = 200;
		panAnimationIsRunning: boolean = false;
		zoomAnimationIsRunning: boolean = false;
		mouseStartDragPos: { x: number, y: number };
		bufferedCanvas: HTMLCanvasElement;
		speedX: number;
		speedY: number;
		lastmousex: number;
		lastmousey: number;
		lastDist: number;
		speedDist: number;
		driftSpeedDist: number;
		lastSpeedTime: number;
		startTime: number;
		driftSpeedX: number;
		driftSpeedY: number;
		clickX: number;
		clickY: number;
		targetMagnification: number;
		currentMagnification: number;
		focusX: number;
		focusY: number;
		touchStartDelta: number = null;
		constructor(fractal: Fractal) {
			this.fractal = fractal;
		}

		/*
		* Setup a timed animation
		*/
		private initBufferedImage(): void {
			this.bufferedCanvas = document.createElement('canvas');
			this.bufferedCanvas.width = this.fractal.complexPlain.getViewCanvas().width;
			this.bufferedCanvas.height = this.fractal.complexPlain.getViewCanvas().height;
			this.bufferedCanvas.getContext('2d').drawImage(this.fractal.complexPlain.getViewCanvas(), 0, 0);
		}

		/*
		* Drag image over time 
		*/
		dragStart(x: number, y: number): void {
			if (this.panAnimationIsRunning) this.interruptPanAnimation();
			if (this.zoomAnimationIsRunning) this.interruptZoomAnimation();
			if (this.touchStartDelta != null) return;
			this.fractal.stopRendering();
			this.initBufferedImage();
			this.mouseStartDragPos = { x: x, y: y };
		}

		dragMove(x: number, y: number): void {
			if (this.mouseStartDragPos == null || this.panAnimationIsRunning || this.zoomAnimationIsRunning || this.touchStartDelta != null) return;

			let dt = (new Date).getTime() - this.lastSpeedTime;
			let dx = x - this.lastmousex;
			let dy = y - this.lastmousey;
			this.speedX = Math.round(dx / dt * 10);
			this.speedY = Math.round(dy / dt * 10);

			this.lastmousex = x;
			this.lastmousey = y;
			this.lastSpeedTime = (new Date).getTime();

			dx = x - this.mouseStartDragPos.x;
			dy = y - this.mouseStartDragPos.y;
			let canvas = this.fractal.complexPlain.getViewCanvas();
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			canvas.getContext('2d').drawImage(this.bufferedCanvas, dx, dy);
		}

		dragEnd(x: number, y: number, animate: boolean = true): void {
			if (this.mouseStartDragPos == null || this.panAnimationIsRunning || this.zoomAnimationIsRunning || this.touchStartDelta != null) return;

			if (animate && !isNaN(this.speedX) && !isNaN(this.speedY) && this.speedX != 0 && this.speedY != 0) {
				this.startTime = (new Date).getTime();
				this.panAnimationIsRunning = true;
				this.driftSpeedX = this.speedX;
				this.driftSpeedY = this.speedY;
				let that = this;
				window.requestAnimationFrame(function () { that.dragDrifting() });
				return;
			}

			this.moveFractalView(x - this.mouseStartDragPos.x, y - this.mouseStartDragPos.y);
			if (animate) this.fractal.render();
			this.mouseStartDragPos = null;
		}


		/*
		* Scale an image over time
		*/
		zoomByScaleStart(startDist, x, y): void {
			if (this.panAnimationIsRunning || this.zoomAnimationIsRunning || this.mouseStartDragPos != null) return;
			this.touchStartDelta = startDist;
			this.clickX = x;
			this.clickY = y;
			this.initBufferedImage();
		}

		zoomByScale(dist): void {
			if (this.panAnimationIsRunning || this.zoomAnimationIsRunning || this.mouseStartDragPos != null || this.touchStartDelta == null) return;

			let deltaTime = (new Date).getTime() - this.lastSpeedTime;
			let deltaDist = dist - this.lastDist;
			this.speedDist = Math.round(deltaDist / deltaTime * 10);

			this.lastDist = dist;
			this.lastSpeedTime = (new Date).getTime();

			let scale = dist / this.touchStartDelta;
			this.currentMagnification = scale;
			this.drawScaledView(scale, this.clickX, this.clickY);
		}

		zoomByScaleEnd(animate: boolean = true): void {
			if (this.panAnimationIsRunning || this.zoomAnimationIsRunning || this.mouseStartDragPos != null || this.touchStartDelta == null) return;

			if (animate && !isNaN(this.speedDist) && this.speedDist != 0) {
				this.startTime = (new Date).getTime();
				this.zoomAnimationIsRunning = true;
				this.driftSpeedDist = this.speedDist;
				let that = this;
				window.requestAnimationFrame(function () { that.touchZoomDrifting() });
				return;
			}

			this.touchStartDelta = null;
			this.scaleFractalView(this.currentMagnification, this.clickX, this.clickY);
			if (animate) this.fractal.render();
		}


		/*
		* Start a zoom animation
		*/
		zoomStart(x: number, y: number, magnification: number, animationTime: number): void {
			if (this.panAnimationIsRunning) this.interruptPanAnimation();
			if (this.zoomAnimationIsRunning || this.mouseStartDragPos != null || this.touchStartDelta != null) return;
			this.zoomAnimationIsRunning = true;
			this.fractal.stopRendering();
			this.clickX = x
			this.clickY = y;
			this.targetMagnification = magnification;
			this.startTime = (new Date).getTime();
			this.initBufferedImage();
			let that = this;
			window.requestAnimationFrame(function () { that.zooming(animationTime) });
		}


		/*
		* Animations
		*/
		private dragDrifting(): void {
			if (!this.panAnimationIsRunning) return;
			let delta = (new Date).getTime() - this.startTime;
			let scale = delta / this.driftAnimationTime;
			if (scale > 1) {
				this.speedX = 0;
				this.speedY = 0;
				this.panAnimationIsRunning = false;
				this.dragEnd(this.lastmousex, this.lastmousey);
				return;
			}

			this.lastmousex = this.lastmousex + this.speedX;
			this.lastmousey = this.lastmousey + this.speedY;

			let dx = this.lastmousex - this.mouseStartDragPos.x;
			let dy = this.lastmousey - this.mouseStartDragPos.y;
			let canvas = this.fractal.complexPlain.getViewCanvas();
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			canvas.getContext('2d').drawImage(this.bufferedCanvas, dx, dy);

			let tempScale = EasingFunctions.easeOutQuart(scale)

			this.speedX = this.driftSpeedX - this.driftSpeedX * tempScale;
			this.speedY = this.driftSpeedY - this.driftSpeedY * tempScale;

			if (Math.abs(this.speedX) < 1 && Math.abs(this.speedY) < 1) {
				this.startTime = this.startTime - this.driftAnimationTime;
			}

			let that = this;
			window.requestAnimationFrame(function () { that.dragDrifting() });
		}

		private zooming(deltaTime: number): void {
			if (!this.zoomAnimationIsRunning) return;
			let delta = (new Date).getTime() - this.startTime;
			let scale = (delta / deltaTime);
			let quadScale = EasingFunctions.easeInOutQuad(scale)
			if (scale > 1) {
				scale = 1;
				this.currentMagnification = this.targetMagnification;
			}
			else if (this.targetMagnification > 1) {
				this.currentMagnification = 1 + (quadScale * (this.targetMagnification - 1));
			} else {
				this.currentMagnification = 1 - (quadScale * (1 - this.targetMagnification));
			}

			this.drawScaledView(this.currentMagnification, this.clickX, this.clickY);

			if (this.currentMagnification != this.targetMagnification) {
				let that = this;
				window.requestAnimationFrame(function () { that.zooming(deltaTime) });
			}
			else {
				this.scaleFractalView(this.currentMagnification, this.clickX, this.clickY)
				let version = this.fractal.getCurrentVersion();
				let that = this;
				setTimeout(function () {
					that.fractal.renderIfVersionIsNew(version);
				}, 300)
				this.zoomAnimationIsRunning = false;
			}
		}

		private touchZoomDrifting(): void {
			if (!this.zoomAnimationIsRunning) return;
			this.lastDist = this.lastDist + this.speedDist;
			if (this.lastDist < 5) this.startTime = this.startTime - this.driftAnimationTime;
			let delta = (new Date).getTime() - this.startTime;
			let scale = delta / this.driftAnimationTime;
			if (scale > 1) {
				this.speedDist = 0;
				this.zoomAnimationIsRunning = false;
				this.zoomByScaleEnd();
				return;
			}

			this.currentMagnification = this.lastDist / this.touchStartDelta;
			this.drawScaledView(this.currentMagnification, this.clickX, this.clickY);
			let tempScale = EasingFunctions.easeOutQuart(scale)
			this.speedDist = this.driftSpeedDist - this.driftSpeedDist * tempScale;

			let that = this;
			window.requestAnimationFrame(function () { that.touchZoomDrifting() });
		}

		private interruptPanAnimation() {
			this.panAnimationIsRunning = false;
			this.dragEnd(this.lastmousex, this.lastmousey, false);
		}

		private interruptZoomAnimation() {
			this.zoomAnimationIsRunning = false;
			this.zoomByScaleEnd(false);
		}

		private drawScaledView(quadScale, screenX, screenY) {
			let width = this.bufferedCanvas.width * quadScale;
			let height = this.bufferedCanvas.height * quadScale;
			let cx = screenX - (screenX * quadScale);
			let cy = screenY - (screenY * quadScale);
			let viewCanvas = this.fractal.complexPlain.getViewCanvas();
			viewCanvas.getContext('2d').clearRect(0, 0, viewCanvas.width, viewCanvas.height);
			viewCanvas.getContext('2d').drawImage(this.bufferedCanvas, cx, cy, width, height);
		}

		/*
		* Update the fractal with new postion
		*/
		private moveFractalView(deltaX, deltaY) {
			let oldPos = this.fractal.complexPlain.getMouse(this.fractal.complexPlain.getSquare().center);
			let newCenter = this.fractal.complexPlain.getComplexNumberFromMouse(oldPos.x - deltaX, oldPos.y - deltaY);
			this.fractal.complexPlain.replaceView(newCenter.r, newCenter.i, this.fractal.complexPlain.getSquare().width, this.fractal.complexPlain.getViewCanvas());
		}

		private scaleFractalView(scale, screenX, screenY) {
			let viewCanvas = this.fractal.complexPlain.getViewCanvas();
			let newWidthScale = this.bufferedCanvas.width / (2 * scale);
			let newHeightScale = this.bufferedCanvas.height / (2 * scale);
			let focusX = screenX - General.mapInOut(screenX, 0, this.bufferedCanvas.width, 0 - newWidthScale, newWidthScale);
			let focusY = screenY - General.mapInOut(screenY, 0, this.bufferedCanvas.height, 0 - newHeightScale, newHeightScale);
			let newCenter = this.fractal.complexPlain.getComplexNumberFromMouse(focusX, focusY);
			let newWidth = this.fractal.complexPlain.getSquare().width / scale;
			this.fractal.complexPlain.replaceView(newCenter.r, newCenter.i, newWidth, viewCanvas);
		}
	}

	/*
	class PointAnimator {
		version: number;
		fractal: Fractal;
		fun: Function;
		context: CanvasRenderingContext2D;
		constructor(fractal, fun) {
			this.version = 0;
			this.fractal = fractal;
			this.fun = fun;
			this.context = this.fractal.complexPlain.getViewCanvas().getContext('2d');
		}
	
		drawEsscapePoints(pos, mSet) {
			var Ci = mSet.complexPlain.getImaginaryAtY(pos.y);
			var Cr = mSet.complexPlain.getRealAtX(pos.x);
			var array = this.fun(Cr, Ci, this.fractal.iterations, this.fractal.escapeRadius);
			var lum = 255 / array.length;
	
			var version = this.version + 1;
			this.version = version;
			for (var i = 0; i <= array.length - 1; i++) {
				let x = this.fractal.complexPlain.getRealNumber(array[i][0]);
				let y = this.fractal.complexPlain.getImaginaryNumber(array[i][1]);
				this.drawToCanvasPoint(i * 20, x, y, "rgba(" + i * lum + ", " + i * lum + ", 255, 255)", version);
			}
		}
	
		drawToCanvasPoint(delay, x, y, rgba, v) {
			var that = this;
			setTimeout(function () {
				if (that.version != v) {
					//return;
				}
				that.context.beginPath();
				that.context.arc(x, y, 2.5, 0, 2 * Math.PI);
				that.context.stroke();
				that.context.fillStyle = rgba;
				that.context.fill();
			}, delay)
		}
	}*/

}

