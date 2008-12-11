// Object.prototype.isArray = function(value) {
//     return value &&
//         typeof value === 'object' &&
//         typeof value.length === 'number' &&
//         typeof value.splice === 'function' &&
//         !(value.propertyIsEnumerable('length'));
// }

Math.square = function(n) {
	return n * n;
};

// given the lengths of three sides of a triangle a b and c,
// the angle between b and c pivoting on a.
// (derived from law of cosines)
Math.angleFromLengths = function(a, b, c) {
	var num = Math.square(b) + Math.square(c) - Math.square(a);
	var den = 2 * b * c;
	var theta = (den == 0) ? 0 : Math.acos(num / den);

	return (theta > Math.PI) ? (theta - (2*Math.PI)) : theta;
};

Math.angleFromPoints = function(a, b, c) {
	var bc = b.distanceFrom(c);
	var ca = c.distanceFrom(a);
	var ab = a.distanceFrom(b);

	return Math.angleFromLengths(bc, ca, ab);
};

// sum all angles constructed from the given point
// to all pairs of points in the polygon.
Math.windingSubtend = function(point, polygon) {
	var previous = polygon.last();
	return polygon.inject(0, function(sum, vertex) {
		var angle = Math.angleFromPoints(point, previous, vertex);
		previous = vertex;

		return angle + sum;
	});
};

// if the sum of all subtended angles is 2*pi
// the point lies within the polygon
// (we fudge a little to compensate for floating point inaccuracies)
Math.pointWithin = function(point, polygon) {
	return Math.windingSubtend(point, polygon) > (Math.PI * 1.95);
};

Math.testAllThisShizn = function() {
	var polygon = [$V([0, 0]), $V([0, 2]), $V([1, 3]), $V([2, 2]), $V([2, 0])];
	var test = [Math.pointWithin($V([1, 1]), polygon),
				Math.pointWithin($V([-1, -1]), polygon),
				Math.pointWithin($V([3, 2]), polygon),
				Math.pointWithin($V([0.5, 0.5]), polygon),
				Math.pointWithin($V([1, 3]), polygon),
				Math.pointWithin($V([1, 3.1]), polygon),
				Math.pointWithin($V([-5, -1]), polygon),
				Math.pointWithin($V([1, 2.5]), polygon)];

	alert(test.join(' --- '));
};