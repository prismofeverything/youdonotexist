var homeostasis = function(id) {
    var inside = flux.bounds(20, 800, 320, 1000);
    var outside = flux.bounds(0, 800, 0, 250);
    var above = flux.bounds(-1700, 1700, 0, 250);
    var below = flux.bounds(-1700, 1700, 2000, 1700);
    var offscreen = flux.bounds(-50, 800, -50, 0);

    var receptorGrip = 0.996;
    var attractantRepellentRatio = 0.3;
    var phosphorylationCycles = 50;
    var globalVelocity = 5;
    var timeZoom = 10;

    var defaultRotation = function() {return Math.random() * 0.1 - 0.05;};

    var molecule = function(spec) {
        var that = flux.mote(spec);
        that.neighbors = [that];

        that.mouseIn = spec.mouseIn || function(mouse) {
            that.oldColor = that.color.dup();
            that.tweenColor($V([255, 255, 255, 1]), 5);
        };

        that.mouseOut = spec.mouseOut || function(mouse) {
            if (that.oldColor) that.tweenColor(that.oldColor, 5);
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
            return {type: 'attractant', ligand: attractant({pos: randomPos(inside)})};
        } else {
            return {type: 'repellent', ligand: repellent({pos: randomPos(inside)})};
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
            if (!exists(that.closestReceptor) || that.closestReceptor.taken) {
                that.closestReceptor = that.findClosest(membranes.first().receptors, function(receptor) {
                    return receptor.taken === false;
                });
            }

            if (exists(that.closestReceptor)) {
                var distance = that.closestReceptor.distance(that);

                if (distance > globalVelocity) {
                    that.future.append(function(self) {
                        that.velocity = that.velocity.add(that.to(that.closestReceptor).x(20/(distance))).scaleTo(velocityScale*globalVelocity);
                    });
                } else {
                    that.future.append(function(self) {
                        that.velocity = $V([0, 0]);
                        that.rotation = 0;
                    });

                    that.closestReceptor.take(that);
                    that.perceive = that.attached;
                }
//          } else {
//              that.velocity = $V([Math.random()-0.5, Math.random()-1]).x(globalVelocity);
            }
        };

        that.attached = function(env) {
            if (Math.random() > receptorGrip) {
                that.velocity = that.closestReceptor.column.absolute().subtract(that.absolute()).scaleTo(globalVelocity);
                that.rotation = defaultRotation();

                that.perceive = that.detached;
                that.closestReceptor.release();
                that.closestReceptor = null;
            }
        };

        that.detached = function(env) {
            if (that.absolute().o(0) < -10 || that.absolute().o(1) < -10) {
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

//         that.submotes = that.columns
//             .concat(that.phosphates)
//             .concat(that.methyls)
//             .concat(that.cheYs)
//             .concat(that.cheZs)
//             .concat(that.cheBs)
//             .concat(that.cheRs);

//         that.submotes.each(function(submote) {
//             submote.supermote = that;
//         });

        that.addSubmotes(that.columns
            .concat(that.phosphates)
            .concat(that.methyls)
            .concat(that.cheYs)
            .concat(that.cheZs)
            .concat(that.cheBs)
            .concat(that.cheRs));

        that.perceive = function(env) {
            that.tree = Math.kdtree(that.submotes, 'absolute', 0);
            that.submotes.each(function(submote) {
                submote.neighbors = that.tree.nearest(submote.absolute(), 5, function(pod) {
                    return !(pod === that);
                });
                submote.perceive(env);
            });
        };

        return that;
    };

    var column = function(spec) {
        spec.color = spec.color || $V([60, 70, 170, 1]);
        spec.outline = spec.outline || $V([0, 0, 0, 1]);
        spec.lineWidth = 3;
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

        var that = molecule(spec);

        that.cheW = cheW({pos: $V([0, 100]), orientation: 0, column: that});
        that.receptors = [
            receptor({pos: $V([0, -18]), column: that, cheW: that.cheW}),
            receptor({pos: $V([-25, -42]), column: that, cheW: that.cheW}),
            receptor({pos: $V([-17, -26]), column: that, cheW: that.cheW}),
            receptor({pos: $V([17, -26]), column: that, cheW: that.cheW}),
            receptor({pos: $V([25, -42]), column: that, cheW: that.cheW})
        ];
        that.addSubmotes([that.cheW].concat(that.receptors));

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

        return that;
    };

    var receptor = function(spec) {
        spec.color = $V([0, 0, 0, 0]);
        spec.shape = flux.shape({ops: [flux.op.arc({to: $V([0, 0]), radius: 7})]});

        var that = molecule(spec);

        that.column = spec.column;
        that.cheW = spec.cheW;

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
            that.tweenColor(activeColor, 20);

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
            that.tweenColor(inactiveColor, 20);
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
//          that.neighbors = [];
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
                if (!exists(that.activeCheW) || !that.activeCheW.active) {
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
        var velocityScale = 3;

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

            if (!exists(that.nearestPhosphate) || that.nearestPhosphate.attached) {
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

    var ligands = {
        attractant: [],
        repellent: []
    };

    $R(0, 30).map(function(index) {
        var one = randomLigand();
        ligands[one.type].append(one.ligand);
    });

    var membranes = [membrane({pos: $V([0, 985]), orientation: 0})];

    var visible = {
        ligand: ligands,
        membrane: membranes
    };

    var focusGroups = [
        {name: 'attractant', path: 'ligand.attractant'},
        {name: 'repellent', path: 'ligand.repellent'},
        {name: 'column', path: 'membrane.0.columns'},
        {name: 'cheW', path: 'membrane.0.cheWs'},
        {name: 'phosphate', path: 'membrane.0.phosphates'},
        {name: 'cheY', path: 'membrane.0.cheYs'},
        {name: 'cheZ', path: 'membrane.0.cheZs'},
        {name: 'methyl', path: 'membrane.0.methyls'},
        {name: 'cheB', path: 'membrane.0.cheBs'},
        {name: 'cheR', path: 'membrane.0.cheRs'},
        {name: 'membrane', path: 'membrane'}
    ];

    var moleculeFocus = function(group) {

    };

    var moleculeKey = function() {
        var keyspec = {
            pos: $V([0.8, 0.1]),
            shape: flux.shape({ops: [
                flux.op.line({to: $V([200, 0])}),
                flux.op.line({to: $V([200, 330])}),
                flux.op.line({to: $V([0, 330])}),
                flux.op.line({to: $V([0, 0])})
            ]}),
            orientation: 0,
            lineWidth: 2,
            outline: $V([170, 170, 170, 1]),
            color: $V([0, 0, 0, 1]),
            transform: 'screen'
        };
        var key = flux.mote(keyspec);

        var keyitem = function(spec) {
            var inactiveColor = $V([60, 70, 170, 1]);
            var activeColor = $V([230, 230, 230, 1]);

            spec.color = spec.color || inactiveColor.dup();
            spec.orientation = 0;
            spec.fill = 'stroke';
            spec.shape = spec.shape || flux.shape({ops: [
                flux.op.text({to: $V([0, 0]), size: 14, string: spec.name})
            ]});

            var item = flux.mote(spec);

            item.mouseIn = function(mouse) {
                item.tweens = [];
                item.tweenColor(activeColor, 3);
            };

            item.mouseOut = function(mouse) {
                item.tweens = [];
                item.tweenColor(inactiveColor, 3);
            };

            return item;
        };

        key.keyitems = focusGroups.map(function(group, index) {
            return keyitem({name: group.name, pos: $V([10, index*30+20])});
        });

        key.addSubmotes(key.keyitems);

        return key;
    }();

    var spec = {
        id: id,
        motes: membranes.concat(ligands.attractant).concat(ligands.repellent).concat([moleculeKey]),
        scale: $V([0.2, 0.2]),
        translation: $V([600, 200]),

        move: function(mouse) {
            if (mouse.down) {
                this.translation = this.translation.add(mouse.screen.subtract(mouse.prevscreen));
            }
        },

        wheel: function(that, delta) {
            var scale = Math.pow(1.01, delta);
            this.scale = this.scale.times($V([scale, scale]));
        }

//         postdraw: function(context) {
//             moleculeKey.draw(context);
//         }
    };

    var world = flux.canvas(spec);

    // for testing
    world.membrane = membranes[0];
    world.key = moleculeKey;

    return world;
};