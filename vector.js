var square = function(n) { return n * n };
var lawOfCosines = function(a, b, c) {
	var num = square(b) + square(c) - square(a);
	var den = 2 * b * c;

	return (den == 0) ? 0 : (Math.acos(num / den) - (Math.PI / 2));
};

var is_array = function(value) {
	return value && 
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		typeof value.splice === 'function' &&
		!(value.propertyIsEnumerable('length'));
}

var vector = function(spec) {
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
		return vector({x: that.x, y: that.y});
	};

    that.invert = function(pos) {
        that.x = -that.x;
        that.y = -that.y;

        return that;
    };

    that.sum = function(pos) {
        return vector({x: that.x + pos.x, y: that.y + pos.y});
    };

    that.difference = function(pos) {
        return vector({x: that.x - pos.x, y: that.y - pos.y});
    };
    
    that.inverse = function(pos) {
        return vector({x: -that.x, y: -that.y});
    }; 

    that.perpendicular = function() { 
        return vector({x: -that.y, y: that.x});
    };

    that.distance = function(pos) {
        return Math.abs( Math.sqrt( square(that.x - pos.x) + square(that.y - pos.y) ) );
    };

    that.normalize = function() {
        distance = that.distance(vector());

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


