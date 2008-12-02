var homeostasis = function(id) {
	var receptor = function(spec) {
		var that = {};

		that.color = spec.color || $V([30, 40, 170, 1]);
		that.shape = spec.shape || [{method: 'arc',    point: $V([230, 50]), args: [50, 0, Math.PI*2, true]},
									{method: 'lineTo', point: $V([100, 100])},
									{method: 'lineTo', point: $V([200, -10])},
									{method: 'arc',    point: $V([230, 50]), args: [50, 0, Math.PI*2, true]},
									{method: 'lineTo', point: $V([280, -100])},
									{method: 'lineTo', point: $V([240, -50])}];


		that.perceive = function() {

		};
	};

	spec = {
		id: id,
		motes: [mote({color: $V([100, 200, 120, 1]),
					  pos: $V([300, 200]),
					  adjust: function() {
						  this.shape.first().point.elements[1] -= 0.4;
						  this.shape[4].point.elements[0] -= 0.7;
						  this.pos.elements[0] += 0.2;
					  }})],

		down: function(mouse) {
			this.motes.each(function(mote) {
				if (mote.boxContains(mouse.pos)) {
					mote.color = $V([Math.random()*255, Math.random()*255, Math.random()*255, 1]);
				};
			});
		}
	};

	return flux(spec);
};