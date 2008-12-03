var nekuda = function(id) {
	var spec = {
		id: id,
		motes: [mote({color: $V([100, 200, 120, 1]),
					  pos: $V([500, 500]),
					  adjust: function() {
						  this.shape.first().pos.elements[1] -= 0.4;
						  this.shape[4].pos.elements[0] -= 0.7;
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