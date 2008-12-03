var homeostasis = function(id) {
	var receptor = function(spec) {
		spec.color = spec.color || $V([60, 70, 170, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-30, 0])}),
									op.bezier({pos: $V([30, 0]), control1: $V([-30, 50]), control2: $V([30, 50])}),
									op.line({pos: $V([50, 0])}),
									op.bezier({pos: $V([10, 50]), control1: $V([60, 0]), control2: $V([40, 50])}),
									op.line({pos: $V([10, 150])}),
									op.line({pos: $V([-10, 150])}),
									op.line({pos: $V([-10, 50])}),
									op.bezier({pos: $V([-50, 0]), control1: $V([-40, 50]), control2: $V([-60, 0])})
								   ];

		spec.perceive = function(env) {
			return null;
		};

		return mote(spec);
	};

	var attractant = function(spec) {
		spec.color = spec.color || $V([140, 170, 100, 1]);
		spec.shape = spec.shape || [op.arc({radius: 7})];

		return mote(spec);
	};

	var repellant = function(spec) {
		spec.color = spec.color || $V([170, 70, 60, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-6, -6])}),
									op.line({pos: $V([6, -6])}),
									op.line({pos: $V([6, 6])}),
									op.line({pos: $V([-6, 6])})
								   ];

		return mote(spec);
	};

	var phosphate = function(spec) {
		spec.color = spec.color || $V([120, 80, 130, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-5, 0])}),
									op.line({pos: $V([15, 0])}),
									op.line({pos: $V([15, 5])}),
									op.bezier({pos: $V([6, 5]), control1: $V([15, 15]), control2: $V([6, 15])}),
									op.line({pos: $V([-5, 5])})
								   ];

		return mote(spec);
	};

	var methyl = function(spec) {
		spec.color = spec.color || $V([130, 110, 70, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-5, 0])}),
									op.line({pos: $V([6, 0])}),
									op.line({pos: $V([13, -4])}),
									op.line({pos: $V([19, 3])}),
									op.line({pos: $V([13, 10])}),
									op.line({pos: $V([6, 6])}),
									op.line({pos: $V([-5, 6])})
								   ];

		return mote(spec);
	};

	var cheW = function(spec) {
		spec.color = spec.color || $V([210, 220, 130, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-30, 0])}),
									op.bezier({pos: $V([30, 0]), control1: $V([30, 30]), control2: $V([-30, 30])}),
									op.bezier({pos: $V([-30, 0]), control1: $V([-30, -30]), control2: $V([30, -30])})
								   ];

		return mote(spec);
	};

	var cheY = function(spec) {
		spec.color = spec.color || $V([150, 180, 190, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-20, 3])}),
									op.line({pos: $V([0, 3])}),
									op.line({pos: $V([10, 20])}),
									op.line({pos: $V([15, 17])}),
									op.line({pos: $V([6, 0])}),
									op.line({pos: $V([15, -17])}),
									op.line({pos: $V([10, -20])}),
									op.line({pos: $V([0, -3])}),
									op.line({pos: $V([-20, -3])})
								   ];

		return mote(spec);
	};

	var cheZ = function(spec) {
		spec.color = spec.color || $V([220, 30, 20, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-15, -15])}),
									op.line({pos: $V([15, -15])}),
									op.line({pos: $V([-5, 10])}),
									op.line({pos: $V([15, 10])}),
									op.line({pos: $V([15, 15])}),
									op.line({pos: $V([-15, 15])}),
									op.line({pos: $V([5, -10])}),
									op.line({pos: $V([-15, -10])})
								   ];

		return mote(spec);
	};

	var cheB = function(spec) {
		spec.color = spec.color || $V([100, 100, 100, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-15, -15])}),
									op.line({pos: $V([15, -15])}),
									op.line({pos: $V([15, -10])}),
									op.bezier({pos: $V([0, -5]), control1: $V([15, 15]), control2: $V([0, 15])}),
									op.bezier({pos: $V([-15, -5]), control1: $V([0, 15]), control2: $V([-15, 15])})
								   ];

		return mote(spec);
	};

	var cheR = function(spec) {
		spec.color = spec.color || $V([180, 180, 220, 1]);
		spec.shape = spec.shape || [op.move({pos: $V([-15, -15])}),
									op.line({pos: $V([15, -15])}),
									op.line({pos: $V([15, -10])}),
									op.bezier({pos: $V([0, -5]), control1: $V([15, 15]), control2: $V([0, 15])}),
									op.line({pos: $V([-10, -5])}),
									op.line({pos: $V([-10, 15])}),
									op.line({pos: $V([-15, 15])})
								   ];

		return mote(spec);
	};

	var spec = {
		id: id,
		motes: [receptor({pos: $V([300, 200]), rotation: 0}),

				attractant({pos: $V([80, 60])}),
				attractant({pos: $V([50, 100])}),
				attractant({pos: $V([120, 110])}),
				attractant({pos: $V([300, 80])}),
				attractant({pos: $V([220, 50])}),

				repellant({pos: $V([450, 20])}),
				repellant({pos: $V([400, 110])}),
				repellant({pos: $V([570, 40])}),
				repellant({pos: $V([480, 70])}),
				repellant({pos: $V([350, 50])}),

				phosphate({pos: $V([400, 400])}),
				phosphate({pos: $V([570, 420])}),
				phosphate({pos: $V([480, 390])}),

				methyl({pos: $V([200, 460])}),
				methyl({pos: $V([180, 420])}),
				methyl({pos: $V([270, 490])}),

				cheW({pos: $V([300, 350]), rotation: 0}),

				cheY({pos: $V([400, 550])}),
				cheY({pos: $V([420, 580])}),
				cheY({pos: $V([480, 500])}),
				cheY({pos: $V([340, 540])}),
				cheY({pos: $V([280, 570])}),

				cheZ({pos: $V([600, 520])}),
				cheZ({pos: $V([620, 580])}),
				cheZ({pos: $V([680, 550])}),
				cheZ({pos: $V([540, 530])}),
				cheZ({pos: $V([480, 570])}),

				cheB({pos: $V([150, 580])}),
				cheB({pos: $V([120, 530])}),
				cheB({pos: $V([180, 520])}),

				cheR({pos: $V([50, 510])}),
				cheR({pos: $V([20, 540])}),
				cheR({pos: $V([80, 580])})

			   ],

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