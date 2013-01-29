/**
* hoverIntent is similar to jQuery's built-in "hover" function except that
* instead of firing the onMouseOver event immediately, hoverIntent checks
* to see if the user's mouse has slowed down (beneath the sensitivity
* threshold) before firing the onMouseOver event.
* 
* hoverIntent r7 // 2013.01.29 // jQuery 1.7.0+
* <http://cherne.net/brian/resources/jquery.hoverIntent.html>
* 
* hoverIntent is currently available for use in all personal or commercial 
* projects under both MIT and GPL licenses. This means that you can choose 
* the license that best suits your project, and use it accordingly.
* 
* // basic usage (just like .hover) receives onMouseOver and onMouseOut functions
* $("ul li").hoverIntent( showNav , hideNav );
* $("ul li").hoverIntent( toggleNav );
* 
* // advanced usage receives configuration object only
* $("ul li").hoverIntent({
*	sensitivity: 7, // number = sensitivity threshold (must be 1 or higher)
*	interval: 100,   // number = milliseconds of polling interval
*	over: showNav,  // function = onMouseOver callback
*	timeout: 0,   // number = milliseconds delay before onMouseOut function call
*	out: hideNav    // function = onMouseOut callback
*	selector: 'selector' // string = CSS-Selector to do a delegate (Optional)
* });
* 
* @param  mouseover  onMouseOver function || An object with configuration options
* @param  mouseout  onMouseOut function  || Nothing (use configuration options object)
* @author    Brian Cherne brian(at)cherne(dot)net
*/
(function($) {

	$.fn.hoverIntent = function(mouseover, mouseout) {
		// instantiate variables
		// current X and Y position of mouse, updated by mousemove event
		// previous X and Y position of mouse, set by mouseover and polling interval
		var currentX, currentY, previousX, previousY;
		var options = {
			sensitivity: 7,
			interval: 100,
			timeout: 0,
			out: $.noop,
			over: $.noop,
			selector: null
		};
		// override configuration options with user supplied object
		var config = $.extend({ }, options,
			$.isPlainObject(mouseover)
				? mouseover // Is an object config
				: { over: mouseover, out: mouseout || mouseover }); // has a handlerIn, handlerOut or toggleHandle
		// A private function for getting mouse position
		var track = function(event) {
			currentX = event.pageX;
			currentY = event.pageY;
		};
		// A private function for comparing current and previous mouse position
		var compare = function(event, element) {
			// compare mouse positions to see if they've crossed the threshold
			if ( ( Math.abs(previousX-currentX) + Math.abs(previousY-currentY) ) < config.sensitivity ) {
				// set hoverIntent state to true (so mouseOut can be called)
				trigger(event, element, config.over);
			} else {
				clearTimeout(element.hoverIntent_t);
				// set previous coordinates for next time
				previousX = currentX;
				previousY = currentY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				element.hoverIntent_t = setTimeout(function(){ compare(event, element); }, config.interval);
			}
		};
		var trigger = function(event, element, callback) {
			clearTimeout(element.hoverIntent_t);
			element.hoverIntent_s = event.type === 'mouseenter';
			callback.call(element, event);
		};
		// A private function for handling mouse 'hovering'
		var handleHover = function(e) {
			// copy objects to be passed into t (required for event object to be passed in IE)
			var event = $.extend({}, e);
			var element = this;

			// cancel hoverIntent timer if it exists
			clearTimeout(element.hoverIntent_t);

			if (event.type === 'mouseenter') {
				// set "previous" X and Y position based on initial entry point
				previousX = event.pageX;
				previousY = event.pageY;
				// update "current" X and Y position based on mousemove
				$(element).on('mousemove', track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (!element.hoverIntent_s) {
					element.hoverIntent_t = setTimeout(function(){
						compare(event, element);
					}, config.interval);
				}
			} else {
				// unbind expensive mousemove event
				$(element).off('mousemove', track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (element.hoverIntent_s) {
					element.hoverIntent_t = setTimeout(function(){
						//delay
						trigger(event, element, config.out);
					}, config.timeout);
				}
			}
		};

		// bind the function to the two event listeners
		return this.on('mouseenter mouseleave', config.selector, handleHover);
	};
})(jQuery);