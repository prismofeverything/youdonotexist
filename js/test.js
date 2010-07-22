var test = {
	math: function() {
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
	},

	linkage: function() {
		var yellow = linkage(33);
		yellow();
		var observer = function(value) {alert(value);};
		var id = yellow.watch(observer);
		yellow(44);
		yellow.unwatch(id);
		yellow(55);
		alert(yellow());

		var non = {
			yes: {
				no: 66,
				okay: function() {
					return 999;
				},
				maybe: function(thing) {
					return thing*555;
				}
			}
		};

		alert(non.access("yes.no"));
		alert(non.access("yes.okay()"));
		alert(non.access("yes.maybe(96969)"));
	}
};