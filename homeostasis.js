var homeostasis = function(id) {
	var inside = flux.bounds(20, 800, 320, 1000);
	var outside = flux.bounds(0, 800, 0, 250);
	var above = flux.bounds(-1700, 1700, 0, 250);
	var below = flux.bounds(-1700, 1700, 2000, 1700);
	var offscreen = flux.bounds(-50, 800, -50, 0);

	var receptorGrip = 0.996;
	var attractantRepellentRatio = 0.3;
	var phosphorylationCycles = 50;
	var globalVelocity = 10;

	var defaultRotation = function() {return Math.random() * 0.1 - 0.05;};

	var molecule = function(spec) {
		var that = flux.mote(spec);
		that.neighbors = [that];

		that.mouseIn = function(mouse) {
			that.neighbors.each(function(neighbor) {
				neighbor.oldColor = neighbor.color.dup();
				neighbor.tweenColor($V([255, 255, 255, 1]), 10);
			});
		};

		that.mouseOut = function(mouse) {
			that.tweenColor(that.oldColor, 10);
		};

		return that;
	};

	var randomPos = function(box) {
		return $V(box.randomPoint());
	};

	var randomLigand = function() {
		var up = (Math.random() - 0.5) > 0;
		var inside = up ? above : below;

		if (Math.random() * (attractantRepellentRatio + 1) < attractantRepellentRatio) {
			return attractant({pos: randomPos(inside)});
		} else {
			return repellent({pos: randomPos(inside)});
		}
	};

	var randomColumn = function(box) {
		var up = (Math.random() - 0.5) > 0;
		var x = box.randomPoint()[0] * 0.6;
		var y = up ? box[1][0] - 20 : box[1][1] + 20;
		var orientation = up ? 0 : Math.PI;

		return column({pos: $V([x, y]), orientation: orientation});
	};

	var randomMolecule = function(type, box) {
		return type({pos: randomPos(box), bounds: box});
	};

	var ligand = function(spec) {
		var that = molecule(spec);
		var velocityScale = 0.9;

		that.closestReceptor = null;
		that.attached = false;
		that.detached = false;

		that.polarity = -1;

		that.unattached = function(env) {
			if (that.closestReceptor === null || that.closestReceptor.taken) {
				that.closestReceptor = that.findClosest(membranes.first().receptors, function(receptor) {
					return receptor.taken === false;
				});
			}

			if (exists(that.closestReceptor)) {
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
					that.perceive = that.attached;
				}
			} else {
				that.velocity = $V([Math.random()-0.5, Math.random()-1]).x(globalVelocity);
			}
		};

		that.attached = function(env) {
			if (Math.random() > receptorGrip) {
				that.velocity = $V([Math.random()-0.5, Math.random()-1]).x(globalVelocity);
				that.rotation = defaultRotation();

				that.perceive = that.detached;
				that.closestReceptor.release();
				that.closestReceptor = null;
			}
		};

		that.detached = function(env) {
			if (that.pos.o(0) < -10 || that.pos.o(1) < -10) {
				that.pos = randomPos(offscreen);
				that.perceive = that.unattached;
			}
		};

		that.rest = that.unattached;
		that.perceive = that.rest;

		return that;
	};

	var attractant = function(spec) {
		spec.color = spec.color || $V([140, 170, 100, 1]);
		spec.shape = spec.shape || flux.shape({ops: [flux.op.arc({radius: 7})]});
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = ligand(spec);
		that.type = 'A';

		return that;
	};

	var repellent = function(spec) {
		spec.color = spec.color || $V([170, 70, 60, 1]);
		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-6, -6])}),
			flux.op.line({to: $V([6, -6])}),
			flux.op.line({to: $V([6, 6])}),
			flux.op.line({to: $V([-6, 6])})
		]});
		spec.rotation = defaultRotation();
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = ligand(spec);

		that.type = 'X';
		that.polarity = 1;

		return that;
	};

	var membrane = function(spec) {
		spec.fill = 'stroke';
		spec.lineWidth = 30;
		spec.color = spec.color || $V([80, 20, 20, 1]);

		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-1400, -700])}),
			flux.op.line({to: $V([1400, -700])}),
			flux.op.bezier({to: $V([1400, 700]), control1: $V([2450, -700]), control2: $V([2450, 700])}),
			flux.op.line({to: $V([-1400, 700])}),
			flux.op.bezier({to: $V([-1400, -700]), control1: $V([-2450, 700]), control2: $V([-2450, -700])})
		]});

		var that = molecule(spec);

		var inside = flux.bounds(that.box[0][0] + 700, that.box[0][1] - 700, that.box[1][0] + 100, that.box[1][1] - 100);

		that.columns = $R(0, 12).map(function(index) {
			return randomColumn(that.box);
		});

		// receptors and cheWs are part of columns, but we make a reference for them here
		that.receptors = that.columns.inject([], function(rs, column) {return rs.concat(column.receptors);});
		that.cheWs = that.columns.map(function(column) {return column.cheW;});

		that.phosphates = $R(0, 20).map(function(index) {
			return randomMolecule(phosphate, inside);
		});
		that.methyls = $R(0, 20).map(function(index) {
			return randomMolecule(methyl, inside);
		});

		that.cheYs = $R(0, 10).map(function(index) {
			return randomMolecule(cheY, inside);
		});

		that.cheBs = $R(0, 10).map(function(index) {
			return randomMolecule(cheB, inside);
		});

		that.cheZs = $R(0, 10).map(function(index) {
			return randomMolecule(cheZ, inside);
		});

		that.cheRs = $R(0, 10).map(function(index) {
			return randomMolecule(cheR, inside);
		});

		that.cheWSeekers = that.cheYs.concat(that.cheBs).concat(that.phosphates);

		that.receptors.each(function(receptor, index) {
			receptor.cheW = that.cheWs[index];
		});

		that.aware = that.cheWs
			.concat(that.phosphates)
			.concat(that.methyls)
			.concat(that.cheYs)
			.concat(that.cheZs)
			.concat(that.cheBs)
			.concat(that.cheRs);

		that.submotes = that.columns
			.concat(that.phosphates)
			.concat(that.methyls)
			.concat(that.cheYs)
			.concat(that.cheZs)
			.concat(that.cheBs)
			.concat(that.cheRs);

		that.submotes.each(function(submote) {
			submote.supermote = that;
		});

		that.perceive = function(env) {
			that.tree = Math.kdtree(that.submotes, 'total', 0);
			that.aware.each(function(submote) {
				submote.neighbors = that.tree.nearest(submote.absolute(), 5);
				submote.perceive(env);
			});
		};

		return that;
	};

	var column = function(spec) {
		spec.color = spec.color || $V([60, 70, 170, 1]);
		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-30, -50])}),
			flux.op.bezier({to: $V([30, -50]), control1: $V([-30, 0]), control2: $V([30, 0])}),
			flux.op.line({to: $V([50, -50])}),
			flux.op.bezier({to: $V([10, 0]), control1: $V([60, -50]), control2: $V([40, 0])}),
			flux.op.line({to: $V([10, 100])}),
			flux.op.line({to: $V([-10, 100])}),
			flux.op.line({to: $V([-10, 0])}),
			flux.op.bezier({to: $V([-50, -50]), control1: $V([-40, 0]), control2: $V([-60, -50])})
		]});

		spec.perceive = function(env) {
			return null;
		};

		var that = molecule(spec);

		that.receptors = [
			receptor({supermote: that, pos: $V([0, -18]), column: that}),
			receptor({supermote: that, pos: $V([-25, -42]), column: that}),
			receptor({supermote: that, pos: $V([-17, -26]), column: that}),
			receptor({supermote: that, pos: $V([17, -26]), column: that}),
			receptor({supermote: that, pos: $V([25, -42]), column: that})
		];
		that.cheW = cheW({supermote: that, pos: $V([0, 100]), orientation: 0, column: that});

		that.level = 0;

		that.active = function(env) {
			if (that.level <= 0) {
				that.deactivate();
			}
		};

		that.inactive = function(env) {
			if (that.level > 0) {
				that.activate();
			}
		};

		that.activate = function() {
			that.perceive = that.active;
			that.cheW.activate();
		};

		that.deactivate = function() {
			that.perceive = that.inactive;
			that.cheW.deactivate();
		};

		that.perceive = that.inactive;
		that.submotes = [that.cheW].concat(that.receptors);

		return that;
	};

	var receptor = function(spec) {
		spec.color = $V([0, 0, 0, 0]);
		spec.shape = flux.shape({ops: [flux.op.arc({to: $V([0, 0]), radius: 7})]});

		var that = molecule(spec);

		that.column = spec.column;

		that.taken = false;
		that.ligand = null;
		that.delay = 0;

		that.take = function(ligand) {
			that.column.level += ligand.polarity;

			that.ligand = ligand;
			that.taken = true;
			that.perceive = that.bound;
		};

		that.release = function() {
			that.column.level -= that.ligand.polarity;

			that.ligand = null;
			that.taken = false;
			that.delay = 50;

			that.perceive = that.closed;
		};

		that.open = function(env) {

		};

		that.bound = function(env) {

		};

		that.closed = function(env) {
			if (that.delay < 1) {
				that.delay = 0;
				that.taken = false;
				that.perceive = that.open;
			} else {
				that.delay -= 1;
			}
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
		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-30, 0])}),
			flux.op.bezier({to: $V([30, 0]), control1: $V([30, 30]), control2: $V([-30, 30])}),
			flux.op.bezier({to: $V([-30, 0]), control1: $V([-30, -30]), control2: $V([30, -30])})
		]});

		var that = molecule(spec);

		that.active = false;

		that.activate = function() {
			that.active = true;

			that.tweens = [];
			that.tweens.append(flux.tweenV({
				obj: that,
				property: 'color',
				to: activeColor,
				cycles: 20
			}));

			membranes.first().cheWSeekers.each(function(seeker) {
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
			that.tweens.append(flux.tweenV({
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
		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-10, -5])}),
			flux.op.line({to: $V([10, -5])}),
			flux.op.line({to: $V([10, 0])}),
			flux.op.bezier({to: $V([1, 0]), control1: $V([10, 10]), control2: $V([1, 10])}),
			flux.op.line({to: $V([-10, 0])})
		]});

		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = cheWSeeker(spec);

		that.phosphorylate = function(enzyme) {
			that.tweens.append(flux.tweenV({
				obj: that,
				property: 'pos',
				to: $V([-15, 10]),
				cycles: phosphorylationCycles
			}));

			that.tweens.append(flux.tweenN({
				obj: that,
				property: 'orientation',
				to: Math.PI*0.5,
				cycles: phosphorylationCycles
			}));

			that.future = [];
			that.rotation = 0;
			that.velocity = $V([0, 0]);
//			that.neighbors = [];
			that.attached = true;
			that.phosphate = enzyme;
		};

		that.phosphorylated = function() {

		};

		return that;
	};

	var methyl = function(spec) {
		spec.color = spec.color || $V([130, 110, 70, 1]);
		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-5, 0])}),
			flux.op.line({to: $V([6, 0])}),
			flux.op.line({to: $V([13, -4])}),
			flux.op.line({to: $V([19, 3])}),
			flux.op.line({to: $V([13, 10])}),
			flux.op.line({to: $V([6, 6])}),
			flux.op.line({to: $V([-5, 6])})
		]});

		spec.rotation = defaultRotation()*0.2;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = molecule(spec);
		return that;
	};

	var cheWSeeker = function(spec) {
		var that = molecule(spec);

		var velocityScale = 0.9;

		that.nearestPhosphate = null;
		that.phosphate = null;
		that.activeCheW = null;

		that.outsideCheW = function() {};
		that.nearCheW = function() {};
		that.tooCloseCheW = function() {};
		that.offCheW = function() {};
		that.phosphorylated = function() {};

		that.outside = function(env) {

		};

		that.perceive = function(env) {
			var switchedOff = false;

			if (exists(that.phosphate)) {
				that.phosphorylated();
			} else {
				if (that.activeCheW === null || !that.activeCheW.active) {
					if (that.activeCheW && !that.activeCheW.active) {
						switchedOff = true;
					}

					that.activeCheW = that.findClosest(membranes.first().cheWs, function(cheW) {
						return cheW.active;
					});
				}

				if (exists(that.activeCheW)) {
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

		var activeShape = spec.activeShape || flux.shape({ops: [
			flux.op.move({to: $V([-20, 0])}),
			flux.op.bezier({to: $V([0, 3]), control1: $V([-10, 4]), control2: $V([-10, 4])}),
			flux.op.bezier({to: $V([13, 19]), control1: $V([5, 17]), control2: $V([11, 20])}),
			flux.op.bezier({to: $V([5, 0]), control1: $V([11, 11]), control2: $V([11, 9])}),
			flux.op.bezier({to: $V([13, -19]), control1: $V([11, -9]), control2: $V([11, -11])}),
			flux.op.bezier({to: $V([0, -3]), control1: $V([11, -20]), control2: $V([5, -17])}),
			flux.op.bezier({to: $V([-20, 0]), control1: $V([-10, -4]), control2: $V([-10, -4])})
		]});

		var inactiveShape = spec.activeShape || flux.shape({ops: [
			flux.op.move({to: $V([-20, 0])}),
			flux.op.bezier({to: $V([0, 3]), control1: $V([-20, 15]), control2: $V([-10, 15])}),
			flux.op.bezier({to: $V([11, 10]), control1: $V([5, 10]), control2: $V([11, 10])}),
			flux.op.bezier({to: $V([11, 0]), control1: $V([11, 0]), control2: $V([11, 0])}),
			flux.op.bezier({to: $V([11, -10]), control1: $V([11, -0]), control2: $V([11, -0])}),
			flux.op.bezier({to: $V([0, -3]), control1: $V([11, -10]), control2: $V([5, -10])}),
			flux.op.bezier({to: $V([-20, 0]), control1: $V([-10, -15]), control2: $V([-20, -15])})
		]});

		spec.color = spec.color || inactiveColor.dup();
		spec.shape = inactiveShape.dup();

		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = cheWSeeker(spec);

		that.nearCheW = function() {
			var switchedOff = false;

			if (that.nearestPhosphate === null || that.nearestPhosphate.attached) {
				if (that.nearestPhosphate && that.nearestPhosphate.attached) {
					switchedOff = true;
				}

				that.nearestPhosphate = that.findClosest(membranes.first().phosphates, function(phosphate) {
					return phosphate.activeCheW === that.activeCheW && !phosphate.attached;
				});
			}

			if (exists(that.nearestPhosphate)) {
				var distance = that.distance(that.nearestPhosphate);

				if (distance < 20) {
					that.phosphate = that.nearestPhosphate;
					that.attach(that.phosphate);

					that.tweenColor(activeColor, phosphorylationCycles);
					that.tweenShape(activeShape, phosphorylationCycles);

					that.phosphate.phosphorylate(that);

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
		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-15, -15])}),
			flux.op.line({to: $V([15, -15])}),
			flux.op.line({to: $V([-5, 10])}),
			flux.op.line({to: $V([15, 10])}),
			flux.op.line({to: $V([15, 15])}),
			flux.op.line({to: $V([-15, 15])}),
			flux.op.line({to: $V([5, -10])}),
			flux.op.line({to: $V([-15, -10])})
		]});

		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = molecule(spec);
		return that;
	};

	var cheB = function(spec) {
		var activeColor = spec.activeColor || $V([100, 140, 230, 1]);
		var inactiveColor = spec.inactiveColor || $V([80, 80, 90, 1]);
		var velocityScale = 0.9;

		spec.color = spec.color || inactiveColor.dup();

		var inactiveShape = spec.inactiveShape || flux.shape({ops: [
			flux.op.move({to: $V([-15, -15])}),
			flux.op.line({to: $V([0, -15])}),
			flux.op.line({to: $V([15, -15])}),
			flux.op.bezier({to: $V([0, -5]), control1: $V([15, 15]), control2: $V([0, 15])}),
			flux.op.bezier({to: $V([-15, -15]), control1: $V([0, 15]), control2: $V([-15, 15])})
		]});

		var activeShape = spec.activeShape || flux.shape({ops: [
			flux.op.move({to: $V([-11, -25])}),
			flux.op.line({to: $V([0, -12])}),
			flux.op.line({to: $V([11, -25])}),
			flux.op.bezier({to: $V([0, -5]), control1: $V([25, -16]), control2: $V([30, 25])}),
			flux.op.bezier({to: $V([-13, -25]), control1: $V([-30, 25]), control2: $V([-25, -16])})
		]});

		spec.shape = inactiveShape.dup();
		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = cheWSeeker(spec);

		that.nearCheW = function() {
			var switchedOff = false;

			if (that.nearestPhosphate === null || that.nearestPhosphate.attached) {
				if (that.nearestPhosphate && that.nearestPhosphate.attached) {
					switchedOff = true;
				}

				that.nearestPhosphate = that.findClosest(membranes.first().phosphates, function(phosphate) {
					return phosphate.activeCheW === that.activeCheW && !phosphate.attached;
				});
			}

			if (exists(that.nearestPhosphate)) {
				var distance = that.distance(that.nearestPhosphate);

				if (distance < 20) {
					that.phosphate = that.nearestPhosphate;
					that.attach(that.phosphate);

					that.tweens.append(flux.tweenV({
						obj: that,
						property: 'color',
						to: activeColor,
						cycles: 40
					}));

					that.tweenColor(activeColor, phosphorylationCycles);
					that.tweenShape(activeShape, phosphorylationCycles);

					that.phosphate.phosphorylate(that);

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

		spec.shape = spec.shape || flux.shape({ops: [
			flux.op.move({to: $V([-15, -15])}),
			flux.op.line({to: $V([15, -15])}),
			flux.op.line({to: $V([15, -10])}),
			flux.op.bezier({to: $V([0, -5]), control1: $V([15, 15]), control2: $V([0, 15])}),
			flux.op.line({to: $V([-10, -5])}),
			flux.op.line({to: $V([-10, 15])}),
			flux.op.line({to: $V([-15, 15])})
		]});

		spec.rotation = Math.random()*0.02-0.01;
		spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

		var that = molecule(spec);
		return that;
	};

	var ligands = $R(0, 30).map(function(index) {
		return randomLigand();
	});

 	var membranes = [membrane({pos: $V([0, 985]), orientation: 0})];

	var spec = {
		id: id,
		motes: membranes.concat(ligands),
 		scale: $V([0.2, 0.2]),
 		translation: $V([600, 220]),

		down: function(mouse) {
			if (this.zoomedIn) {
				this.scale = $V([0.2, 0.2]);
				this.zoomedIn = false;
				this.translation = this.oldTranslation;
			} else {
				this.scale = $V([0.8, 0.8]);
				this.zoomedIn = true;
				this.oldTranslation = this.translation;
				this.translation = mouse.pos.add(this.translation).subtract(membranes.first().pos).times(this.scale).times($V([-0.8, -1])).add($V([900, -50]));
			}
		}
	};

	var world = flux.canvas(spec);
	return world;
};