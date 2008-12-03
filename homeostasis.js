var homeostasis = function(id) {
	var inside = $V([880, 320]);

	var attractant = function(spec) {
		spec.color = spec.color || $V([140, 170, 100, 1]);
		spec.shape = spec.shape || [op.arc({radius: 7})];
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = mote(spec);

		that.perceive = function(env) {

		};

		return that;
	};

	var repellent = function(spec) {
		spec.color = spec.color || $V([170, 70, 60, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-6, -6])}),
									op.line({to: $V([6, -6])}),
									op.line({to: $V([6, 6])}),
									op.line({to: $V([-6, 6])})
								   ];
		spec.rotation = Math.random()*0.1-0.05;
		spec.velocity = $V([Math.random(), Math.random()]);

		var that = mote(spec);

		return that;
	};

	var membrane = function(spec) {
		spec.color = spec.color || $V([230, 20, 20, 1]);
		spec.shape = spec.shape || [op.move({to: $V([0, 270])}),
									op.line({to: $V([800, 270])}),
									op.bezier({to: $V([900, 370]), control1: $V([870, 270]), control2: $V([900, 300])}),
									op.line({to: $V([900, 1500])}),
									op.line({to: $V([870, 1500])}),
									op.line({to: $V([870, 370])}),
									op.bezier({to: $V([800, 300]), control1: $V([870, 325]), control2: $V([845, 300])}),
									op.line({to: $V([0, 300])})
								   ];


		var that = mote(spec);
		return that;
	};

	var column = function(spec) {
		spec.color = spec.color || $V([60, 70, 170, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-30, -50])}),
									op.bezier({to: $V([30, -50]), control1: $V([-30, 0]), control2: $V([30, 0])}),
									op.line({to: $V([50, -50])}),
									op.bezier({to: $V([10, 0]), control1: $V([60, -50]), control2: $V([40, 0])}),
									op.line({to: $V([10, 100])}),
									op.line({to: $V([-10, 100])}),
									op.line({to: $V([-10, 0])}),
									op.bezier({to: $V([-50, -50]), control1: $V([-40, 0]), control2: $V([-60, -50])})
								   ];

		spec.perceive = function(env) {
			return null;
		};

		var that = mote(spec);
		return that;
	};

	var receptor = function(spec) {
		spec.color = $V([0, 0, 0, 0]);
		spec.shape = [op.arc({to: $V([0, 0]), radius: 7})];

		var that = mote(spec);

		that.attractants = [];
		that.repellents = [];

		that.perceive = function(env) {
			that.attractants.concat(repellents).each(function(ligand) {
				ligand.future.append(function(l) {
					var distance = l.pos.distanceFrom(that.pos);
					l.velocity = l.velocity.add(that.pos.subtract(l.pos).multiply(1/(distance*distance)));
				});
			});
		};

		return that;
	};

	var phosphate = function(spec) {
		spec.color = spec.color || $V([120, 80, 130, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-5, 0])}),
									op.line({to: $V([15, 0])}),
									op.line({to: $V([15, 5])}),
									op.bezier({to: $V([6, 5]), control1: $V([15, 15]), control2: $V([6, 15])}),
									op.line({to: $V([-5, 5])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = mote(spec);
		return that;
	};

	var methyl = function(spec) {
		spec.color = spec.color || $V([130, 110, 70, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-5, 0])}),
									op.line({to: $V([6, 0])}),
									op.line({to: $V([13, -4])}),
									op.line({to: $V([19, 3])}),
									op.line({to: $V([13, 10])}),
									op.line({to: $V([6, 6])}),
									op.line({to: $V([-5, 6])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = mote(spec);
		return that;
	};

	var cheW = function(spec) {
		spec.color = spec.color || $V([210, 220, 130, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-30, 0])}),
									op.bezier({to: $V([30, 0]), control1: $V([30, 30]), control2: $V([-30, 30])}),
									op.bezier({to: $V([-30, 0]), control1: $V([-30, -30]), control2: $V([30, -30])})
								   ];

		var that = mote(spec);
		return that;
	};

	var cheY = function(spec) {
		spec.color = spec.color || $V([150, 180, 190, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-20, 3])}),
									op.line({to: $V([0, 3])}),
									op.line({to: $V([10, 20])}),
									op.line({to: $V([15, 17])}),
									op.line({to: $V([6, 0])}),
									op.line({to: $V([15, -17])}),
									op.line({to: $V([10, -20])}),
									op.line({to: $V([0, -3])}),
									op.line({to: $V([-20, -3])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = mote(spec);
		return that;
	};

	var cheZ = function(spec) {
		spec.color = spec.color || $V([220, 30, 20, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-15, -15])}),
									op.line({to: $V([15, -15])}),
									op.line({to: $V([-5, 10])}),
									op.line({to: $V([15, 10])}),
									op.line({to: $V([15, 15])}),
									op.line({to: $V([-15, 15])}),
									op.line({to: $V([5, -10])}),
									op.line({to: $V([-15, -10])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = mote(spec);
		return that;
	};

	var cheB = function(spec) {
		spec.color = spec.color || $V([100, 100, 100, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-15, -15])}),
									op.line({to: $V([15, -15])}),
									op.line({to: $V([15, -10])}),
									op.bezier({to: $V([0, -5]), control1: $V([15, 15]), control2: $V([0, 15])}),
									op.bezier({to: $V([-15, -5]), control1: $V([0, 15]), control2: $V([-15, 15])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = mote(spec);
		return that;
	};

	var cheR = function(spec) {
		spec.color = spec.color || $V([180, 180, 220, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-15, -15])}),
									op.line({to: $V([15, -15])}),
									op.line({to: $V([15, -10])}),
									op.bezier({to: $V([0, -5]), control1: $V([15, 15]), control2: $V([0, 15])}),
									op.line({to: $V([-10, -5])}),
									op.line({to: $V([-10, 15])}),
									op.line({to: $V([-15, 15])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = mote(spec);
		return that;
	};

	var attractants = [attractant({pos: $V([80, 60])}),
					   attractant({pos: $V([50, 100])}),
					   attractant({pos: $V([120, 110])}),
					   attractant({pos: $V([300, 80])}),
					   attractant({pos: $V([220, 50])})];
	var repellents = [repellent({pos: $V([450, 20])}),
					  repellent({pos: $V([400, 110])}),
					  repellent({pos: $V([570, 40])}),
					  repellent({pos: $V([480, 70])}),
					  repellent({pos: $V([350, 50])})];
	var membranes = [membrane({pos: $V([0, 0]), orientation: 0})];
	var columns = [column({pos: $V([300, 250]), orientation: 0}),
				   column({pos: $V([140, 250]), orientation: 0}),
				   column({pos: $V([600, 250]), orientation: 0})];
	var receptors = [receptor({pos: $V([300, 232])}),
					 receptor({pos: $V([275, 208])}),
					 receptor({pos: $V([283, 224])}),
					 receptor({pos: $V([317, 224])}),
					 receptor({pos: $V([325, 208])}),
					 receptor({pos: $V([140, 232])}),
					 receptor({pos: $V([115, 208])}),
					 receptor({pos: $V([123, 224])}),
					 receptor({pos: $V([157, 224])}),
					 receptor({pos: $V([165, 208])}),
					 receptor({pos: $V([600, 232])}),
					 receptor({pos: $V([575, 208])}),
					 receptor({pos: $V([583, 224])}),
					 receptor({pos: $V([617, 224])}),
					 receptor({pos: $V([625, 208])})];
	var cheWs = [cheW({pos: $V([300, 350]), orientation: 0}),
				 cheW({pos: $V([140, 350]), orientation: 0}),
				 cheW({pos: $V([600, 350]), orientation: 0})];
	var phosphates = [phosphate({pos: $V([400, 400])}),
					  phosphate({pos: $V([570, 420])}),
					  phosphate({pos: $V([480, 390])})];
	var methyls = [methyl({pos: $V([200, 460])}),
				   methyl({pos: $V([180, 420])}),
				   methyl({pos: $V([270, 490])})];
	var cheYs = [cheY({pos: $V([400, 550])}),
				 cheY({pos: $V([420, 580])}),
				 cheY({pos: $V([480, 500])}),
				 cheY({pos: $V([340, 540])}),
				 cheY({pos: $V([280, 570])})];
	var cheZs = [cheZ({pos: $V([600, 520])}),
				 cheZ({pos: $V([620, 580])}),
				 cheZ({pos: $V([680, 550])}),
				 cheZ({pos: $V([540, 530])}),
				 cheZ({pos: $V([480, 570])})];
	var cheBs = [cheB({pos: $V([150, 580])}),
				 cheB({pos: $V([120, 530])}),
				 cheB({pos: $V([180, 520])})];
	var cheRs = [cheR({pos: $V([50, 510])}),
				 cheR({pos: $V([20, 540])}),
				 cheR({pos: $V([80, 580])})];

	var spec = {
		id: id,
		motes: membranes
			.concat(columns)
			.concat(receptors)
			.concat(cheWs)
			.concat(attractants)
			.concat(repellents)
			.concat(phosphates)
			.concat(methyls)
			.concat(cheYs)
			.concat(cheZs)
			.concat(cheBs)
			.concat(cheRs),

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