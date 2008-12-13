Object.beget = function(o) {
	var F = function() {};
	F.prototype = o;

	return new F();
};

Function.prototype.method = function(name, func) {
	if (!this.prototype[name]) {
		this.prototype[name] = func;
	}
};

Vector.method('o', function(i) {
	return (i < 0 || i >= this.elements.length) ? null : this.elements[i];
});

Vector.method('magnitude', function() {
	return Math.sqrt(this.elements.inject(0, function(sum, element) {
		return sum + element * element;
	}));
});

Vector.method('scaleTo', function(magnitude) {
	return this.toUnitVector().x(magnitude);
});

Vector.method('inverse', function() {
	return $V(this.elements.map(function(el) {
		return 0 - el;
	}));
});

Array.method('append', function(el) {
	this[this.length] = el;
	return this;
});

var exists = function(value) {
	return !(value === null || value === undefined);
};

var flux = {};

flux.bounds = function(xlow, xhigh, ylow, yhigh) {
	var that = [];
	var ops = [Math.min, Math.max];

	that.x = [xlow, xhigh];
	that.y = [ylow, yhigh];
	that[0] = that.x;
	that[1] = that.y;

	that.extreme = function(tendency) {
		return [that[0][tendency], that[1][tendency]];
	};

	that.range = function(axis) {
		return that[axis][1] - that[axis][0];
	};

	that.low = function() {
		return that.extreme(0);
	};

	that.high = function() {
		return that.extreme(1);
	};

	that.width = function() {
		return that.range(0);
	};

	that.height = function() {
		return that.range(1);
	};

	that.randomValue = function(axis) {
		return Math.random()*that.range(axis)+that[axis][0];
	};

	that.randomPoint = function() {
		return [0, 1].map(that.randomValue);
	};

	that.union = function(other) {
		for (var a = 0; a < 2; a++) {
			for (var b = 0; b < 2; b++) {
				that[a][b] = ops[b](that[a][b], other[a][b]);
			}
		}
	};

	that.include = function(point) {
		for (var a = 0; a < 2; a++) {
			for (var b = 0; b < 2; b++) {
				that[a][b] = ops[b](that[a][b], point.o(a));
			}
		}
	};

	that.translate = function(point) {
		for (var a = 0; a < 2; a++) {
			for (var b = 0; b < 2; b++) {
				that[a][b] += point.o(a);
			}
		}
	};

	that.check = function(point) {
		return point.elements.map(function(a, index) {
			if (a < that[index][0]) {
				return -1;
			} else if(a > that[index][1]) {
				return 1;
			} else {
				return 0;
			}
		});
	};

	that.inside = function(point) {
		return that.check(point).inject(true, function(side, a, index) {
			return side && a === 0;
		});
	};

	return that;
};

// provide objects to represent atomic drawing operations
flux.op = function() {
	var result = {};

	result.base = function(spec) {
		var that = {};

		that.method = spec.method || 'lineTo';
		that.to = spec.to || $V([0, 0]);

		that.args = spec.args || function() {
			return that.to.elements;
		};

		that.prod = spec.prod || function(box) {
			box.include(that.to);
		};

		that.dup = function() {
			return result.base(that);
		};

		that.between = function(other, cycles) {
			return [flux.tweenV({
				obj: that,
				property: 'to',
				to: other.to,
				cycles: cycles
			})];
		};

		return that;
	};

	result.line = function(spec) {
		spec.method = 'lineTo';

		var that = result.base(spec);

		that.dup = function() {
			return result.line(that);
		};

		return that;
	};

	result.move = function(spec) {
		spec.method = 'moveTo';

		var that = result.base(spec);

		that.dup = function() {
			return result.move(that);
		};

		return that;
	};

	result.arc = function(spec) {
		spec.method = 'arc';

		var that = result.base(spec);

		that.radius = spec.radius || 10;
		that.arc = spec.arc || $V([0, Math.PI*2]);
		that.clockwise = spec.clockwise || true;

		that.args = function() {
			return that.to.elements.concat([that.radius].concat(that.arc.elements).append(that.clockwise));
		};

		that.between = function(other, cycles) {
			return [
				flux.tweenV({obj: that,
					property: 'to',
					to: other.to,
					cycles: cycles}),
				flux.tweenN({obj: that,
					property: 'radius',
					to: other.radius,
					cycles: cycles}),
				flux.tweenN({obj: that,
					property: 'arc',
					to: other.arc,
					cycles: cycles})
			];
		};

		that.prod = function(box) {
			box.union(flux.bounds(that.to.o(0) - that.radius,
								  that.to.o(0) + that.radius,
								  that.to.o(1) - that.radius,
								  that.to.o(1) + that.radius));
		};

		that.dup = function() {
			return result.arc(that);
		};

		return that;
	};

	result.bezier = function(spec) {
		spec.method = 'bezierCurveTo';
		spec.to = spec.to || $V([10, 10]);

		var that = result.base(spec);

		that.control1 = spec.control1 || $V([0, 0]);
		that.control2 = spec.control2 || $V([0, 0]);

		that.args = function() {
			return that.control1.elements.concat(that.control2.elements).concat(that.to.elements);
		};

		that.prod = function(box) {
			box.include(that.to);
			box.include(that.control1);
			box.include(that.control2);
		};

		that.between = function(other, cycles) {
			return [
				flux.tweenV({
					obj: that,
					property: 'to',
					to: other.to,
					cycles: cycles}),
				flux.tweenV({
					obj: that,
					property: 'control1',
					to: other.control1,
					cycles: cycles}),
				flux.tweenV({
					obj: that,
					property: 'control2',
					to: other.control2,
					cycles: cycles})
			];
		};

		that.dup = function() {
			return result.bezier(that);
		};

		return that;
	};

	return result;
}();

flux.shape = function(spec) {
	var that = {};

	that.ops = spec.ops || [];

	that.between = function(other, cycles) {
		return that.ops.inject([], function(tweens, op, index) {
			return tweens.concat(op.between(other.ops[index], cycles));
		});
	};

	that.dup = function() {
		return flux.shape({ops: that.ops.map(function(vertex) {return vertex.dup();})});
	};

	return that;
};

// generic base tween object
flux.tween = function(spec) {
	var that = {};

	that.obj = spec.obj || spec;
	that.property = spec.property || ((spec.property === 0) ? spec.property : 'this');
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

// tween object for numbers
flux.tweenN = function(spec) {
	var that = flux.tween(spec);
	var increment = spec.increment || (spec.cycles ? ((spec.to - spec.obj[spec.property]) / spec.cycles) : 1);

	var greater = function(where, to) {return where >= to;};
	var less = function(where, to) {return where <= to;};

	that.to = spec.to || 0;
	that.test = spec.test || ((that.value() < that.to) ? greater : less);

	that.target = spec.target || function(value) {
		return that.test(value, that.to);
	};

	that.step = spec.step || function(value) {
		return value + increment;
	};

	return that;
};

// tween object for vectors
flux.tweenV = function(spec) {
	var that = {};

	that.obj = spec.obj || spec;
	that.property = spec.property || 'this';
	that.to = spec.to || $V([1, 1]);
	that.cycles = spec.cycles || 10;

	that.vector = function() {
		return that.obj[that.property];
	};

	var differing = $R(0, that.vector().dimensions() - 1).select(function(index) {
		return !(that.vector().o(index) === that.to.o(index));
	});

	that.tweens = differing.map(function(index) {
		return flux.tweenN({
			obj: that.vector().elements,
			property: index,
			to: that.to.o(index),
			cycles: that.cycles
		});
	});

	that.cycle = function() {
		that.tweens = that.tweens.select(function(tween) {return tween.cycle();});
		return that.tweens.length > 0;
	};

	return that;
};

// representation of individual agents
flux.mote = function(spec) {
	var that = {};

	that.supermote = spec.supermote || null;
	that.submotes = spec.submotes || [];

	that.pos = spec.pos || $V([0, 0]);
	that.shape = spec.shape || flux.shape({ops: [flux.op.arc({to: $V([500, 500]), radius: 50, arc: $V([0, Math.PI*2])})]});
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

	that.mouseDown = function(mouse) {};
	that.mouseUp = function(mouse) {};
	that.mouseMove = function(mouse) {};

	that.absolute = function() {
		return that.supermote ? that.pos.add(that.supermote.absolute()) : that.pos;
	};

	that.contains = function(point) {
		return that.box.inside(point.subtract(that.absolute()));
	};

	// construct a simple bounding box to tell if further bounds checking is necessary
	that.findBox = function() {
		var box = flux.bounds(0, 0, 0, 0);

		that.shape.ops.each(function(vertex) {
			vertex.prod(box);
		});

		that.submotes.each(function(submote) {
			box.union(submote.box);
		});

		that.box = box;
		return box;
	};

	that.findBox();

	that.color_spec = function() {
		var inner = that.color.elements.map(function(component) {
			return Math.floor(component);
		}).join(', ');
		return "rgba(" + inner + ")";
	};

	that.tweenColor = function(color, cycles) {
		that.tweens.append(flux.tweenV({
			obj: that,
			property: 'color',
			to: color,
			cycles: cycles
		}));

		return that;
	};

	that.tweenShape = function(shape, cycles) {
		that.tweens = that.tweens.concat(that.shape.between(shape, cycles));

		return that;
	};

// 	that.contains = function(point) {
// 		return Math.pointWithin(point, that.shape.map(function(vertex) {
// 			return vertex.add(that.pos);
// 		}));
// 	};

	that.attach = function(other) {
 		other.pos = that.to(other).rotate(-that.orientation, $V([0, 0]));
		other.orientation -= that.orientation;
		other.supermote = that;
		other.velocity = $V([0, 0]);

		that.submotes.append(other);
	};

	that.detach = function(other) {
		other.pos = other.absolute();
		other.orientation += that.orientation;
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
		} while (that.orientation < -Math.PI) {
			that.orientation += Math.PI*2;
		}

		$R(0, that.pos.dimensions()-1).each(function(index) {
			that.pos.elements[index] += that.velocity.o(index);
		});

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
			var check = that.bounds.check(that.pos);

			check.each(function(result, index) {
				if (!(result === 0)) {
					that.velocity.elements[index] = -that.velocity.elements[index];
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

 		that.shape.ops.each(function(vertex) {
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

// managing the canvas for all motes
flux.canvas = function(spec) {
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

	var mouseEvent = function(event, mouse) {
		that.motes.each(function(mote) {
			if (mote.contains(mouse.pos)) {
				mote['mouse' + event](mouse);
			}
		});

		return that;
	};

	var mouseDown = function(e) {
		mouse.down = true;
		mouseEvent('Down', mouse);

		that.down(mouse);
	};

	var mouseUp = function(e) {
		mouse.down = false;
		mouseEvent('Up', mouse);

		that.up(mouse);
	};

	var mouseMove = function(e) {
		var scrollX = window.scrollX != null ? window.scrollX : window.pageXOffset;
		var scrollY = window.scrollY != null ? window.scrollY : window.pageYOffset;

		mouse.prev = mouse.pos;

		var x = e.clientX - canvas.offsetLeft + scrollX;
		var y = e.clientY - canvas.offsetTop + scrollY;

		mouse.pos = $V([x, y]);
		mouseEvent('Move', mouse);

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
