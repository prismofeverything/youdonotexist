var homeostasis = function(id) {
	var inside = bounds(20, 800, 320, 1000);
	var outside = bounds(0, 800, 0, 250);
	var offscreen = bounds(-50, 800, -50, 0);

	var receptorGrip = 0.996;
	var attractantRepellentRatio = 0.7;

	var defaultRotation = function() {return Math.random() * 0.1 - 0.05;};

	var randomPos = function(box) {
		return $V(box.randomPoint());
	};

	var randomLigand = function(box) {
		if (Math.random() * (attractantRepellentRatio + 1) < attractantRepellentRatio) {
			return attractant({pos: randomPos(box)});
		} else {
			return repellent({pos: randomPos(box)});
		}
	};

	var randomMote = function(type, box) {
		return type({pos: randomPos(box), bounds: box});
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
					var distance = that.closestReceptor.distance(that);

					if (distance > 1) {
						that.future.append(function(self) {
							that.velocity = that.velocity.add(that.to(that.closestReceptor).x(0.2/(distance))).scaleTo(velocityScale);
						});
					} else {
						that.future.append(function(self) {
							that.velocity = $V([0, 0]);
							that.rotation = 0;
						});

						that.closestReceptor.take(that);
						that.unattached = false;
						that.attached = true;
					}
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

		that.receptors = [receptor({supermote: that, pos: $V([0, -18]), column: that}),
						  receptor({supermote: that, pos: $V([-25, -42]), column: that}),
						  receptor({supermote: that, pos: $V([-17, -26]), column: that}),
						  receptor({supermote: that, pos: $V([17, -26]), column: that}),
						  receptor({supermote: that, pos: $V([25, -42]), column: that})];
		that.cheW = cheW({supermote: that, pos: $V([0, 100]), orientation: 0, column: that});

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

		that.submotes = [that.cheW].concat(that.receptors);

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

		spec.color = spec.color || inactiveColor.dup();
		spec.shape = spec.shape || [op.move({to: $V([-30, 0])}),
									op.bezier({to: $V([30, 0]), control1: $V([30, 30]), control2: $V([-30, 30])}),
									op.bezier({to: $V([-30, 0]), control1: $V([-30, -30]), control2: $V([30, -30])})
								   ];

		var that = mote(spec);

		that.active = false;

		that.activate = function() {
			that.active = true;

			that.tweens = [];
			that.tweens.append(tweenV({
				obj: that,
				property: 'color',
				to: activeColor,
				cycles: 20
			}));

			cheWSeekers.each(function(seeker) {
				if (seeker.activeCheW) {
					if (seeker.distance(seeker.activeCheW) > seeker.distance(that)) {
						seeker.activeCheW = that;
					}
				}
			});
		};

		that.deactivate = function() {
			that.active = false;

			that.tweens = [];
			that.tweens.append(tweenV({
				obj: that,
				property: 'color',
				to: inactiveColor,
				cycles: 20
			}));
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

		var that = cheWSeeker(spec);

		that.phosphorylated = function() {

		};

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

	var cheWSeeker = function(spec) {
		var that = mote(spec);

		var velocityScale = 0.9;

		that.nearestPhosphate = null;
		that.phosphate = null;
		that.activeCheW = null;

		that.outsideCheW = function() {};
		that.nearCheW = function() {};
		that.tooCloseCheW = function() {};
		that.offCheW = function() {};
		that.phosphorylated = function() {};

		that.perceive = function(env) {
			var switchedOff = false;

			if (!(that.phosphate === null)) {
				that.phosphorylated();
			} else {
				if (that.activeCheW === null || !that.activeCheW.active) {
					if (that.activeCheW && !that.activeCheW.active) {
						switchedOff = true;
					}

					that.activeCheW = that.findClosest(cheWs, function(cheW) {
						return cheW.active;
					});
				}

				if (!(that.activeCheW === null)) {
					var distance = that.distance(that.activeCheW);
					var turning = that.to(that.activeCheW).x(0.2/(distance));

					if (distance < 300) {
						if (distance > 50) {
							that.future.append(function(self) {
								that.velocity = that.velocity.add(turning).scaleTo(velocityScale);
							});
							that.near = false;

							that.outsideCheW();
						} else if (distance > 20) {
							that.future.append(function(self) {
								that.velocity = that.velocity.add(turning).scaleTo(velocityScale/3);
							});
							that.near = true;

							that.nearCheW();
						} else {
							that.future.append(function(self) {
								that.velocity = that.velocity.scaleTo(distance / 50);
							});
							that.near = true;

							that.tooCloseCheW();
						}
					} else {
						that.future.append(function(self) {
							that.velocity = that.velocity.add(turning).scaleTo(velocityScale/3);
						});
						that.near = false;
					}
				} else if (switchedOff) {
					that.future.append(function(self) {
						that.velocity = $V([Math.random()-0.5, Math.random()-0.5]);
					});
					that.offCheW();
				} else {

				}
			}
		};

		return that;
	};

	var cheY = function(spec) {
		var velocityScale = 0.9;

		var activeColor = spec.activeColor || $V([150, 180, 190, 1]);
		var inactiveColor = spec.inactiveColor || $V([40, 58, 64, 1]);

		spec.color = spec.color || inactiveColor.dup();
		spec.shape = spec.shape || [op.move({to: $V([-20, 3])}),
									op.line({to: $V([0, 3])}),
									op.line({to: $V([25, 9])}),
									op.line({to: $V([30, 6])}),
									op.line({to: $V([6, 0])}),
									op.line({to: $V([30, -6])}),
									op.line({to: $V([25, -9])}),
									op.line({to: $V([0, -3])}),
									op.line({to: $V([-20, -3])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = cheWSeeker(spec);

		that.nearCheW = function() {
			var switchedOff = false;

			if (that.nearestPhosphate === null || that.nearestPhosphate.attached) {
				if (that.nearestPhosphate && that.nearestPhosphate.attached) {
					switchedOff = true;
				}

				that.nearestPhosphate = that.findClosest(phosphates, function(phosphate) {
					return phosphate.activeCheW === that.activeCheW && !phosphate.attached;
				});
			}

			if (!(that.nearestPhosphate === null)) {
				var distance = that.distance(that.nearestPhosphate);

				if (distance < 20) {
					that.phosphate = that.nearestPhosphate;
					that.attach(that.phosphate);

					that.tweens.append(tweenV({
						obj: that,
						property: 'color',
						to: activeColor,
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[2],
						property: 'to',
						to: $V([10, 20]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[3],
						property: 'to',
						to: $V([15, 17]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[5],
						property: 'to',
						to: $V([15, -17]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[6],
						property: 'to',
						to: $V([10, -20]),
						cycles: 40
					}));

					that.phosphate.tweens.append(tweenV({
						obj: that.phosphate,
						property: 'pos',
						to: $V([-5, 5]),
						cycles: 40
					}));

					that.phosphate.tweens.append(tweenN({
						obj: that.phosphate,
						property: 'orientation',
						to: Math.PI*0.5,
						cycles: 80,
						test: (that.phosphate.orientation < Math.PI*0.5) ? tweenN.greater : tweenN.less
					}));

					that.phosphate.future = [];
					that.phosphate.rotation = 0;
					that.phosphate.attached = true;
					that.phosphate.phosphate = that;

					world.motes = world.motes.without(that.phosphate);

					that.future.append(function(self) {
						self.velocity = self.activeCheW.to(self).scaleTo(velocityScale);
					});
				} else {
					that.nearestPhosphate.future.append(function(self) {
						self.velocity = self.velocity.add(self.to(that).scaleTo(0.1));
					});
				}
			}
		};

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
		var activeColor = spec.activeColor || $V([140, 120, 185, 1]);
		var inactiveColor = spec.inactiveColor || $V([80, 80, 90, 1]);
		var velocityScale = 0.9;

		spec.color = spec.color || inactiveColor.dup();
		spec.shape = spec.shape || [op.move({to: $V([-15, -15])}),
									op.line({to: $V([15, -15])}),
									op.line({to: $V([15, -10])}),
									op.bezier({to: $V([0, -5]), control1: $V([15, 15]), control2: $V([0, 15])}),
									op.bezier({to: $V([-15, -5]), control1: $V([0, 15]), control2: $V([-15, 15])})
								   ];
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]);

		var that = cheWSeeker(spec);

		that.nearCheW = function() {
			var switchedOff = false;

			if (that.nearestPhosphate === null || that.nearestPhosphate.attached) {
				if (that.nearestPhosphate && that.nearestPhosphate.attached) {
					switchedOff = true;
				}

				that.nearestPhosphate = that.findClosest(phosphates, function(phosphate) {
					return phosphate.activeCheW === that.activeCheW && !phosphate.attached;
				});
			}

			if (!(that.nearestPhosphate === null)) {
				var distance = that.distance(that.nearestPhosphate);

				if (distance < 20) {
					that.phosphate = that.nearestPhosphate;
					that.attach(that.phosphate);

					that.tweens.append(tweenV({
						obj: that,
						property: 'color',
						to: activeColor,
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[2],
						property: 'to',
						to: $V([15, 60]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[3],
						property: 'control1',
						to: $V([15, 0]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[3],
						property: 'control2',
						to: $V([10, 0]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[3],
						property: 'to',
						to: $V([0, 0]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[4],
						property: 'control1',
						to: $V([-10, 0]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[4],
						property: 'control2',
						to: $V([-15, 0]),
						cycles: 40
					}));

					that.tweens.append(tweenV({
						obj: that.shape[4],
						property: 'to',
						to: $V([-15, 60]),
						cycles: 40
					}));

					that.phosphate.tweens.append(tweenV({
						obj: that.phosphate,
						property: 'pos',
						to: $V([-5, 5]),
						cycles: 40
					}));

					that.phosphate.tweens.append(tweenN({
						obj: that.phosphate,
						property: 'orientation',
						to: Math.PI*0.5,
						cycles: 80,
						test: (that.phosphate.orientation < Math.PI*0.5) ? tweenN.greater : tweenN.less
					}));

					that.phosphate.future = [];
					that.phosphate.rotation = 0;
					that.phosphate.attached = true;
					that.phosphate.phosphate = that;

					world.motes = world.motes.without(that.phosphate);

					that.future.append(function(self) {
						self.velocity = self.activeCheW.to(self).scaleTo(velocityScale);
					});
				} else {
					that.nearestPhosphate.future.append(function(self) {
						self.velocity = self.velocity.add(self.to(that).scaleTo(0.1));
					});
				}
			}
		};

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

	var ligands = $R(0, 20).map(function(index) {
		return randomLigand(outside);
	});

	var membranes = [membrane({pos: $V([0, 0]), orientation: 0})];

	var columns = [column({pos: $V([300, 250]), orientation: 0}),
				   column({pos: $V([140, 250]), orientation: 0}),
				   column({pos: $V([600, 250]), orientation: 0})];

	// receptors and cheWs are part of columns, but we make a reference for them here
	var receptors = columns.inject([], function(rs, column) {return rs.concat(column.receptors);});
	var cheWs = columns.map(function(column) {return column.cheW;});

	var phosphates = $R(0, 20).map(function(index) {
		return randomMote(phosphate, inside);
	});
	var methyls = $R(0, 20).map(function(index) {
		return randomMote(methyl, inside);
	});

	var cheYs = $R(0, 10).map(function(index) {
		return randomMote(cheY, inside);
	});

	var cheBs = $R(0, 10).map(function(index) {
		return randomMote(cheB, inside);
	});

	var cheZs = $R(0, 10).map(function(index) {
		return randomMote(cheZ, inside);
	});

	var cheRs = $R(0, 10).map(function(index) {
		return randomMote(cheR, inside);
	});

	var cheWSeekers = cheYs.concat(cheBs).concat(phosphates);

	receptors.each(function(receptor, index) {
		receptor.cheW = cheWs[index];
	});

	var motes = membranes
		.concat(columns)
		.concat(ligands)
		.concat(phosphates)
		.concat(methyls)
		.concat(cheYs)
		.concat(cheZs)
		.concat(cheBs)
		.concat(cheRs);

	var spec = {
		id: id,
		motes: motes
	};

	var world = flux(spec);
	return world;
};