Vector.prototype.o = function(i) {
	return (i < 0 || i >= this.elements.length) ? null : this.elements[i];
};

Vector.prototype.magnitude = function() {
	return Math.sqrt(this.elements.inject(0, function(sum, element) {
		return sum + element * element;
	}));
};

Vector.prototype.scaleTo = function(magnitude) {
	return this.toUnitVector().x(magnitude);
};

Vector.prototype.inverse = function() {
	return $V(this.elements.map(function(el) {
		return 0 - el;
	}));
};

Array.prototype.append = function(el) {
	this[this.length] = el;
	return this;
};

// provide objects to represent atomic drawing operations
var op = {
	base: function(spec) {
		var that = {};

		that.method = spec.method || 'lineTo';
		that.to = spec.to || $V([0, 0]);

		that.applyPoint = spec.applyPoint || function(point) {
			return that.to.add(point).elements;
		};

		that.args = spec.args || function() {
			return that.to.elements;
		};

		return that;
	},

	line: function(spec) {
		return this.base(spec);
	},

	move: function(spec) {
		spec.method = 'moveTo';

		return this.base(spec);
	},

	arc: function(spec) {
		spec.method = 'arc';

		var that = this.base(spec);

		that.radius = spec.radius || 10;
		that.arc = spec.arc || $V([0, Math.PI*2]);
		that.clockwise = spec.clockwise || true;

		that.args = function() {
			return that.to.elements.concat([that.radius].concat(that.arc.elements).append(that.clockwise));
		};

		that.applyPoint = function(point) {
			return that.to.add(point).elements.concat([that.radius].concat(that.arc.elements).append(that.clockwise));
		};

		return that;
	},

	bezier: function(spec) {
		spec.method = 'bezierCurveTo';
		spec.to = spec.to || $V([10, 10]);

		var that = this.base(spec);

		that.control1 = spec.control1 || $V([5, 0]);
		that.control2 = spec.control2 || $V([10, 5]);

		that.args = function() {
			return that.control1.elements.concat(that.control2.elements).concat(that.to.elements);
		};

		that.applyPoint = function(point) {
			return that.control1.add(point).elements.concat(that.control2.add(point).elements).concat(that.to.add(point).elements);
		};

		return that;
	}
};

var tween = function(spec) {
	var that = {};

	that.obj = spec.obj || null;
	that.property = spec.property || 'this';
	that.target = spec.target || function() {return that.obj[that.property] === 0;};
	that.step = spec.step || function() {that.obj[that.property] -= 1;};

	that.cycle = function() {
		if (that.target()) {
			return false;
		} else {
			that.step();
			return true;
		}
	};

	return that;
};

var mote = function(spec) {
	var that = {};

	that.pos = spec.pos || $V([0, 0]);
	that.shape = spec.shape || [op.arc({to: $V([500, 500]), radius: 50, arc: $V([0, Math.PI*2])})];
	that.orientation = (spec.orientation === undefined) ? Math.random()*2*Math.PI : spec.orientation;
	that.rotation = (spec.rotation === undefined) ? 0 : spec.rotation;
	that.velocity = spec.velocity || $V([0, 0]);

	that.color = spec.color || $V([200, 200, 200, 1]);
	that.scale = spec.scale || $V([1, 1]);
	that.fill = spec.fill || 'fill';

	that.tweens = [];

	that.future = [];
	that.neighbors = [];

	// construct a simple bounding box to tell if further bounds checking is necessary
	that.findBox = function() {
		var xrange = [0, 0];
		var yrange = [0, 0];

		that.shape.each(function(vertex) {
			if(vertex.method == 'arc') {
				xrange[0] = (vertex.to.o(0) - vertex.radius < xrange[0]) ? vertex.to.o(0) - vertex.radius : xrange[0];
				xrange[1] = (vertex.to.o(0) + vertex.radius > xrange[1]) ? vertex.to.o(0) + vertex.radius : xrange[1];
				yrange[0] = (vertex.to.o(1) - vertex.radius < yrange[0]) ? vertex.to.o(1) - vertex.radius : yrange[0];
				yrange[1] = (vertex.to.o(1) + vertex.radius > yrange[1]) ? vertex.to.o(1) + vertex.radius : yrange[1];
			} else {
				xrange[0] = (vertex.to.o(0) < xrange[0]) ? vertex.to.o(0) : xrange[0];
				xrange[1] = (vertex.to.o(0) > xrange[1]) ? vertex.to.o(0) : xrange[1];
				yrange[0] = (vertex.to.o(1) < yrange[0]) ? vertex.to.o(1) : yrange[0];
				yrange[1] = (vertex.to.o(1) > yrange[1]) ? vertex.to.o(1) : yrange[1];
			}
		});

		return {
			x: xrange,
			y: yrange
		};
	};

	that.box = that.findBox();

	that.boxContains = function(point) {
		return (point.o(0) > that.box.x[0]+that.pos.o(0) &&
				point.o(0) < that.box.x[1]+that.pos.o(0) &&
				point.o(1) > that.box.y[0]+that.pos.o(1) &&
				point.o(1) < that.box.y[1]+that.pos.o(1));
	};

	that.color_spec = function() {
		var inner = that.color.elements.map(function(component) {
			return Math.floor(component);
		}).join(', ');
		return "rgba(" + inner + ")";
	};

	that.addTween = function(spec) {
		spec.obj = that;
		that.tweens.append(tween(spec));
	};

// 	that.contains = function(point) {
// 		return Math.pointWithin(point, that.shape.map(function(vertex) {
// 			return vertex.add(that.pos);
// 		}));
// 	};

	that.perceive = spec.perceive || function(env) {
		return null;

		that.submotes().each(function(submote) {
			submote.perceive(env);
		});
	};

	that.adjust = spec.adjust || function() {
		that.orientation += that.rotation;
		that.pos = that.pos.add(that.velocity);

		that.future.each(function(moment) {
			moment(that);
		});
		that.future = [];

		that.tweens = that.tweens.select(function(tween) {
			return tween.cycle();
		});

		that.submotes().each(function(submote) {
			submote.adjust();
		});
	};

	that.findClosest = function(others, predicate) {
		var closestMote = null;
		var closestDistance = null;

		others.each(function(other) {
			if (predicate(other)) {
				if (closestMote === null) {
					closestMote = other;
					closestDistance = other.pos.distanceFrom(that.pos);
				} else {
					var newDistance = other.pos.distanceFrom(that.pos);
					if (newDistance < closestDistance) {
						closestMote = other;
						closestDistance = newDistance;
					}
				}
			}
		});

		return closestMote;
	};

	that.draw = function(context) {
		context.save();
		context[that.fill + "Style"] = that.color_spec();
		context.translate(that.pos.o(0), that.pos.o(1));
		context.rotate(that.orientation);
		context.scale(that.scale.o(0), that.scale.o(1));

		context.beginPath();
		context.moveTo.apply(context, that.pos.elements);

 		that.shape.each(function(vertex) {
 			context[vertex.method].apply(context, vertex.args());
 		});

		context.closePath();
		context[that.fill]();

		that.submotes().each(function(submote) {
			submote.draw(context);
		});

		context.restore();
	};

	that.submotes = function() {
		return [];
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

	that.triangulate = function() {

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

		var x = e.clientX - canvas.offsetLeft + scrollX;
		var y = e.clientY - canvas.offsetTop + scrollY;

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

		context.strokeStyle = "rgba(0, 0, 0, 1)";
		context.strokeWidth = 5;

		setInterval(update, 20);
	};

	return that;
};


//	that.shape = spec.shape || [$V([-20, 0]), $V([20, 20]), $V([30, -10]), $V([-20, -20])];
//	that.shape = spec.shape || [$V([0, 0]), $V([100, 10]), $V([200, -10])];
