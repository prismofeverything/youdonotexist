var homeostasis = function(id) {
	var bounds = function(xlow, xhigh, ylow, yhigh) {
		var that = {
			x: [xlow, xhigh],
			y: [ylow, yhigh],

			low: function() {
				return [xlow, ylow];
			},

			high: function() {
				return [xhigh, yhigh];
			},

			width: function() {
				return xhigh - xlow;
			},

			height: function() {
				return yhigh - ylow;
			},

			randomX: function() {
				return Math.random()*this.width()+this.x[0];
			},

			randomY: function() {
				return Math.random()*this.height()+this.y[0];
			},

			randomPoint: function() {
				return [this.randomX(), this.randomY()];
			}
		};

		return that;
	};

	var inside = bounds(0, 880, 320, 1500);
	var outside = bounds(0, 800, 0, 250);
	var offscreen = bounds(-50, 800, -50, 0);

	var receptorGrip = 0.996;
	var attractantRepellentRatio = 1;

	var defaultRotation = function() {return Math.random() * 0.1 - 0.05;};

	var randomPos = function(box) {
		return $V(box.randomPoint());
	};

	var randomLigand = function() {
		if (Math.random() * (attractantRepellentRatio + 1) < attractantRepellentRatio) {
			return attractant({pos: randomPos(outside)});
		} else {
			return repellent({pos: randomPos(outside)});
		}
	};

	var ligand = function(spec) {
		var that = mote(spec);
		var velocityScale = 0.9;

		that.closestReceptor = null;
		that.unattached = true;
		that.attached = false;
		that.detached = false;

		that.polarity = -1;

		that.perceive = function(env) {
			if (that.unattached) {
				if (that.closestReceptor === null || that.closestReceptor.taken) {
					that.closestReceptor = that.findClosest(receptors, function(receptor) {
						return receptor.taken === false;
					});
				}

				if (!(that.closestReceptor === null)) {
					that.future.append(function(self) {
					   var distance = that.closestReceptor.pos.distanceFrom(that.pos);
					   var mag = that.pos.magnitude();

					   if (distance > 1) {
						   that.velocity = that.velocity.add(that.closestReceptor.pos.subtract(that.pos).x(0.2/(distance))).scaleTo(velocityScale);
					   } else {
						   that.velocity = $V([0, 0]);
						   that.rotation = 0;

						   that.closestReceptor.take(that);
						   that.unattached = false;
						   that.attached = true;
					   }
					});
				} else {
					that.velocity = $V([Math.random()-0.5, Math.random()-1]);
				}
			} else if (that.attached) {
				if (Math.random() > receptorGrip) {
					that.velocity = $V([Math.random()-0.5, Math.random()-1]);
					that.rotation = defaultRotation();

					that.attached = false;
					that.detached = true;
					that.closestReceptor.release();
					that.closestReceptor = null;
				}
			} else if (that.detached) {
				if (that.pos.o(0) < -10 || that.pos.o(1) < -10) {
					that.pos = randomPos(offscreen);
					that.detached = false;
					that.unattached = true;
				}
			}
		};

		return that;
	};

	var attractant = function(spec) {
		spec.color = spec.color || $V([140, 170, 100, 1]);
		spec.shape = spec.shape || [op.arc({radius: 7})];
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = ligand(spec);
		that.type = 'A';

		return that;
	};

	var repellent = function(spec) {
		spec.color = spec.color || $V([170, 70, 60, 1]);
		spec.shape = spec.shape || [op.move({to: $V([-6, -6])}),
									op.line({to: $V([6, -6])}),
									op.line({to: $V([6, 6])}),
									op.line({to: $V([-6, 6])})
								   ];
		spec.rotation = defaultRotation();
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = ligand(spec);

		that.type = 'X';
		that.polarity = 1;

		return that;
	};

	var membrane = function(spec) {
		spec.color = spec.color || $V([80, 20, 20, 1]);
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

		that.receptors = [receptor({pos: $V([0, -18]).add(that.pos), column: that}),
						  receptor({pos: $V([-25, -42]).add(that.pos), column: that}),
						  receptor({pos: $V([-17, -26]).add(that.pos), column: that}),
						  receptor({pos: $V([17, -26]).add(that.pos), column: that}),
						  receptor({pos: $V([25, -42]).add(that.pos), column: that})];
		that.cheW = cheW({pos: $V([0, 100]), orientation: 0, column: that});

		that.level = 0;

		that.activate = function() {
			that.active = true;
			that.cheW.activate();
		};

		that.deactivate = function() {
			that.active = false;
			that.cheW.deactivate();
		};

		that.perceive = function(env) {
			if (that.active) {
				if (that.level <= 0) {
					that.deactivate();
				}
			} else {
				if (that.level > 0) {
					that.activate();
				}
			}
		};

		that.submotes = function() {
			return [that.cheW].concat(that.receptors);
		};

		return that;
	};

	var receptor = function(spec) {
		spec.color = $V([0, 0, 0, 0]);
		spec.shape = [op.arc({to: $V([0, 0]), radius: 7})];

		var that = mote(spec);

		that.column = spec.column;

		that.taken = false;
		that.bound = null;
		that.detached = 0;

		that.take = function(ligand) {
			that.column.level += ligand.polarity;

			that.bound = ligand;
			that.taken = true;
		};

		that.release = function() {
			that.column.level -= that.bound.polarity;

			that.bound = null;
			that.taken = false;
			that.detached = 150;
		};

		that.perceive = function(env) {
			if (that.detached < 2) {
				that.detached = 0;
				that.taken = false;
			} else if (that.detached > 1) {
				that.detached = that.detached - 1;
			}
		};

		return that;
	};

	var cheW = function(spec) {
		var activeColor = spec.activeColor || $V([210, 220, 130, 1]);
		var inactiveColor = spec.inactiveColor || $V([40, 40, 40, 1]);
		var colorStep = activeColor.subtract(inactiveColor).scaleTo(5);

		spec.color = spec.color || inactiveColor;
		spec.shape = spec.shape || [op.move({to: $V([-30, 0])}),
									op.bezier({to: $V([30, 0]), control1: $V([30, 30]), control2: $V([-30, 30])}),
									op.bezier({to: $V([-30, 0]), control1: $V([-30, -30]), control2: $V([30, -30])})
								   ];

		var that = mote(spec);

		that.active = false;

		that.activate = function() {
			that.active = true;
			that.color = activeColor;

// 			that.tweens = [];
// 			that.tweens.append(tween({property: 'color',
// 						   target: function() {
// 							   return that.color.o(0) < activeColor.o(0) ||
// 								   that.color.o(1) < activeColor.o(1) ||
// 								   that.color.o(2) < activeColor.o(2);
// 						   },
// 						   step: function() {
// 							   that.color = that.color.add(colorStep);
// 						   }
// 						  }));


		};

		that.deactivate = function() {
			that.active = false;
			that.color = inactiveColor;

// 			that.tweens = [];
// 			that.tweens.append(tween({property: 'color',
// 						   target: function() {
// 							   return that.color.o(0) > inactiveColor.o(0) ||
// 								   that.color.o(1) > inactiveColor.o(1) ||
// 								   that.color.o(2) > inactiveColor.o(2);
// 						   },
// 						   step: function() {
// 							   that.color = that.color.add(colorStep.inverse());
// 						   }
// 						  }));
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
		spec.rotation = defaultRotation()*0.2;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

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
					  repellent({pos: $V([590, 40])}),
					  repellent({pos: $V([480, 70])}),
					  repellent({pos: $V([350, 50])})];

// 	var ligands = $R(0, 20).map(function(index) {
// 		return randomLigand();
// 	});

	var membranes = [membrane({pos: $V([0, 0]), orientation: 0})];

	var columns = [column({pos: $V([300, 250]), orientation: 0}),
				   column({pos: $V([140, 250]), orientation: 0}),
				   column({pos: $V([600, 250]), orientation: 0})];
	var receptors = columns.inject([], function(rs, column) {return rs.concat(column.receptors);});
	var cheWs = columns.map(function(column) {return column.cheW;});

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

	receptors.each(function(receptor, index) {
		receptor.cheW = cheWs[index];
	});

	var spec = {
		id: id,
		motes: membranes
			.concat(columns)
//			.concat(ligands)
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