Math.greater = function(where, to) {return where >= to;};
Math.less = function(where, to) {return where <= to;};

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
		return -el;
	}));
};

Vector.prototype.times = function(other) {
	return $V(this.elements.map(function(el, index) {
		return el * other.o(index);
	}));
};

Vector.prototype.nonrootDistance = function(other) {
	var result = 0;
	for (var n = 0; n < this.elements.length; n++) {
		result += Math.square(this.elements[n] - other.elements[n]);
	}

	return result;
};

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

// build a kdtree for nearest neighbor comparisons
Math.kdtree = function(elements, property) {
	if (elements.length === 0) {return null;};

	var dimension = elements.first()[property].elements.length;

	var along = function(el, axis) {
		return el[property].elements[axis];
	};

	var mirror = function(way) {
		return way === 'left' ? 'right' : 'left';
	};

	var node = function(value, left, right) {
		var that = {
			value: value,
			left: left,
			right: right
		};

		that.nearest = function(pos, n, predicate) {
			n = n || 1;
			predicate = predicate || function(all) {return true;};

			var results = function() {
				var that = {
					nodes: [],
					farthest: 0
				};

				that.add = function(node, distance) {
					if (distance === undefined) {
						distance = pos.nonrootDistance(node.value[property]);
					}

					that.nodes.append({node: node, distance: distance});
					if (distance > that.farthest) {
						that.farthest = distance;
					}

					return that;
				};

				that.findFarthest = function() {
					return that.nodes.inject(0, function(farthest, node) {
						return Math.max(farthest, node.distance);
					});
				};

				that.remove = function(gone) {
					that.nodes = that.nodes.without(gone);
					if (that.farthest === gone.distance) {
						that.farthest = that.findFarthest();
					}
				};

				that.replace = function(gone, now, distance) {
					if (predicate(now.value)) {
						that.remove(gone);
						that.add(now, distance);
					}

					return that;
				};

				return that;
			};

			var check = function(at, best, depth) {
				if (predicate(at.value)) {
					if (best.nodes.length < n) {
						return best.add(at);
					} else {
						var distance = pos.nonrootDistance(at.value[property]);
						var farther = best.nodes.find(function(node) {
														  return node.distance > distance;
													  });

						return farther ? best.replace(farther, at, distance) : best;
					}
				} else {
					return best;
				}
			};

			var within = function(at, best, depth) {
				if (at === null) {
					return best;
				}

				var axis = depth % dimension;
				var index = pos.dup();
				index.elements[axis] = at.value[property].o(axis);

				var distance = pos.nonrootDistance(index);
				if (distance < best.farthest) {
					best = check(at, best, depth);
					var way = pos.o(axis) < along(at.value, axis) ? 'left' : 'right';
					best = within(at[mirror(way)], best, depth+1);
					return within(at[way], best, depth+1);
				} else {
					return best;
				}
			};

			var recur = function(at, best, depth) {
				if (at === null) {
					return best;
				}

				var axis = depth % dimension;
				var way = pos.o(axis) < along(at.value, axis) ? 'left' : 'right';

				best = recur(at[way], best, depth+1);
				check(at, best, depth);

				return within(at[mirror(way)], best, depth+1);
			};

			return recur(that, results(), 0).nodes.map(function(node) {
				return node.node.value;
			});
		};

		that.add = function(el, depth) {
			var axis = depth % dimension;
			var way = along(el, axis) < along(that.value, axis) ? 'left' : 'right';

			if (that[way] === null) {
				that[way] = node(el, null, null);
			} else {
				that[way].add(el, depth+1);
			}

			return that;
		};

		that.each = function(func) {
			func(that.value);

			if (exists(that.left)) {
				that.left.each(func);
			} else if (exists(that.right)) {
				that.right.each(func);
			}
		};

		return that;
	};

	var recur = function(elements, depth) {
		if (elements.length < 1) {
			return null;
		}

		var axis = depth % dimension;
		var sorted = elements.sort(function(left, right) {
			var l = along(left, axis);
			var r = along(right, axis);

			return l < r ? -1 : l > r ? 1 : 0;
		});

		var median = Math.floor(elements.length / 2);
		var left = recur(sorted.slice(0, median), depth+1);
		var right = recur(sorted.slice(median+1), depth+1);

		return node(sorted[median], left, right);
	};

	return recur(elements, 0);
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