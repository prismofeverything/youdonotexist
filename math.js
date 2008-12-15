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
Math.kdtree = function(elements, property, depth) {
	var nullNode = function() {
		return {
			add: function(el, depth) {
				return node(el, nullNode(), nullNode());
			},

			within: function(pos, best, depth, n) {
				return best;
			},

			nearest: function(pos, depth, n) {
				return {
					nodes: [],
					closest: Infinity,

					add: function(node, distance) {
						if (distance === undefined) {
							distance = pos.nonrootDistance(node.value[property]);
						}

						this.nodes.append({node: node, distance: distance});
						if (distance < this.closest) {
							this.closest = distance;
						}

						return this;
					},

					replace: function(gone, now, distance) {
						this.nodes = this.nodes.without(gone);
						this.add(now, distance);

						return this;
					},

					merge: function(other) {
						this.nodes = this.nodes.concat(other.nodes);
						this.nodes = this.nodes.sort(function(a, b) {
							return a.distance < b.distance;
						}).slice(0, n);

						if (other.closest < this.closest) {
							this.closest = other.closest;
						}

						return this;
					}
				};
			}
		};
	};

	if (elements.length === 0) {return nullNode();};

	var dimension = elements.first()[property].elements.length;
	var axis = depth % dimension;

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

		that.add = function(el, depth) {
			var axis = depth % dimension;
			var way = along(el, axis) < along(that.value, axis) ? 'left' : 'right';

			that[way] = that[way].add(el, depth+1);

			return that;
		};

		that.check = function(pos, best, depth, n) {
			if (best.nodes.length < n) {
				return best.add(that);
			} else {
				var distance = pos.nonrootDistance(that.value[property]);
				var further = best.nodes.find(function(node) {
					return node.distance > distance;
				});

				if (further) {
					best = best.replace(further, that);
				}

				return best;
			}
		};

		that.within = function(pos, best, depth, n) {
			var axis = depth % dimension;
			var index = pos.dup();
			index.elements[axis] = that.value[property].o(axis);

			var distance = pos.nonrootDistance(index);
			if (distance < best.closest) {
				return best.merge(that.nearest(pos, depth, n));
			} else {
				return best;
			}
		};

		that.nearest = function(pos, depth, n) {
			var axis = depth % dimension;
			var way = pos.o(axis) < along(that.value, axis) ? 'left' : 'right';
			n = n || 1;

			var best = that[way].nearest(pos, depth+1, n);
			that.check(pos, best, depth, n);

			best = that[mirror(way)].within(pos, best, depth+1, n);
		};

		return that;
	};

	var sorted = elements.sort(function(left, right) {
		var l = along(left, axis);
		var r = along(right, axis);

		return l < r ? -1 : l > r ? 1 : 0;
	});

	var median = Math.floor(elements.length / 2);

	var left = Math.kdtree(sorted.slice(0, median), property, depth+1);
	var right = Math.kdtree(sorted.slice(median+1), property, depth+1);

	return node(sorted[median], left, right);
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