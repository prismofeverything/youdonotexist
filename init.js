var homeostasis = (function() {
	var canvas, context, now,
		browser = {};

	var time = function() {
		return new Date().getTime();
	};

	var draw = function() {
		context.clearRect(0, 0, browser.w, browser.h);
		context.fillStyle = "rgb(80, 90, 170)";
		context.fillRect(100, 200, 50, 80);
	};

	return {
		init: function() {
			canvas = document.getElementById ? document.getElementById('homeostasis') : null;
			if (!canvas || !canvas.getContext) {
				return;
			}
			context = canvas.getContext('2d');

			// 	canvas.addEventListener('mousedown', mouseHandler.down, false);
			// 	canvas.addEventListener('mouseup', mouseHandler.up, false);

			canvas.width = browser.w = window.innerWidth;
			canvas.height = browser.h = window.innerHeight;

			now = time();
			setInterval(draw, 20);
		}
	};
})();



