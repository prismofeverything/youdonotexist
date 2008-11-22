var square = function(n) { return n * n };
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

var vector2d = function(spec) {
	spec = spec || {x: 0, y: 0};

	var that = {
		x: spec.x,
		y: spec.y
	};

	that.toString = function() {
		return '' + that.x + '|' + that.y;
	};

	that.add = function(pos) {
		that.x += pos.x;
		that.y += pos.y;

		return that;
	};

	that.copy = function() {
		return vector2d({x: that.x, y: that.y});
	};

    that.invert = function(pos) {
        that.x = -that.x;
        that.y = -that.y;

        return that;
    };

    that.sum = function(pos) {
        return vector2d({x: that.x + pos.x, y: that.y + pos.y});
    };

    that.difference = function(pos) {
        return vector2d({x: that.x - pos.x, y: that.y - pos.y});
    };
    
    that.inverse = function(pos) {
        return vector2d({x: -that.x, y: -that.y});
    }; 

    that.perpendicular = function() { 
        return vector2d({x: -that.y, y: that.x});
    };

    that.distance = function(pos) {
        return Math.abs( Math.sqrt( square(that.x - pos.x) + square(that.y - pos.y) ) );
    };

    that.normalize = function() {
        distance = that.distance(vector2d());

        if (distance == 0) {
        } else {
            that.x /= distance;
            that.y /= distance;
        }
        return that;
    };

    that.scale = function(factor) {
        that.x *= factor;
        that.y *= factor;

        return that;
    };

    that.applyTo = function(element) {
        element.style.left = '' + that.x + 'px';
        element.style.top = '' + that.y + 'px';

        return that;
    };

    return that;
};

Number.prototype.add = function(other) {
	return this + other;
}

Number.prototype.subtract = function(other) {
	return this - other;
}

Number.prototype.multiply = function(other) {
	return this * other;
}

Number.prototype.divide = function(other) {
	return this / other;
}

Number.prototype.invert = function() {
	return this * -1;
}

Number.prototype.copy = function() {
	return this;
}

Number.prototype.root = function(degree) {
	return Math.sqrt(this);
}

Number.prototype.zero = 0;

var vector = function(spec) {
	spec = spec || {dim: 0, elements: [], zero: 0};

	var that = {};

	that.dim = spec.dim || spec.elements.size() || 0;
	that.elements = spec.elements || $R(0, that.dim).map(function(el){return 0});
	that.zero = spec.zero || 0;

	that.toString = function() {
		return that.elements.join('|');
	};

	that.set = function(other) {
		var index = 0;
		other.elements.each(function(el) {
			that[index] = el;
			index += 1;
		});
	};

	that.copy = function() {
		return vector({elements: that.elements.map(function(el) {
			el.copy();
		})});
	};

	that.sum = function() {
		return that.elements.inject(that.zero, function(s, el) {return s.add(el)});
	}

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
			return square(a.subtract(b));
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
			yo.scale(33)];

	alert(test.join(' --- '))
};