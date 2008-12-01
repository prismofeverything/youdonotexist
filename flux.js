Vector.prototype.o = function(i) {
	return (i < 0 || i >= this.elements.length) ? null : this.elements[i];
};

Array.prototype.append = function(el) {
	this[this.length] = el;
};

var mote = function(spec) {
	var that = {};

	that.pos = spec.pos || $V([0, 0]);
	that.shape = spec.shape || [{method: 'lineTo', point: $V([0, 0])},
								{method: 'lineTo', point: $V([100, 100])},
								{method: 'lineTo', point: $V([200, -10])},
								{method: 'arc',    point: $V([230, 50]), args: [50, 0, Math.PI*2, true]},
								{method: 'lineTo', point: $V([280, -100])},
								{method: 'lineTo', point: $V([240, -50])}];
	that.color = spec.color || $V([0, 0, 0, 1]);
	that.rotation = spec.rotation || 0;
	that.fill = spec.fill || 'fill';

	// construct a simple bounding box to tell if further bounds checking is necessary
	that.findBox = function() {
		var xrange = [0, 0];
		var yrange = [0, 0];

		that.shape.each(function(vertex) {
			if(vertex.method == 'arc') {
				xrange[0] = (vertex.point.o(0) - vertex.args[0] < xrange[0]) ? vertex.point.o(0) - vertex.args[0] : xrange[0];
				xrange[1] = (vertex.point.o(0) + vertex.args[0] > xrange[1]) ? vertex.point.o(0) + vertex.args[0] : xrange[1];
				yrange[0] = (vertex.point.o(1) - vertex.args[0] < yrange[0]) ? vertex.point.o(1) - vertex.args[0] : yrange[0];
				yrange[1] = (vertex.point.o(1) + vertex.args[0] > yrange[1]) ? vertex.point.o(1) + vertex.args[0] : yrange[1];
			} else {
				xrange[0] = (vertex.point.o(0) < xrange[0]) ? vertex.point.o(0) : xrange[0];
				xrange[1] = (vertex.point.o(0) > xrange[1]) ? vertex.point.o(0) : xrange[1];
				yrange[0] = (vertex.point.o(1) < yrange[0]) ? vertex.point.o(1) : yrange[0];
				yrange[1] = (vertex.point.o(1) > yrange[1]) ? vertex.point.o(1) : yrange[1];
			}
		});

		return {
			x: xrange,
			y: yrange
		};
	};

	that.box = that.findBox();

	that.boxContains = function(point) {
		return (point.o(0) > that.box.x[0] &&
				point.o(0) < that.box.x[1] &&
				point.o(1) > that.box.y[0] &&
				point.o(1) < that.box.y[1]);
	};

	that.color_spec = function() {
		var inner = that.color.elements.map(function(component) {
			return Math.floor(component);
		}).join(', ');
		return "rgba(" + inner + ")";
	};

// 	that.contains = function(point) {
// 		return Math.pointWithin(point, that.shape.map(function(vertex) {
// 			return vertex.add(that.pos);
// 		}));
// 	};

	that.perceive = spec.perceive || function(env) {return null;};
	that.adjust = spec.adjust || function() {return null;};

	that.draw = function(context) {
		context.save();
		context[that.fill + "Style"] = that.color_spec();

		context.beginPath();
		context.moveTo.apply(context, that.pos.elements);

 		that.shape.each(function(vertex) {
			var point = vertex.point.add(that.pos).elements;
 			context[vertex.method].apply(context, point.concat(vertex.args));
 		});

		context.closePath();
		context[that.fill]();

		context.restore();
	};

	return that;
};

var flux = function(spec) {
	var that = {};

	var canvas, context;
	var now, before, interval;
	var	browser = {};

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

		that.motes.invoke("perceive", that);
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


//	that.shape = spec.shape || [$V([-20, 0]), $V([20, 20]), $V([30, -10]), $V([-20, -20])];
//	that.shape = spec.shape || [$V([0, 0]), $V([100, 10]), $V([200, -10])];
