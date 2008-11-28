var homeostasis = function(id) {
	spec = {
		id: id,
		motes: [mote({color: $V([100, 200, 120, 1]), pos: $V([300, 300])})],
		down: function(mouse) {
			this.motes.append(mote({
				color: $V([70, 80, 140, 1]),
				pos: $V([100, 100])
			}));
		}
	};

	return flux(spec);
};