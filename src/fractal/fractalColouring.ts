import { Fractals } from "../fractal/fractal.module";
import { General } from "../helper/helper.module";

export namespace FractalColor {


	export class LinearGradient {
		private arr: Array<LinearGradientStop>
		private mn: number = 0;
		private md: number = 0.5;
		private mx: number = 1;
		private subscribers: Array<LinearGradientObserver> = new Array();
		private i: RGBcolor = new RGBcolor(0,0,0);
	
		constructor(arr: Array<LinearGradientStop> = null) {
			if (arr != null) {
				this.replaceAllStops(arr)
			}
		}

		public setInteriorColor(color:RGBcolor){
			this.i = color;
		}

		public getInteriorColor(){
			return this.i;
		}

		public replaceAllStops(arr: Array<LinearGradientStop>) {
			arr.sort(function (a: LinearGradientStop, b: LinearGradientStop): number {
				if (a.s > b.s) return 1
				if (a.s < b.s) return -1
				if (a.s == b.s) return 0
			});

			if (arr[0].s > 0) arr.unshift({ s: 0, c: arr[0].c });
			if (arr[arr.length - 1].s < 1) arr.push({ s: 1, c: arr[arr.length - 1].c });

			this.arr = arr;
		}

		public decodeJSON(json: string): void {
			let obj = JSON.parse(json);
			this.arr = obj.arr;
			this.mn = obj.mn
			this.md = obj.md
			this.mx = obj.mx
			this.i = obj.i ? obj.i : new RGBcolor(0,0,0);
		}

		public encodeJSON(): string {
			return JSON.stringify(this, function replacer(key, value) {
				if (key == "subscribers") return undefined;
				else return value;
			})
		}



		public subscribe(observer: LinearGradientObserver) {
			this.subscribers.push(observer);
		}

		public unsubscribe(observer: LinearGradientObserver) {
			this.subscribers.splice(this.subscribers.lastIndexOf(observer), 1);
		}

		public notifyChanging(excludeObserver: LinearGradientObserver) {
			for (let i = 0; i < this.subscribers.length; i++) {
				if (excludeObserver != this.subscribers[i]) {
					this.subscribers[i].linearGradientChanging();
				}
			}
		}

		public notifyChanged(excludeObserver: LinearGradientObserver) {
			for (let i = 0; i < this.subscribers.length; i++) {
				if (excludeObserver != this.subscribers[i]) {
					this.subscribers[i].linearGradientChanged();
				}
			}
		}		

		public setMin(n: number) {
			this.mn = n;
		}

		public setMid(n: number) {
			this.md = n;
		}

		public setMax(n: number) {
			this.mx = n;
		}

		public addStop(stop: LinearGradientStop): void {
			this.arr.push(stop);
		}

		public getStops(): Array<LinearGradientStop> {
			return this.arr
		}

		public getMin(): number {
			return this.mn;
		}

		public getMid(): number {
			return this.md;
		}

		public getMax(): number {
			return this.mx;
		}



		public smoothColorFromCompiledColor(n: number,compiledArray: Array<RGBcolor>) {
			let ce = Math.ceil(n);
			if (ce==compiledArray.length) return compiledArray[compiledArray.length-1];
			else {
				let r = Math.round(General.mapInOut(n, ce -1, ce, compiledArray[ce-1].r, compiledArray[ce].r))
				let g = Math.round(General.mapInOut(n, ce - 1, ce, compiledArray[ce-1].g, compiledArray[ce].g))
				let b = Math.round(General.mapInOut(n, ce - 1, ce, compiledArray[ce-1].b, compiledArray[ce].b))
				return new RGBcolor(r, g, b);
			}
		}

		public compileColor(maxValue: number): Array<RGBcolor> {
			var array = new Array(maxValue)
			for (let i = 0; i < array.length; i++) {
				let colorValue = General.mapInOut(i, 0, maxValue - 1, 0, 1);
				array[i] = this.getColorAt(colorValue); 
			}
			return array;
		}



		/*
		* Returns the colour in the gradiant for a val bettween 0 and 1
		*/
		public getColorAt(val: number, levels: { min: number, mid: number, max: number } = null): RGBcolor {
			if (this.arr.length < 1) throw new Error("this.arr.length < 1");
			if (val==1) return this.i;


			if (levels == null) levels = { min: this.mn, mid: this.md, max: this.mx }

			if (val < levels.min) val = 0;
			else if (val > levels.max) val = 1;
			else if (val <= levels.mid) val = General.mapInOut(val, levels.min, levels.mid, 0, 0.5);
			else if (val > levels.mid) val = General.mapInOut(val, levels.mid, levels.max, 0.5, 1);

			val = val - 1
			let trunc = Math.trunc(val);
			val = Math.abs(val % 1)
			if ((trunc % 2) == 0) val = Math.abs(1 - val)
			if (val < 0 || val > 1) throw Error("Val out of bounds " + val);


			var colorInRange = []
			for (var i = 0, len = this.arr.length; i < len; i++) {
				if (i > 0 && val <= this.arr[i].s) {
					colorInRange = [i - 1, i]
					break;
				}
			}


			let firstColor = this.arr[colorInRange[0]].c;
			let secondColor = this.arr[colorInRange[1]].c;
			var firstStop = this.arr[colorInRange[0]].s;
			var secondStop = this.arr[colorInRange[1]].s - firstStop;
			var valBetweenStops = (val) - firstStop;
			var secondRatio = valBetweenStops / secondStop
			var firstRatio = 1 - secondRatio

			return {				
				r: Math.round(firstColor.r * firstRatio + secondColor.r * secondRatio),
				g: Math.round(firstColor.g * firstRatio + secondColor.g * secondRatio),
				b: Math.round(firstColor.b * firstRatio + secondColor.b * secondRatio)
			};
		}
	}

	export interface LinearGradientObserver {
		linearGradientChanging(): void
		linearGradientChanged():void
	}

	export class LinearGradientStop {
		s: number
		c: RGBcolor
		constructor(stop: number, color: RGBcolor) {
			this.s = stop;
			this.c = color;
		}
	}

	export class RGBcolor {
		r: number
		g: number
		b: number
		constructor(r: number, g: number, b: number) {
			this.r = r;
			this.g = g;
			this.b = b;
		}
	}


	export function hexToRGB(hex: string): RGBcolor {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	export function rgbToHex(rgb: RGBcolor): string {
		return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
	}

	function componentToHex(c: number): string {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

}

export namespace FractalHistogram {

	export class Histogram {
		private histogram: Array<number>
		private subscribers: Array<HistogramObserver> = new Array();

		public subscribe(observer: HistogramObserver) {
			this.subscribers.push(observer);
		}

		public unsubscribe(observer: HistogramObserver) {
			this.subscribers.splice(this.subscribers.lastIndexOf(observer), 1);
		}

		public notify(excludeObserver: HistogramObserver) {
			for (let i = 0; i < this.subscribers.length; i++) {
				if (excludeObserver != this.subscribers[i]) {
					this.subscribers[i].histogramChanged();
				}
			}
		}

		public startHistogram(len: number) {
			this.histogram = Array.from(Array(len), () => 0);
		}

		public getData() {
			if (this.histogram) return this.histogram.slice(1, this.histogram.length - 1);
			else return [];
		}

		public incrementData(i: number) {
			this.histogram[i] = this.histogram[i] + 1;
		}


	}

	export interface HistogramObserver {
		histogramChanged(): void
	}
}


// class FractalColoring {
// 	fractal: Fractals.Fractal;
// 	totalPhase: number;
// 	redPhase: number;
// 	greenPhase: number;
// 	bluePhase: number;
// 	totalFrequency: number;
// 	redFrequency: number;
// 	greenFrequency: number;
// 	blueFrequency: number;
// 	redWidth: number;
// 	redColorCenter: number;
// 	greenWidth: number;
// 	greenColorCenter: number;
// 	blueWidth: number;
// 	blueColorCenter: number;

// 	compiledMaxN: number;
// 	compiledRn: number;
// 	compiledGn: number;
// 	compiledBn: number;
// 	compiledRedFrequency: number;
// 	compiledGreenFrequency: number;
// 	compiledBlueFrequency: number;
// 	nthRn: number;
// 	nthGn: number;
// 	nthBn: number;

// 	constructor(fractal: Fractals.Fractal) {
// 		this.fractal = fractal;
// 		this.totalPhase = 0;
// 		this.redPhase = 0;
// 		this.greenPhase = 0;
// 		this.bluePhase = 0;
// 		this.totalFrequency = 1;
// 		this.redFrequency = 1;
// 		this.greenFrequency = 1;
// 		this.blueFrequency = 1;
// 		this.redWidth = 127;
// 		this.redColorCenter = 128;
// 		this.greenWidth = 127;
// 		this.greenColorCenter = 128;
// 		this.blueWidth = 127;
// 		this.blueColorCenter = 128;
// 	}

// 	changeColor(commandString: string) {
// 		let commands = commandString.split(",");
// 		for (let i = 0; i < commands.length; i++) {
// 			let thisCommand = commands[i].split(":");

// 			let command = thisCommand[0];
// 			let value = thisCommand[1];

// 			if (command == "rp") {
// 				this.redPhase = parseInt(value);
// 			}
// 			else if (command == "gp") {
// 				this.greenPhase = parseInt(value);
// 			}
// 			else if (command == "bp") {
// 				this.bluePhase = parseInt(value);
// 			}
// 			else if (command == "rf") {
// 				this.redFrequency = parseInt(value);
// 			}
// 			else if (command == "gf") {
// 				this.greenFrequency = parseInt(value);
// 			}
// 			else if (command == "bf") {
// 				this.blueFrequency = parseInt(value);
// 			}
// 			else if (command == "rw") {
// 				this.redWidth = parseInt(value);
// 			}
// 			else if (command == "gw") {
// 				this.greenWidth = parseInt(value);
// 			}
// 			else if (command == "bw") {
// 				this.blueWidth = parseInt(value);
// 			}
// 			else if (command == "rc") {
// 				this.redColorCenter = parseInt(value);
// 			}
// 			else if (command == "gc") {
// 				this.greenColorCenter = parseInt(value);
// 			}
// 			else if (command == "bc") {
// 				this.blueColorCenter = parseInt(value);
// 			}
// 			else if (command == "tp") {
// 				this.totalPhase = parseInt(value);
// 			}
// 			else if (command == "tf") {
// 				this.totalFrequency = parseInt(value);
// 			}
// 		}
// 	}

// 	compile(n_max: number) {
// 		this.compiledMaxN = n_max;
// 		let compiled100thMaxN = n_max / 100;
// 		let frequency = (Math.PI * 2) / n_max;
// 		frequency = frequency * this.totalFrequency;

// 		this.compiledRedFrequency = this.redFrequency * frequency;
// 		this.compiledGreenFrequency = this.greenFrequency * frequency;
// 		this.compiledBlueFrequency = this.blueFrequency * frequency;
// 		this.compiledRn = compiled100thMaxN * (this.redPhase + this.totalPhase);
// 		this.compiledGn = compiled100thMaxN * (this.greenPhase + this.totalPhase);
// 		this.compiledBn = compiled100thMaxN * (this.bluePhase + this.totalPhase);
// 	}


// 	compiledNormalizediterationcount(n: number, pixel: number, Zr: number, Zi: number): void {
// 		if (n >= this.compiledMaxN) {
// 			this.fractal.img.data[(pixel * 4) + 0] = 0; //red
// 			this.fractal.img.data[(pixel * 4) + 1] = 0; //green
// 			this.fractal.img.data[(pixel * 4) + 2] = 0; //blue
// 			this.fractal.img.data[(pixel * 4) + 3] = 255;  //alphas
// 		}
// 		else {
// 			// normalize colors
// 			n = n + 1 - Math.log((Math.log(Zr * Zr + Zi * Zi) / 2) / 0.301029996) / 0.301029996

// 			//phase shift colors
// 			this.nthRn = n + this.compiledRn;
// 			this.nthRn = this.nthRn > this.compiledMaxN ? this.nthRn - this.compiledMaxN : this.nthRn;
// 			this.nthGn = n + this.compiledGn;
// 			this.nthGn = this.nthGn > this.compiledMaxN ? this.nthGn - this.compiledMaxN : this.nthGn;
// 			this.nthBn = n + this.compiledBn;
// 			this.nthBn = this.nthBn > this.compiledMaxN ? this.nthBn - this.compiledMaxN : this.nthBn;

// 			this.fractal.img.data[(pixel * 4) + 0] = Math.sin(this.compiledRedFrequency * this.nthRn) * this.redWidth + this.redColorCenter;
// 			this.fractal.img.data[(pixel * 4) + 1] = Math.sin(this.compiledGreenFrequency * this.nthGn) * this.greenWidth + this.greenColorCenter;
// 			this.fractal.img.data[(pixel * 4) + 2] = Math.sin(this.compiledBlueFrequency * this.nthBn) * this.blueWidth + this.blueColorCenter;
// 			this.fractal.img.data[(pixel * 4) + 3] = 255;  //alphas
// 		}
// 	}

// 	// normalizediterationcount(n: number, x: number, n_max: number, Zr: number, Zi: number): void {
// 	// 	if (n >= n_max) {
// 	// 		this.fractal.img.data[(x * 4) + 0] = 0; //red
// 	// 		this.fractal.img.data[(x * 4) + 1] = 0; //green
// 	// 		this.fractal.img.data[(x * 4) + 2] = 0; //blue
// 	// 		this.fractal.img.data[(x * 4) + 3] = 255;  //alphas
// 	// 	}
// 	// 	else {
// 	// 		// normalize colors
// 	// 		var log_zn = Math.log(Zr * Zr + Zi * Zi) / 2
// 	// 		var nu = Math.log(log_zn / Math.log(2)) / Math.log(2)
// 	// 		n = n + 1 - nu

// 	// 		var rgb = this.picColor(n, n_max);

// 	// 		this.fractal.img.data[(x * 4) + 0] = rgb[0]; //red
// 	// 		this.fractal.img.data[(x * 4) + 1] = rgb[1]; //green
// 	// 		this.fractal.img.data[(x * 4) + 2] = rgb[2]; //blue
// 	// 		this.fractal.img.data[(x * 4) + 3] = 255;  //alphas
// 	// 	}
// 	// }

// 	picColor(n: number, n_max: number): [number, number, number] {
// 		//phase shift colors
// 		var Rn = n + ((n_max / 100) * (this.redPhase + this.totalPhase));
// 		Rn = Rn > n_max ? Rn - n_max : Rn;
// 		var Gn = n + ((n_max / 100) * (this.greenPhase + this.totalPhase));
// 		Gn = Gn > n_max ? Gn - n_max : Gn;
// 		var Bn = n + ((n_max / 100) * (this.bluePhase + this.totalPhase));
// 		Bn = Bn > n_max ? Bn - n_max : Bn;

// 		//calculate colors
// 		var frequency = (Math.PI * 2) / n_max;
// 		frequency = frequency * this.totalFrequency;
// 		var r = Math.sin(this.redFrequency * frequency * Rn) * this.redWidth + this.redColorCenter;
// 		var g = Math.sin(this.greenFrequency * frequency * Gn) * this.greenWidth + this.greenColorCenter;
// 		var b = Math.sin(this.blueFrequency * frequency * Bn) * this.blueWidth + this.blueColorCenter;

// 		return [r, g, b];
// 	}
// }