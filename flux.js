Vector.prototype.o = function(i) {
	return (i < 0 || i >= this.elements.length) ? null : this.elements[i];
};

Array.prototype.append = function(el) {
	this[this.length] = el;
};

var mote = function(spec) {
	var that = {};

	that.pos = spec.pos || $V([0, 0]);
	that.shape = spec.shape || [$V([0, 0]), $V([20, 20]), $V([30, -10]), $V([200, 100])];
	that.color = spec.color || $V([0, 0, 0, 1]);

	that.color_spec = function() {
		var inner = that.color.elements.join(', ');
		return "rgba(" + inner + ")";
	};

	that.perceive = function(env){return null;};
	that.adjust = function(){return null;};

	that.draw = function(context) {
		context.save();

		var x = that.pos.o(0);
		var y = that.pos.o(1);
		context.fillStyle = that.color_spec();

		context.beginPath();
		context.moveTo(x, y);

 		that.shape.each(function(vertex) {
 			context.lineTo(x + vertex.o(0), y + vertex.o(1));
 		});

		context.fill();
		context.closePath();

		context.restore();
	};

	return that;
};

var flux = function(spec) {
	var canvas, context, now, before, interval,
		browser = {};

	var that = {};
	that.motes = spec.motes || [];
	that.id = spec.id || '';

	that.down = spec.down || function(m){return null;};
	that.up = spec.up || function(m){return null;};
	that.move = spec.move || function(m){return null;};

	var time = function() {
		return new Date().getTime();
	};

	var mouse = {
		pos: $V([0, 0]),
		prev: $V([0, 0]),
		down: false,

		diff: function() {
			pos.subtract(prev);
		}
	};

	var update = function() {
		before = now;
		now = time();
		interval = now - before;

		that.motes.invoke("perceive");
		that.motes.invoke("adjust");

		draw();
	};

	var draw = function() {
		context.clearRect(0, 0, browser.w, browser.h);
		that.motes.invoke("draw", context);
	};

	var mouseDown = function(e) {
		mouse.down = true;
		that.down(mouse);
	};

	var mouseUp = function(e) {
		mouse.down = false;
		that.up(mouse);
	};

	var mouseMove = function(e) {
		var scrollX = window.scrollX != null ? window.scrollX : window.pageXOffset;
		var scrollY = window.scrollY != null ? window.scrollY : window.pageYOffset;

		mouse.prev = mouse.pos;

		x = e.clientX - canvas.offsetLeft + scrollX;
		y = e.clientY - canvas.offsetTop + scrollY;

		mouse.pos = $V([x, y]);

		that.move(mouse);
	};

	that.init = function() {
		canvas = document.getElementById ? document.getElementById(spec.id) : null;
		if (!canvas || !canvas.getContext) {
			return;
		}
		context = canvas.getContext('2d');

		canvas.addEventListener('mousedown', mouseDown, false);
		canvas.addEventListener('mouseup', mouseUp, false);
		canvas.addEventListener('mousemove', mouseMove, false);

		canvas.width = browser.w = window.innerWidth;
		canvas.height = browser.h = window.innerHeight;

		setInterval(update, 20);
	};

	return that;
};


