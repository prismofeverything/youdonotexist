var lawOfCosines = function(a, b, c) {
    var num = square(b) + square(c) - square(a);
    var den = 2 * b * c;

    return (den == 0) ? 0 : (Math.acos(num / den) - (Math.PI / 2));
};

Object.prototype.is_array = function(value) {
    return value && 
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        typeof value.splice === 'function' &&
        !(value.propertyIsEnumerable('length'));
}

Number.prototype.add = function(other) { return this + other; }
Number.prototype.subtract = function(other) { return this - other; }
Number.prototype.multiply = function(other) { return this * other; }
Number.prototype.divide = function(other) { return this / other; }
Number.prototype.invert = function() { return this * -1; }
Number.prototype.copy = function() { return this; }
Number.prototype.root = function(degree) { return Math.sqrt(this) }
Number.prototype.square = function() { return this * this };
Number.prototype.zero = 0;

var vector = function(spec) {
    spec = spec || {dim: 0, elements: [], zero: 0};

    var that = {};

    that.zero = spec.zero || 0;
    that.dim = spec.dim || spec.elements.size() || 0;
    that.elements = spec.elements || $R(0, that.dim).map(function(el){return that.zero});

    that.toString = function() {
        return that.elements.join('|');
    };

    that.set = function(other) {
        other.elements.each(function(el, index) {
            that.elements[index] = el;
        });
    };

    that.copy = function() {
        return vector({elements: that.elements.map(function(el) {
            return el.copy();
        })});
    };

	that.magnitude = function() {
		return that.elements.map(function(el) {
			return el.square();
		}).inject(that.zero, function(s, el) {return s.add(el)}).root(2);
	};

    that.sum = function() {
        return that.elements.inject(that.zero, function(s, el) {return s.add(el)});
    };

    that.ply = function(other, f) {
        return vector({elements: that.elements.zip(other.elements).map(function(el) {
            return f(el[0], el[1]);
        })});
    };

    that.add = function(other) {
        return that.ply(other, function(a, b) {return a.add(b)});
    };

    that.subtract = function(other) {
        return that.ply(other, function(a, b) {return a.subtract(b)});
    };
    
    that.invert = function() {
        return vector({elements: that.elements.map(function(el) {
            return el.invert();
        })});
    };

    that.distance = function(other) {
		return that.ply(other, function(a, b) {
			return a.subtract(b).square();
		}).sum().root(2);
    };

    that.normalize = function() {
        distance = that.distance(vector({dim: that.dim}));
		return vector({elements: that.elements.map(function(el) {
			return el.divide(distance);
		})});
    };

    that.scale = function(factor) {
		return vector({elements: that.elements.map(function(el) {
			return el.multiply(factor);
		})});
    };

	that.dot = function(other) {
		return that.ply(other, function(a, b) {
			return a.multiply(b);
		}).sum();
	};

    return that;
};


var vectortest = function(){
	var ya = vector({elements: [3, 5, 2]})
	var yo = vector({elements: [7, 7, 6]})

	test = [ya.sum(),
			ya.add(yo),
			ya.subtract(yo),
			ya.invert(),
			ya.distance(yo),
			yo.normalize(),
			yo.scale(33),
		    yo.dot(ya),
			yo.magnitude(),
		    ya.magnitude(),
			yo.dot(yo),
		    yo.magnitude().square()];

	alert(test.join(' --- '))
};