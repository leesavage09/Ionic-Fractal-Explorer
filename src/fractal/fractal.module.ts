import { FractalColor, FractalHistogram } from "../fractal/fractalColouring";
import { ComplexNumber, ComplexSquare } from "../fractal/complexNumbers";
import { General, EasingFunctions } from "../helper/helper.module";
import { FractalEquations } from "./fractalEquations.module";

export namespace Fractals {

	export class Fractal implements FractalColor.LinearGradientObserver {
		iterations: number = 85;
		escapeRadius: number = 8;
		private color: FractalColor.LinearGradient;
		complexPlain: ComplexPlain;
		img: ImageData;
		private calculationFunction: FractalEquations.equation;
		private renderVersion: number = 0;
		public updateTimeout: number = 50;
		private lastUpdate: number = (new Date).getTime();
		private animator: FractalNavigationAnimator;
		private maxZoomListner: FractalEventListner;
		private histogram: FractalHistogram.Histogram = new FractalHistogram.Histogram()
		private subscribers: Array<ChangeObserver> = new Array();
		private compiledColor: Array<FractalColor.RGBcolor>; //Array< Array<number> >;
		public currentScanLine = 0;
		public webGL: boolean = true;
		public webGLcanvas: HTMLCanvasElement;
		private webGLcontext;
		private webGLprogram;
		private virtexShader = `
								precision lowp float;
								attribute vec2 a_Position;
								void main() {
								gl_Position = vec4(a_Position.x, a_Position.y, 0.0, 1.0);
								}`;
		private fragmentShader = `
									precision highp float;									
									uniform vec2 u_zoomCenter;
									uniform vec2 u_zoomSize;
									uniform int u_maxIterations;
									uniform vec2 u_res;
									uniform vec3 u_arr[100];
									uniform int u_arr_len;
									uniform sampler2D tex;

									const float log2 = log(2.0);
									
									vec2 f(vec2 x, vec2 c) {
										return mat2(x,-x.y,x.x)*x + c;
									}

									float mapInOut(float input_value, float input_start, float input_end, float output_start, float output_end) {
										float input_range = input_end - input_start;
										float output_range = output_end - output_start;
										float o = (input_value - input_start) * output_range / input_range + output_start;
										return o;
									}

									void main() {
										vec2 screencords = vec2(gl_FragCoord.x-u_res.x/2.0,0.0-gl_FragCoord.y+u_res.y/2.0);
										vec2 uv = screencords / u_res;
										vec2 c = u_zoomCenter + uv * u_zoomSize;

										vec2 x = vec2(0.0);
										int n = 0;
										for (int i = 0; i < 10000; ++i) {
											if (n < u_maxIterations && (x.x * x.x + x.y * x.y) <= 8.0) {
												x = f(x, c);
											}else {
												n = i;
												break;
											}
							
										}

										float f_i = float(n);
										if (f_i >= float(u_maxIterations)) {											
											gl_FragColor = texture2D(tex, vec2(511.0/512.0,0.5));
											return; 	
										}

										float log_zn = log(x.x * x.x + x.y * x.y) / 2.0;
										float nu = log(log_zn / log2) / log2;
										f_i = f_i + 1.0 - nu;
										if (f_i < 0.0) f_i = 0.0; 
										
										float ce = ceil(f_i);
										float bucketLOW =  mapInOut(ce-1.0,0.0,float(u_maxIterations),0.0,511.0) / 512.0;
										float bucketHI =   mapInOut(ce,    0.0,float(u_maxIterations),0.0,511.0) / 512.0;
										float r = mapInOut(f_i, ce-1.0, ce, texture2D(tex, vec2(bucketLOW,0.5)).r, texture2D(tex, vec2(bucketHI,0.5)).r );											
										float g = mapInOut(f_i, ce-1.0, ce, texture2D(tex, vec2(bucketLOW,0.5)).g, texture2D(tex, vec2(bucketHI,0.5)).g );											
										float b = mapInOut(f_i, ce-1.0, ce, texture2D(tex, vec2(bucketLOW,0.5)).b, texture2D(tex, vec2(bucketHI,0.5)).b );											
										gl_FragColor = vec4(r,g,b,1.0);
										return;
									}`;
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

		public linearGradientChanging() {
			if (this.webGL) {
				this.renderWebGLLOW();
			}
			else {
				this.render();
			}
		}

		linearGradientChanged() {
			if (this.webGL) {
				this.renderWebGLFull();
			}else {
				this.render();
			}
		}

		private webGLinits() {
			/* obtain a webgl rendering context */
			this.webGLcontext = this.webGLcanvas.getContext("webgl", { preserveDrawingBuffer: true });

			if (!this.webGLcontext) throw new Error("cant get webGL context :(");

			/* compile and link shaders */
			var vertex_shader = this.webGLcontext.createShader(this.webGLcontext.VERTEX_SHADER);
			var fragment_shader = this.webGLcontext.createShader(this.webGLcontext.FRAGMENT_SHADER);
			this.webGLcontext.shaderSource(vertex_shader, this.virtexShader);
			this.webGLcontext.shaderSource(fragment_shader, this.fragmentShader);
			this.webGLcontext.compileShader(vertex_shader);
			if (this.webGLcontext.getShaderInfoLog(vertex_shader)) console.log(this.webGLcontext.getShaderInfoLog(vertex_shader));
			this.webGLcontext.compileShader(fragment_shader);
			if (this.webGLcontext.getShaderInfoLog(fragment_shader)) console.log(this.webGLcontext.getShaderInfoLog(fragment_shader));
			this.webGLprogram = this.webGLcontext.createProgram();
			this.webGLcontext.attachShader(this.webGLprogram, vertex_shader);
			this.webGLcontext.attachShader(this.webGLprogram, fragment_shader);
			this.webGLcontext.linkProgram(this.webGLprogram);
			this.webGLcontext.useProgram(this.webGLprogram);

			/* create a vertex buffer for a square */
			var vertices = new Float32Array([
				-1, -1, -1, 1, 1, 1,
				-1, -1, 1, -1, 1, 1,
			]);
			var vertex_buf = this.webGLcontext.createBuffer(); //this.webGLcontext.ARRAY_BUFFER
			this.webGLcontext.bindBuffer(this.webGLcontext.ARRAY_BUFFER, vertex_buf);
			this.webGLcontext.bufferData(this.webGLcontext.ARRAY_BUFFER, new Float32Array(vertices), this.webGLcontext.STATIC_DRAW);

			/* set up the position attribute */
			var position_attrib_location = this.webGLcontext.getAttribLocation(this.webGLprogram, "a_Position");
			this.webGLcontext.enableVertexAttribArray(position_attrib_location);
			this.webGLcontext.vertexAttribPointer(position_attrib_location, 2, this.webGLcontext.FLOAT, false, 0, 0);

			/* create texture */
			// if (!this.webGLcontext.getExtension("OES_texture_float")) { // <<-- enables RGBA float values, handy!
			// 	alert("cant pass in floats, use 8-bit values instead.");
			// }
			this.webGLcontext.activeTexture(this.webGLcontext.TEXTURE0);
			this.webGLcontext.bindTexture(this.webGLcontext.TEXTURE_2D, this.webGLcontext.createTexture());
			this.webGLcontext.texParameteri(this.webGLcontext.TEXTURE_2D, this.webGLcontext.TEXTURE_MAG_FILTER, this.webGLcontext.NEAREST);
			this.webGLcontext.texParameteri(this.webGLcontext.TEXTURE_2D, this.webGLcontext.TEXTURE_MIN_FILTER, this.webGLcontext.NEAREST);

		}
		
		public renderWebGLFull() {
			this.webGLcanvas.width = this.webGLcanvas.clientWidth;
			this.webGLcanvas.height = this.webGLcanvas.clientHeight;
			this.renderWebGL();
		}

		public renderWebGLLOW() {
			this.webGLcanvas.width = Math.round(this.webGLcanvas.clientWidth * 0.2);
			this.webGLcanvas.height = Math.round(this.webGLcanvas.clientHeight * 0.2);
			this.renderWebGL();
		}

		public renderWebGL() {
			if (!this.webGLcontext && !this.webGLprogram) this.webGLinits();
			var self = this;

			//setup color texture
			let colourArray = new Uint8Array(512 * 3);
			for (var i = 0; i < 511; ++i) {
				let percent = i / 511;
				let rgb = this.color.getColorAt(percent);
				colourArray[(i * 3) + 0] = rgb.r;
				colourArray[(i * 3) + 1] = rgb.g;
				colourArray[(i * 3) + 2] = rgb.b;
			}
			let rgb = this.color.getColorAt(1.0);
			colourArray[(511 * 3) + 0] = rgb.r;
			colourArray[(511 * 3) + 1] = rgb.g;
			colourArray[(511 * 3) + 2] = rgb.b;

			//add texture
			this.webGLcontext.texImage2D(this.webGLcontext.TEXTURE_2D, 0, this.webGLcontext.RGB,
				512, 1, 0,
				this.webGLcontext.RGB, this.webGLcontext.UNSIGNED_BYTE, colourArray);
			var z = this.webGLcontext.getUniformLocation(this.webGLprogram, "tex");
			this.webGLcontext.uniform1i(z, this.webGLcontext.TEXTURE0);

			/* these hold the state of zoom operation */
			var zoom_center = [self.complexPlain.getSquare().center.r, self.complexPlain.getSquare().center.i];
			var zoom_size = [self.complexPlain.getSquare().width, self.complexPlain.getSquare().height];

			let pixWidth = zoom_size[0] / self.webGLcanvas.width;
			let pixHeight = zoom_size[1] / self.webGLcanvas.height;
			if (pixWidth < 1.0e-7 || pixHeight < 1.0e-7) {
				self.webGL = false;
				if (self.maxZoomListner != null) self.maxZoomListner.CPURendering();
				self.render();
				self.webGLcanvas.style.visibility = "hidden";
				return;
			}
			/* find uniform locations */
			var zoom_center_uniform = self.webGLcontext.getUniformLocation(self.webGLprogram, "u_zoomCenter");
			var zoom_size_uniform = self.webGLcontext.getUniformLocation(self.webGLprogram, "u_zoomSize");
			var max_iterations_uniform = self.webGLcontext.getUniformLocation(self.webGLprogram, "u_maxIterations");
			var u_res = self.webGLcontext.getUniformLocation(self.webGLprogram, "u_res");
			var u_arr = self.webGLcontext.getUniformLocation(self.webGLprogram, "u_arr");
			var u_arr_len = self.webGLcontext.getUniformLocation(self.webGLprogram, "u_arr_len");

			/* bind inputs & render frame */
			self.webGLcontext.uniform2fv(zoom_center_uniform, zoom_center);
			self.webGLcontext.uniform2fv(zoom_size_uniform, zoom_size);
			self.webGLcontext.uniform1i(max_iterations_uniform, self.iterations);
			self.webGLcontext.uniform2f(u_res, self.webGLcanvas.width, self.webGLcanvas.height);

			self.webGLcontext.viewport(0, 0, self.webGLcanvas.width, self.webGLcanvas.height);
			self.webGLcontext.clearColor(0.0, 0.0, 0.0, 0.0);
			self.webGLcontext.clear(self.webGLcontext.COLOR_BUFFER_BIT);
			self.webGLcontext.drawArrays(self.webGLcontext.TRIANGLES, 0, 6);
		}

		public render(fullRes: boolean = false): void {
			if (this.webGL) {
				this.renderWebGLFull();
				return;
			}
			let pixWidth = this.complexPlain.getSquare().width / this.complexPlain.getViewCanvas().width;
			let pixHeight = this.complexPlain.getSquare().height / this.complexPlain.getViewCanvas().height;
			if (pixWidth > 1.0e-7 || pixHeight > 1.0e-7) {
				this.webGL = true;
				if (this.maxZoomListner != null) this.maxZoomListner.WEBGLRendering();
				this.renderWebGLFull();
				this.webGLcanvas.style.visibility = "visible";
				return;
			}

			this.stopRendering();
			if (this.complexPlain.getSquare().width < 5.2291950245225395e-15) {
				if (this.maxZoomListner != null) this.maxZoomListner.maxZoomReached();
			}
			if (!fullRes) this.complexPlain.makeAlternativeResolutionCanvas(0.2);
			this.histogram.startHistogram(this.iterations);
			this.compiledColor = this.color.compileColor(this.iterations);
			var self = this;
			setTimeout(function () {
				self.scanLine(self.complexPlain.getDrawableHeight(), self.renderVersion);
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
				if (n > this.iterations) throw Error("n out of bounds " + n + ">" + this.iterations)
				if (n <= 0) n = 0.1;//throw Error("n out of bounds " + n + "< 0")

				this.histogram.incrementData(Math.floor(n))

				let col = this.color.smoothColorFromCompiledColor(n, this.compiledColor);

				this.img.data[(x * 4) + 0] = col.r;
				this.img.data[(x * 4) + 1] = col.g;
				this.img.data[(x * 4) + 2] = col.b;
				this.img.data[(x * 4) + 3] = 255;
			}
			this.complexPlain.updateCanvas(y);

			var self = this;
			if (y > 0) {
				var now = (new Date).getTime();
				if ((now - this.lastUpdate) >= this.updateTimeout) {
					this.lastUpdate = now;
					setTimeout(function () {
						self.scanLine(y - 1, version);
					}, 1);// using timeout 1 to force thread to yeald so we can update UI
				}
				else {
					this.scanLine(y - 1, version);
				}
			}
			else if (!this.complexPlain.drawableAndViewAreEqual()) {
				this.histogram.notify(null);
				this.complexPlain.makeAlternativeResolutionCanvas(1);
				this.lastUpdate = (new Date).getTime();
				setTimeout(function () {
					self.scanLine(self.complexPlain.getDrawableHeight(), version);
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

		public setMaxZoomListener(l: FractalEventListner) {
			this.maxZoomListner = l;
		}

		public deleteMaxZoomListener() {
			this.maxZoomListner = null;
		}
	}

	export interface FractalEventListner {
		maxZoomReached();
		WEBGLRendering();
		CPURendering();
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
			//if (!this.fractal.webGL) {
			this.bufferedCanvas.getContext('2d').drawImage(this.fractal.complexPlain.getViewCanvas(), 0, 0);
			//}
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

			this.drawOffsetView();
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

			this.drawOffsetView();



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
				}, 0)
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
			if (this.fractal.webGL) {
				let viewCanvas = this.fractal.complexPlain.getViewCanvas();
				let newCenter = this.fractal.complexPlain.getSquare().center;
				let newWidth = this.fractal.complexPlain.getSquare().width;
				this.scaleFractalView(quadScale, screenX, screenY)
				this.fractal.renderWebGLLOW();
				this.fractal.complexPlain.replaceView(newCenter.r, newCenter.i, newWidth, viewCanvas);
			}
			else {
				let width = this.bufferedCanvas.width * quadScale;
				let height = this.bufferedCanvas.height * quadScale;
				let cx = screenX - (screenX * quadScale);
				let cy = screenY - (screenY * quadScale);
				let viewCanvas = this.fractal.complexPlain.getViewCanvas();
				viewCanvas.getContext('2d').clearRect(0, 0, viewCanvas.width, viewCanvas.height);
				viewCanvas.getContext('2d').drawImage(this.bufferedCanvas, cx, cy, width, height);
			}
		}

		private drawOffsetView() {
			if (this.fractal.webGL) {
				let moveX = this.lastmousex - this.mouseStartDragPos.x;
				let moveY = this.lastmousey - this.mouseStartDragPos.y;
				this.moveFractalView(moveX, moveY);
				this.mouseStartDragPos.x = this.lastmousex;
				this.mouseStartDragPos.y = this.lastmousey;
				this.fractal.renderWebGLLOW();
			} else {
				let dx = this.lastmousex - this.mouseStartDragPos.x;
				let dy = this.lastmousey - this.mouseStartDragPos.y;
				let canvas = this.fractal.complexPlain.getViewCanvas();
				canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
				canvas.getContext('2d').drawImage(this.bufferedCanvas, dx, dy);
			}
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


	// class fpsTimer {
	// 	private static times = [];
	// 	private static fps;
	// 	private static running = false;


	// 	private static lastCall = performance.now();
	// 	private static frames = 0;

	// 	public static getAvrgFPS() {

	// 		if (!fpsTimer.running) {
	// 			fpsTimer.refreshLoop();
	// 			fpsTimer.running = true;
	// 		}
	// 		var thisCall = performance.now();
	// 		var dt = (thisCall - fpsTimer.lastCall)/1000;

	// 		var res =  fpsTimer.frames/dt;

	// 		fpsTimer.lastCall = thisCall;
	// 		fpsTimer.frames = 0;

	// 		return res;
	// 	}

	// 	public static getFPS() {
	// 		if (!fpsTimer.running) {
	// 			fpsTimer.refreshLoop();
	// 			fpsTimer.running = true;
	// 		}
	// 		return fpsTimer.fps;
	// 	}

	// 	public static refreshLoop() {
	// 		window.requestAnimationFrame(function () {
	// 			const now = performance.now();
	// 			while (fpsTimer.times.length > 0 && fpsTimer.times[0] <= now - 1000) {
	// 				fpsTimer.times.shift();
	// 			}
	// 			fpsTimer.times.push(now);
	// 			fpsTimer.fps = fpsTimer.times.length;
	// 			fpsTimer.frames = fpsTimer.frames + 1;
	// 			fpsTimer.refreshLoop();
	// 		});
	// 	}

	// }

	// class fpsTimer {
	// 	public static fps: number = 0;

	// 	private static running: boolean = false;
	// 	private static then: number = 0;
	// 	private static numFrames: number = 0;




	// 	public static getFPS() {
	// 		if (!fpsTimer.running) fpsTimer.runTimer();
	// 		fpsTimer.numFrames = 0
	// 		return fpsTimer.fps;
	// 	}

	// 	private static runTimer() {
	// 		var now = Date.now() / 1000;
	// 		var elapsedTime = now - fpsTimer.then;
	// 		fpsTimer.then = now;

	// 		fpsTimer.fps = 1 / elapsedTime;
	// 		fpsTimer.numFrames = fpsTimer.numFrames + 1;
	// 		//console.log("fps",fpsTimer.fps)

	// 		window.requestAnimationFrame(fpsTimer.runTimer);
	// 	};

	// }

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

