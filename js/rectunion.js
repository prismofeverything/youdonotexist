var rectunion = function() {
	var that = {};

	var perp = function(axis) {
		if (axis == 'x') {
			return 'y';
		} else {
			return 'x';
		}
	};

	var bounds = function(xlow, xhigh, ylow, yhigh) {
		return {
			x: [xlow, xhigh],
			y: [ylow, yhigh],

			axisContains: function(axis, value) {
				return this[axis][0] < value && this[axis][1] > value;
			},

			contains: function(v, w) {
				return this.axisContains('x', v) && this.axisContains('y', w);
			}
		};
	};

	var firstPoint = function(boundslist) {
		if (!boundslist) {return null;};

		var candidates = [];

		for (var i = 0; i < boundslist.length; i++) {
			
		}

		return dog;
	};

	that.find = function(boundslist) {

	};

	return that;
}();