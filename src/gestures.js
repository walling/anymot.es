/*
 * Setup 
 *			document.body.onswipe = function (evt) {
 *				swipe.textContent = JSON.stringify({
 *					angle: evt.angle,
 *					distance: evt.distance,
 *					direction: evt.direction,
 *				});
 *			}
 *
 * evt wll have the new elements angle, distance and direction which is one of
 * up, down, left or right.
 *
 */
var pageX = null;
var pageY = null;

var MIN_DISTANCE = 75;

function getPageXY(evt, element) {
	if (typeof(evt[element]) == undefined) {
		return evt.changedTouches[0][element];
	} else {
		return evt[element];
	}
}

// document.body.onmousedown = 
// document.body.ontouchstart = 
function swipeStart(evt) {
	// console.log("touchstart/mousedown");
	pageX = getPageXY(evt, 'pageX');
	pageY = getPageXY(evt, 'pageY');
};

document.addEventListener('mousedown', swipeStart, false);
document.addEventListener('touchstart', swipeStart, false);

// document.body.onmouseup =
// document.body.ontouchend = 
function swipeEnd(evt) {
	// console.log("touchend/mouseup");
	pageX2 = getPageXY(evt, 'pageX');
	pageY2 = getPageXY(evt, 'pageY');
	function sq (n) {
		return n*n;
	}
	var distance = Math.sqrt(sq(pageX2-pageX) + sq(pageY2-pageY));
	if (distance < MIN_DISTANCE) {
		// console.log("tooshort", distance);
		return;
	}
	var angle = Math.atan2(pageY - pageY2, pageX2 - pageX);
	// The threshold above/below which we declare this isn't a swipe
	var threshold = 0.2;
	function angleCloseEnough(target) {
		return (Math.abs(angle - target) < threshold);
	}
	var direction;
	if (angleCloseEnough(0)) {
		direction = 'right';
	} else if (angleCloseEnough(Math.PI/2)) {
		direction = 'up';
	} else if (angleCloseEnough(-Math.PI/2)) {
		direction = 'down';
	} else if (angleCloseEnough(Math.PI) || angleCloseEnough(-Math.PI)) {
		direction = 'left';
	} else {
		// console.log("weird angle", angle);
	}

	// console.log(pageY2 - pageY, pageX2 - pageX);
	evt.angle = angle;
	evt.distance = distance;
	evt.direction = direction;
	// console.log("swipe", angle, distance, direction);
	if (typeof(document.body.onswipe) != 'undefined') {
		 document.body.onswipe(evt);
	}
};
document.addEventListener('mouseup', swipeEnd, false);
document.addEventListener('touchend', swipeEnd, false);
