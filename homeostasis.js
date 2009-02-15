var homeostasis = function(id) {
    var above = flux.bounds(-1700, 1700, -450, 250);
    var below = flux.bounds(-1700, 1700, 1700, 2400);
    var all = above.copy().union(below);

    var receptorGrip = 0.996;
    var attractantRepellentRatio = 0.5;
    var phosphorylationCycles = 50;
    var globalVelocity = 5;
    var timeZoom = 10;
    var dragging = false;

    var defaultRotation = function() {return Math.random() * 0.1 - 0.05;};

    var descriptions = {
        homeostasis: 'Homeostasis is the process of maintaining some kind of balance\n'
            + 'in the face of endlessly changing external forces.  In this case\n'
            + 'the cell is always seeking to climb the gradient of attractants\n'
            + 'and oppose the gradient of repellents, leading it to sources of food\n'
            + 'and away from potentially harmful agents.  The system maintains\n'
            + 'its sensitivity to even the most subtle gradient while compensating\n'
            + 'for any saturation of either attractants or repellents in the\n'
            + 'surrounding environment.',
        about: 'This is an interactive model of cellular chemotaxis.  You can drag\n'
            + 'the model around with the mouse and zoom in and out with the scroll wheel,\n'
            + 'or the \'i\' and \'o\' keys (for \'in\' and \'out\') if you are missing a scroll wheel.\n'
            + 'Mousing over one of the components will highlight the corresponding entry\n'
            + 'in the menu, and clicking will bring up a description of that component\n'
            + 'and its role in the process of sensing chemical gradients.',
        '______________________________': 'This is the divider!',
        membrane: 'The membrane is the enclosing surface that separates\n'
            + 'the inside of the cell from the outside.  The cell\n'
            + 'maintains an electric potential across this membrane\n'
            + 'and then harnesses that potential to do work.',
        column: 'The column spans the membrane, allowing for communication\n'
            + 'across the otherwise impenetrable barrier.  This way also\n'
            + 'transportation of materials across the membrane is strictly\n'
            + 'controlled.  In this case, receptors in the outer portion\n'
            + 'of the column bind either attractants or repellents, which\n'
            + 'act as ligands, and the inner portion is bound to cheW,\n'
            + 'which can be activated or deactived based on which ligands\n'
            + 'the outer portion is bound to.',
        repellent: 'Repellents bind to receptors in a column and\n'
            + 'increase the activity of cheW, leading to the phosphorylation\n'
            + 'of cheY and cheB.',
        attractant: 'Attractants bind to receptors in a column and\n'
            + 'reduce the activity of cheW.',
        cheW: 'cheW is activated by repellents binding to the outer portion\n'
            + 'of the column and deactivated by the binding of attractants,\n'
            + 'with its sensitivity guided by the number of bound\n'
            + 'methyl groups attached to the inner portion.  When active, cheW\n'
            + 'enables the phosphorylation of cheY, which triggers activation of the\n'
            + 'flagellar motors, and of cheB, which removes\n'
            + 'methyl groups from the column.',
        phosphate: 'Phosphate groups often act as a tag, or a signal that some condition is present.\n'
            + 'In the process of binding to various enzymes they trigger conformational\n'
            + 'changes which expose the enzymes\' active sites.  These active sites\n'
            + 'then trigger some other change, such as splicing or fusing other molecular components.',
        cheY: 'cheY is an enzyme that when phosphorylated binds to flagellar motors,\n'
            + 'inducing them to reverse their rotation and send the cell tumbling in a different direction.\n'
            + 'Most of the time the flagella are rotating in a clockwise direction, which sends\n'
            + 'the cell travelling in mostly a straight line.  The motor can be reversed, causing the cell\n'
            + 'to tumble more or less randomly, which then travels off in a new direction.',
        cheZ: 'cheZ removes the phosphorylation of both cheY and cheB.  In this way,\n'
            + 'a balance is struck between the phosphorylation caused by the activation of\n'
            + 'cheW when the cell is in the presence of repellents, and the steady dephosphorylation\n'
            + 'that results from interactions with cheZ.  This self-limiting cycle\n'
            + 'results in a sensitivity to chemical gradients, with the cell avoiding repellents\n'
            + 'and seeking attractants.',
        methyl: 'Methyl groups are signifiers like phosphates, and are attached to various molecules\n'
            + 'in order to induce conformational changes.  In this case, the methyls are binding\n'
            + 'to the inner portion of the columns.  The more methyl groups bound to the column,\n'
            + 'the more sensitive the column is to repellents, and the more active cheW will be.',
        cheB: 'cheB is phosphorylated in the presence of active cheW, just like cheY.  cheB\n'
            + 'removes methyl groups from columns, thereby reducing the activity of cheW and\n'
            + 'the subsequent phosphorylation of cheB (and cheY).  So here we see another layer\n'
            + 'of self-limitation, the activation of cheW leading to the phosphorylation of cheB\n'
            + 'leading to the demethylation of columns leading to the DE-activation of cheW.\n'
            + 'So the activation of cheW entails the eventual deactivation of cheW, cleaning up\n'
            + 'its own mess so to speak.  This process is called *adaptation*, and is common\n'
            + 'to a mind-boggling cross-section of biological processes.  ',
        cheR: 'cheR adds methyl groups to the inner portion of a column at a\n'
            + 'steady rate.  In this way the rate of cheW activation is steadily\n'
            + 'increased, offset by the concentration of phosphorylated cheB.\n'
            + 'This adaptive cycle of methylation and demethylation is on a much\n'
            + 'longer time-scale than the activation of cheW by repellents and\n'
            + 'the phosphorylation of cheY.  In this way the cell can be\n'
            + 'immediately responsive while at the same time adaptive to the\n'
            + 'general fluctuations of attractants and repellents in the\n'
            + 'surrounding environment.'
    };

    var molecule = function(spec) {
        var that = flux.mote(spec);
        var oldVelocity = that.velocity;
        that.neighbors = [that];

        that.focus = function() {
            that.oldColor = that.color.dup();
            that.tweenColor($V([255, 255, 255, 1]), 5);

            that.pause();
        };

        that.unfocus = function() {
            if (that.oldColor) that.tweenColor(that.oldColor, 5);
            that.unpause();
        };

        that.mouseIn = spec.mouseIn || function(mouse) {
            that.focus();

            if (that.type) {
                moleculeKey.itemhash[that.type].activate();
            }
        };

        that.mouseOut = spec.mouseOut || function(mouse) {
            that.unfocus();

            if (that.type) {
                moleculeKey.itemhash[that.type].deactivate();
            }
        };

        that.keyItem = function() {
            return moleculeKey.itemhash[that.type];
        };

        var showDescription = function(mouse) {
            // only show the deepest submote under the mouse
            var lowest = mouse.inside.inject(that, function(lowest, inside) {
                return lowest.supermotes().length < inside.supermotes().length ? inside : lowest;
            });

            if (that === lowest) {
                that.keyItem().showDescription();
            }
        };

        var hideDescription = function(mouse) {
            that.keyItem().hideDescription();
        };

        that.findNeighbor = function(condition) {
            var index = 0;
            var neighbor = null;
            var found = null;

            while (!found && index < that.neighbors.length) {
                neighbor = that.neighbors[index];
                if (condition(neighbor)) {
                    found = neighbor;
                }

                index += 1;
            }

            return found;
        };

        that.mouseDown = spec.mouseDown || showDescription;
        that.mouseUp = spec.mouseUp || hideDescription;

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
            }
        };

        that.attached = function(env) {
            if (Math.random() > receptorGrip) {
                that.velocity = that.absolute().subtract(that.closestReceptor.column.absolute()).scaleTo(globalVelocity);
                that.rotation = defaultRotation();

                that.perceive = that.detached;
                that.closestReceptor.release();
                that.closestReceptor = null;
            }
        };

        that.detached = function(env) {
            if (!all.inside(that.absolute())) {
                var realm = Math.random() - 0.5 < 0 ? above : below;
                that.pos = randomPos(realm);
                that.perceive = that.unattached;
            }
        };

        that.rest = that.unattached;
        that.perceive = that.rest;

        return that;
    };

    var attractant = function(spec) {
        spec.type = 'attractant';
        spec.color = spec.color || $V([140, 170, 100, 1]);
        spec.shape = spec.shape || flux.shape({ops: [flux.op.arc({radius: 7})]});
        spec.velocity = $V([Math.random()-0.5, Math.random()-0.5]).x(globalVelocity);

        var that = ligand(spec);

        return that;
    };

    var repellent = function(spec) {
        spec.type = 'repellent';
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
        that.polarity = 1;

        return that;
    };

    var membrane = function(spec) {
        spec.type = 'membrane';
        spec.fill = 'stroke';
        spec.lineWidth = 30;
        spec.color = spec.color || $V([80, 20, 20, 1]);

        spec.shape = spec.shape || flux.shape({ops: [
            flux.op.move({to: $V([-1400, -700])}),
            flux.op.line({to: $V([1400, -700])}),
            flux.op.bezier({to: $V([1400, 700]), control1: $V([2450, -700]), control2: $V([2450, 700])}),
            flux.op.line({to: $V([-1400, 700])}),
            flux.op.bezier({to: $V([-1400, -700]), control1: $V([-2450, 700]), control2: $V([-2450, -700])})
        ], fill: 'stroke'});

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

        that.addSubmotes(that.columns
            .concat(that.phosphates)
            .concat(that.methyls)
            .concat(that.cheYs)
            .concat(that.cheZs)
            .concat(that.cheBs)
            .concat(that.cheRs));

//        that.submote_pantheon = that.cheWs.concat(that.submotes.clone());

        that.submote_pantheon = that.cheWs
            .concat(that.phosphates)
            .concat(that.methyls)
            .concat(that.cheYs)
            .concat(that.cheZs)
            .concat(that.cheBs)
            .concat(that.cheRs);

        that.perceive = function(env) {
            that.tree = Math.kdtree(that.submote_pantheon, 'absolute', 0);
            that.submote_pantheon.each(function(submote) {
                submote.neighbors = that.tree.nearest(submote.absolute(), 5, function(pod) {
                    return !(pod === that);
                });
            });

            that.submotes.each(function(submote) {
                submote.perceive(env);
            });
        };

        return that;
    };

    var column = function(spec) {
        spec.type = 'column';
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
        spec.type = 'receptor';
        spec.visible = false;
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
        spec.type = 'cheW';

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
        spec.type = 'phosphate';
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
            that.pos = enzyme.introvert(that.pos);
            that.absolute.expire();

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
            that.phosphorylated = true;
        };

        that.whenPhosphorylated = function() {

        };

        return that;
    };

    var methyl = function(spec) {
        spec.type = 'methyl';
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

        var velocityScale = 5;

        that.nearestPhosphate = null;
        that.phosphate = null;
        that.phosphorylated = false;
        that.activeCheW = null;

        that.outsideCheW = function() {};
        that.nearCheW = function() {};
        that.tooCloseCheW = function() {};
        that.offCheW = function() {};
        that.whenPhosphorylated = function() {};

        that.outside = function(env) {

        };

        that.perceive = function(env) {
            var switchedOff = false;

            if (that.phosphorylated) {
                that.whenPhosphorylated();
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
                                that.velocity = that.velocity.add(turning).scaleTo(velocityScale*0.5);
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
                        that.velocity = $V([(Math.random()-0.5)*velocityScale, (Math.random()-0.5)*velocityScale]);
                    });
                    that.offCheW();
                } else {

                }
            }
        };

        return that;
    };

    var cheY = function(spec) {
        spec.type = 'cheY';

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
                    that.phosphorylated = true;

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
        spec.type = 'cheZ';
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
        var phosphorylated = null;
        var phosphoneighbors = null;

        that.seekPhosphorylated = function() {
            if (!phosphorylated) {
            } else {
                that.future.append(function(self) {

                });
            }
        };

        return that;
    };

    var cheB = function(spec) {
        spec.type = 'cheB';

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
                    that.phosphorylated = true;

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
        spec.type = 'cheR';
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
        {name: 'membrane', path: 'membrane'},
        {name: 'column', path: 'membrane.0.columns'},
        {name: 'repellent', path: 'ligand.repellent'},
        {name: 'attractant', path: 'ligand.attractant'},
        {name: 'cheW', path: 'membrane.0.cheWs'},
        {name: 'phosphate', path: 'membrane.0.phosphates'},
        {name: 'cheY', path: 'membrane.0.cheYs'},
        {name: 'cheZ', path: 'membrane.0.cheZs'},
        {name: 'methyl', path: 'membrane.0.methyls'},
        {name: 'cheB', path: 'membrane.0.cheBs'},
        {name: 'cheR', path: 'membrane.0.cheRs'}
    ];

    focusGroups.arrange = function() {
        // arrange the descriptions in a circle
        var wedge = Math.PI*2*(1.0/focusGroups.length);
        var third = Math.PI*2.0/3;
        var outwards = $V([0.42, 0.22]);
        var zero = $V([0, 0]);
        var center = $V([0.245, 0.26]);

        $V([250, 240, 30, 1]);

        var colorWheel = function(phase) {
            return Math.floor(140 + (Math.sin(phase)*60));
        };

        focusGroups.each(function(group, index) {
            var around = wedge*index;
            var color = [around, around+(2*third), around+third].map(function(phase) {
                return colorWheel(phase);
            });
            color.append(1);

            group.outer = outwards.rotate(around, center).times($V([1, 1.7]));
            group.descriptionColor = $V(color);
        });
    };
    focusGroups.arrange();

    // descriptive menu -------------

    var moleculeFocus = function(group) {

    };

    var moleculeKey = function() {
        var keyspec = {
            pos: $V([0.72, 0.1]),
            shape: flux.shape({ops: [
                flux.op.move({to: $V([0, 0])}),
                flux.op.line({to: $V([200, 0])}),
                flux.op.line({to: $V([200, 410])}),
                flux.op.line({to: $V([0, 410])})
            ]}),
            orientation: 0,
            lineWidth: 2,
            outline: $V([170, 170, 170, 1]),
            color: $V([0, 0, 0, 1]),
            transform: 'screen'
        };
        var key = flux.mote(keyspec);

        var description = function(spec) {
            spec.orientation = 0;
            spec.fill = 'stroke';
            spec.lineWidth = 2;
            spec.transform = 'screen';

            var ops = spec.description.split('\n').map(function(line, index) {
                return flux.op.text({to: spec.pos.add($V([0, index*23])), size: 12, string: line});
            });

            var text = flux.shape({ops: ops, fill: 'stroke'});
            var background = text.box.scale(1.1).shapeFor();

            spec.shapes = [background, text];

            var desc = flux.mote(spec);

            desc.item = spec.item;
            desc.mouseDown = desc.item.hideDescription;
            background.color = $V([20, 20, 20, 1]);

            return desc;
        };

        var keyitem = function(spec) {
            var inactiveColor = spec.inactiveColor || $V([110, 130, 210, 1]);
            var activeColor = $V([230, 230, 230, 1]);

            spec.color = spec.color || inactiveColor.dup();
            spec.orientation = 0;
            spec.fill = 'stroke';
            spec.shape = spec.shape || flux.shape({ops: [
                flux.op.text({to: $V([0, 0]), size: 14, string: spec.name})
            ], fill: 'stroke'});

            var item = flux.mote(spec);

            item.name = spec.name;
            item.path = spec.path;

            item.active = false;
            item.outer = spec.outer || $V([5000, 0]);
            item.descriptionColor = spec.descriptionColor || $V([250, 240, 30, 1]);
            item.description = description({
                item: item,
                pos: item.outer,
                color: item.descriptionColor,
                description: descriptions[item.name]
            });

            item.activate = function() {
                if (!item.active) {
                    item.tweens = [];
                    item.tweenColor(activeColor, 3);
                    item.tweenScale($V([1.05, 1.05]), 3);

                    item.active = true;
                }
            };

            item.deactivate = function() {
                if (item.active) {
                    item.tweens = [];
                    item.tweenColor(inactiveColor, 3);
                    item.tweenScale($V([1, 1]), 3);

                    item.active = false;
                }
            };

            item.showDescription = function() {
                world.addActiveDescription(item.description);
            };

            item.hideDescription = function() {
                world.removeActiveDescription();
            };

            if (!spec.inactive) {
                item.mouseIn = item.activate;
                item.mouseOut = item.deactivate;
                item.mouseDown = item.showDescription;
                item.mouseUp = item.hideDescription;
            }

            return item;
        };

        var homeostatic = keyitem({
            name: 'homeostasis',
            pos: $V([10, 20]),
            outer: $V([0.2, 0.05]),
            inactiveColor: $V([150, 150, 110, 1]),
            descriptionColor: $V([240, 230, 170, 1])
        });

        var about = keyitem({
            name: 'about',
            pos: $V([10, 50]),
            outer: $V([0.2, 0.7]),
            inactiveColor: $V([150, 150, 110, 1]),
            descriptionColor: $V([150, 150, 210, 1])
        });

        var divider = keyitem({
            name: '______________________________',
            pos: $V([-35, 70]),
            outer: $V([0.5, 0.5]),
            inactive: true,
            inactiveColor: $V([210, 110, 110, 1]),
            descriptionColor: $V([150, 150, 210, 1])
        });

        key.itemhash = {};
        key.keyitems = [homeostatic, about, divider].concat(focusGroups.map(function(group, index) {
            group.pos = $V([10, index*30+100]);
            var item = keyitem(group);

            key.itemhash[group.name] = item;
            return item;
        }));

        key.addSubmotes(key.keyitems);

        return key;
    }();

    // creation of flux canvas -------------------

    var spec = {
        id: id,
        motes: membranes.concat(ligands.attractant).concat(ligands.repellent).append(moleculeKey),
        scale: $V([0.17, 0.17]),
        translation: $V([500, 200]),

        move: function(mouse) {
            if (mouse.down) {
                world.removeActiveDescription();
                this.translation = this.translation.add(mouse.screen.subtract(mouse.prevscreen));

                dragging = true;
            }
        },

        keyDown: function(that, key) {
            var base = 1.25;

            if (key == 79) {
                var scale = Math.pow(base, -1);
                that.zoom(scale);
            }
            if (key == 73) {
                var scale = Math.pow(base, 1);
                that.zoom(scale);
            }
        },

        // delta is either 1 or -1, which is the exponent of the scaling constant
        // signifying either the number or its inverse.
        wheel: function(that, delta) {
            var scale = Math.pow(1.007, delta);
            that.zoom(scale);
        }
    };

    var world = flux.canvas(spec);
    world.activeDescription = null;

    world.addActiveDescription = function(description) {
        world.removeActiveDescription();

        world.addMote(description);
        world.activeDescription = description;
    };

    world.removeActiveDescription = function() {
        if (world.activeDescription) {
            world.removeMote(world.activeDescription);
            world.activeDescription = null;
        }
    };

    // for testing
    world.membrane = membranes[0];
    world.key = moleculeKey;


    return world;
};