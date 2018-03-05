export module General {
	/*
	* 	find where in output_range input_value is 
	*/
	export function mapInOut(input_value, input_start, input_end, output_start, output_end) {
		var input_range = input_end - input_start;
		var output_range = output_end - output_start;
		var output = (input_value - input_start) * output_range / input_range + output_start;
		return output;
	}

	/*
	*	Helper for slowing down high speed code for debugging
	*/
	export function debugSleep(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds) {
				break;
			}
		}
	}

	export function resizeCanvasToFillParent(canvas){
		var rect = canvas.parentNode.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
	
		canvas.style.width = rect.width.toString() + "px";;
		canvas.style.height = rect.height.toString() + "px";;
	}
}

/*
* Easing Functions - inspired from http://gizma.com/easing/
* only considering the t value for the range [0, 1] => [0, 1]
*/
export module EasingFunctions {
	// no easing, no acceleration
	export function linear(t) { return t }
	// accelerating from zero velocity
	export function easeInQuad(t) { return t * t }
	// decelerating to zero velocity
	export function easeOutQuad(t) { return t * (2 - t) }
	// acceleration until halfway, then deceleration
	export function easeInOutQuad(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
	// accelerating from zero velocity 
	export function easeInCubic(t) { return t * t * t }
	// decelerating to zero velocity 
	export function easeOutCubic(t) { return (--t) * t * t + 1 }
	// acceleration until halfway, then deceleration 
	export function easeInOutCubic(t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 }
	// accelerating from zero velocity 
	export function easeInQuart(t) { return t * t * t * t }
	// decelerating to zero velocity 
	export function easeOutQuart(t) { return 1 - (--t) * t * t * t }
	// acceleration until halfway, then deceleration
	export function easeInOutQuart(t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t }
	// accelerating from zero velocity
	export function easeInQuint(t) { return t * t * t * t * t }
	// decelerating to zero velocity
	export function easeOutQuint(t) { return 1 + (--t) * t * t * t * t }
	// acceleration until halfway, then deceleration 
	export function easeInOutQuint(t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
}