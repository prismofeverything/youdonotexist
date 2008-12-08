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

var bounds = function(xlow, xhigh, ylow, yhigh) {
	var that = {};

	that.x = [xlow, xhigh];
	that.y = [ylow, yhigh];

	that.unindex = function(index) {
		if (index === 0) {
			return that.x;
		} else {
			return that.y;
		}
	};

	that.low = function() {
		return [xlow, ylow];
	};

	that.high = function() {
		return [xhigh, yhigh];
	};

	that.width = function() {
		return xhigh - xlow;
	};

	that.height = function() {
		return yhigh - ylow;
	};

	that.randomX = function() {
		return Math.random()*that.width()+that.x[0];
	};

	that.randomY = function() {
		return Math.random()*that.height()+that.y[0];
	};

	that.randomPoint = function() {
		return [that.randomX(), that.randomY()];
	};

	that.check = function(point) {
		return point.map(function(a, index) {
			if (a < that.unindex(index)[0]) {
				return -1;
			} else if(a > that.unindex(index)[1]) {
				return 1;
			} else {
				return 0;
			}
		});
	};

	that.inside = function(point) {
		return check.inject(true, function(side, a, index) {
			return side && a === 0;
		});
	};

	return that;
};

// provide objects to represent atomic drawing operations
var op = {
	base: function(spec) {
		var that = {};

		that.method = spec.method || 'lineTo';
		that.to = spec.to || $V([0, 0]);

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

		return that;
	}
};

var tween = function(spec) {
	var that = {};

	that.obj = spec.obj || spec;
	that.property = spec.property || spec.property === 0 ? spec.property : 'this';
	that.target = spec.target || function(value) {return value === 0;};
	that.step = spec.step || function(value) {return value - 1;};

	that.value = function() {
		return that.obj[that.property];
	};

	that.cycle = function() {
		if (that.target(that.value())) {
			return false;
		} else {
			that.obj[that.property] = that.step(that.value());
			return true;
		}
	};

	return that;
};

var tweenN = function(spec) {
	var that = tween(spec);
	var increment = spec.increment || spec.cycles ? (spec.to - spec.obj[spec.property]) / spec.cycles : 1;

	that.test = spec.test || function(a, b) {return true;};
	that.to = spec.to || 0;

	that.target = spec.target || function(value) {
		return that.test(value, that.to);
	};

	that.step = spec.step || function(value) {
		return value + increment;
	};

	return that;
};

// these are inclusive of the value of 'where'
tweenN.greater = function(where, to) {return where >= to;};
tweenN.less = function(where, to) {return where <= to;};

var tweenV = function(spec) {
	var that = {};

	that.obj = spec.obj || spec;
	that.property = spec.property || 'this';
	that.to = spec.to || $V([1, 1]);
	that.cycles = spec.cycles || 10;

	that.vector = function() {
		return that.obj[that.property];
	};

	var differing = that.vector().elements.select(function(el, index) {
		return !(el === that.to.o(index));
	});

	var tweens = differing.map(function(el, index) {
		return tweenN({
			obj: that.vector().elements,
			property: index,
			to: that.to.o(index),
			cycles: that.cycles,
			test: (that.vector().o(index) < that.to.o(index)) ? tweenN.greater : tweenN.less
		});
	});

	that.cycle = function() {
		tweens = tweens.select(function(tween) {return tween.cycle();});
		return tweens.length > 0;
	};

	return that;
};

var mote = function(spec) {
	var that = {};

	that.supermote = spec.supermote || null;
	that.submotes = spec.submotes || [];

	that.pos = spec.pos || $V([0, 0]);
	that.shape = spec.shape || [op.arc({to: $V([500, 500]), radius: 50, arc: $V([0, Math.PI*2])})];
	that.orientation = (spec.orientation === undefined) ? Math.random()*2*Math.PI : spec.orientation;
	that.rotation = (spec.rotation === undefined) ? 0 : spec.rotation;
	that.velocity = spec.velocity || $V([0, 0]);

	that.color = spec.color || $V([200, 200, 200, 1]);
	that.scale = spec.scale || $V([1, 1]);
	that.fill = spec.fill || 'fill';
	that.bounds = spec.bounds;

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

	that.absolute = function() {
		return that.supermote ? that.pos.add(that.supermote.absolute()) : that.pos;
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

	that.attach = function(other) {
		other.pos = that.to(other);
		other.supermote = that;
		other.velocity = $V([0, 0]);

		that.submotes.append(other);
	};

	that.detach = function(other) {
		other.pos = other.absolute();
		other.supermote = null;
		other.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		that.submotes = that.submotes.without(other);
	};

	that.perceive = spec.perceive || function(env) {
		that.submotes.each(function(submote) {
			submote.perceive(env);
		});
	};

	that.adjust = spec.adjust || function() {
		that.orientation += that.rotation;

		while (that.orientation > Math.PI) {
			that.orientation -= Math.PI*2;
		}
		while (that.orientation < -Math.PI) {
			that.orientation += Math.PI*2;
		}

		that.pos = that.pos.add(that.velocity);

		that.future.each(function(moment) {
			moment(that);
		});
		that.future = [];

		that.tweens = that.tweens.select(function(tween) {
			return tween.cycle();
		});

		that.submotes.each(function(submote) {
			submote.adjust();
		});

		if (that.bounds) {
			var check = that.bounds.check(that.pos.elements);

			check.each(function(result, index) {
				if (!(result === 0)) {
					that.velocity.elements[index] = 0-that.velocity.elements[index];
				}
			});
		}
	};

	that.distance = function(other) {
		return that.absolute().distanceFrom(other.absolute());
	};

	that.to = function(other) {
		return other.absolute().subtract(that.absolute());
	};

	that.angleFrom = function(other) {
		return that.pos.angleFrom(other.pos);
	};

	// this finds the closest mote from a list of possible motes.
	// a predicate can be provided to filter out choices.
	that.findClosest = function(others, predicate) {
		var closestMote = null;
		var closestDistance = null;

		predicate = predicate || function(other) {return true;};

		others.each(function(other) {
			if (predicate(other)) {
				if (closestMote === null) {
					closestMote = other;
					closestDistance = that.distance(other);
				} else {
					var newDistance = that.distance(other);
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

		that.submotes.each(function(submote) {
			submote.draw(context);
		});

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

	that.translation = $V([0, 0]);
	that.orientation = 0;
	that.scale = $V([1, 1]);

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
		context.save();

		context.clearRect(0, 0, browser.w, browser.h);

		context.translate(that.translation.o(0), that.translation.o(1));
		context.rotate(that.orientation);
		context.scale(that.scale.o(0), that.scale.o(1));

		that.motes.invoke("draw", context);

		context.restore();
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
