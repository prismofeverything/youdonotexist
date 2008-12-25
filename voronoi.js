// given a list of vectors, an index and a comparison function,
// finds the most extreme value in that list at that index
Math.extreme = function(elements, index, compare) {
	return elemets.length === 0 ? undefined : elements.inject(elements.first().o(index), function(extreme, potential) {
		return compare(extreme, potential.o(index)) ? extreme : potential;
	});
};

Math.supertriangle = function(points) {
	var first = points.pop();
	var extremes = points.inject({min: first.dup(), max: first.dup()}, function(extreme, point) {
		if (extreme.min.o(0) > point.o(0)) {extreme.min[0] = point.o(0);}
		if (extreme.min.o(1) > point.o(1)) {extreme.min[1] = point.o(1);}
		if (extreme.max.o(0) < point.o(0)) {extreme.max[0] = point.o(0);}
		if (extreme.max.o(1) < point.o(1)) {extreme.max[1] = point.o(1);}

		return extreme;
	});

	
};

Math.delauney = function(points, supertriangle) {
	supertriangle = supertriangle || Math.supertriangle(points);
};

Math.voronoi = function(points, supertriangle) {
	supertriangle = supertriangle || Math.supertriangle(points);
};





























// test

Math.randomPoint = function(dim) {
	var point = [];
	for (var d=0; d < dim; d++) {
		point[d] = Math.random();
	}

	return $V(point);
};


var triangles = function(element) {
	var that = {};

	var canvas, context;
	var now, before, interval;
	var	browser = {};

	var points = $R(0, 100).map(function(x) {return Math.randomPoint(2);});

	var time = function() {
		return new Date().getTime();
	};

	var update = function() {
		before = now;
		now = time();
		interval = now - before;

		draw();
	};

	var draw = function() {
		context.clearRect(0, 0, browser.w, browser.h);
		context.fillStyle = "rgb(255, 255, 255)";
		points.each(function(point) {
			context.beginPath();
			context.arc(point.o(0)*1200, point.o(1)*800, 5, 0, Math.PI*2, true);
			context.closePath();
			context.fill();
		});
	};

	that.init = function() {
		canvas = document.getElementById ? document.getElementById(element) : null;
		if (!canvas || !canvas.getContext) {
			return;
		}
		context = canvas.getContext('2d');

// 		canvas.addEventListener('mousedown', mouseDown, false);
// 		canvas.addEventListener('mouseup', mouseUp, false);
// 		canvas.addEventListener('mousemove', mouseMove, false);

		canvas.width = browser.w = window.innerWidth;
		canvas.height = browser.h = window.innerHeight;

		context.strokeStyle = "rgba(0, 0, 0, 1)";
		context.lineWidth = 5;

		setInterval(update, 20);
	};

	return that;
};