export class ComplexNumber {
	readonly r: number;
	readonly i: number;
	constructor(real, imaginary) {
		this.r = real;
		this.i = imaginary;
	}

	toString():string{
		return this.r+","+this.i
	}
}

export class ComplexSquare {
	readonly min: ComplexNumber;
	readonly max: ComplexNumber;
	readonly width: number;
	readonly height: number;
	readonly center: ComplexNumber;
	constructor(center: ComplexNumber, width: number, height: number) {
		this.center = center;
		this.width = width;
		this.height = height;
		this.min = new ComplexNumber(this.center.r - (this.width / 2), this.center.i + (this.height / 2));
		this.max = new ComplexNumber(this.center.r + (this.width / 2), this.center.i - (this.height / 2));
	}
}