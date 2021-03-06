var shapemaker = function () {
    var shape_index = 0;

    var shape = flux.shape({
        color: [255, 255, 255, 255]
    });

    var mote = flux.mote({
        shapes: [shape]
    });

    var ophighlight = flux.mote({
        shape: flux.shape({ops: [{op: 'arc', to: [0, 0], radius: Math.pi*2}]}),
        outline: [100, 200, 150]
    });

    var cursors = {};

    // create world
    var world = flux.canvas({
        id: 'shapemaker',

        resize: function (browser, canvas) {
            canvas.width = browser.w - 500;
            canvas.height = browser.h;
        },

        mouseDown: function (canvas, mouse) {
            cursors.op.add({op: 'line', to: mouse.pos});
        },

        keyDown: function (canvas, key, keys) {
            console.log(key+'');
            if (key == 37) { // left
                cursors[cc].previous();
            } else if (key == 39) { // right
                cursors[cc].next();
                // we can do this because we know there are only three cursors. 
                // if that ever changes, this breaks.
            } else if (key == 38) { // up
                raisecc();
            } else if (key == 40) { // down
                lowercc();
            }
        }
    });

    world.colorChange = function (color) {
        cursors.shape.focus().updateColor(color);
    };

    world.addMote(mote);
    world.addMote(ophighlight);

    var cursor = linkage.type({
        init: function (collection) {
            this.index = 0;
            this.collection = collection || function () {
                var col = []; 
                return function () {return col;};
            }();

            this.focus = linkage.link(null);
            this.refocus();
        },

        create: function () {},

        refocus: function () {
            this.focus(this.collection()[this.index]);
        },

        step: function (step) {
            this.index = (this.index + step) % this.collection().length;
            this.refocus();
        },

        next: function () {
            this.step(1);
        },

        previous: function () {
            this.step(-1);
        },

        add: function (spec) {
            var fresh = this.create(spec);
            this.collection().splice(this.index, 0, fresh);
            this.focus(fresh);

            return fresh;
        },

        remove: function () {
            var oldFocus = this.collection().splice(this.index, 1);
            var newIndex = this.index % this.collection().length;
            this.refocus();

            return oldFocus;
        }
    });

    cursors.mote = cursor(function () {
        if (this.focus() && this.focus.supermote) {
            return this.focus().supermote.motes;
        } else {
            return world.motes;
        }
    });

    cursors.shape = cursor(function () {
        return cursors.mote.focus() ? cursors.mote.focus().shapes : null;
    });

    cursors.op = cursor(function () {
        return cursors.shape.focus().ops;
    });

    var cc = 'op'; // cursorcursor

    cursors.mote.focus.watch(function (mote) {
        cursors.shape.focus(mote.shapes[0]);
    });

    cursors.shape.focus.watch(function (shape) {
        cursors.op.focus(shape.ops[0]);
    });

    cursors.op.focus.watch(function (op) {
        ophighlight.to[0] = op.to[0];
        ophighlight.to[1] = op.to[1];
    });

    var raisecc = function () {
        if (cc !== 'mote') {
            cc = cc === 'shape' ? 'mote' : 'shape';
        }
    };

    var lowercc = function () {
        if (cc !== 'op') {
            cc = cc === 'shape' ? 'op' : 'shape';
        }
    };

    var potentialMoteElaboration = {
        name: 'potential',
        cycles: {
            resting: {
                phases: [ // each phase is a shape
                    {
                        color: [255, 255, 255, 255],
                        ops: [
                            {
                                op: 'line',
                                to: [10, 90]
                            },
                            {
                                op: 'bezier',
                                to: [22, 77],
                                control1: [33, 66],
                                control2: [99, 88]
                            }
                        ]
                    },
                    {
                        // these could go on forever...
                    }
                ]
            },
            breathing: {
                // same here...
            }
        },

        submotes: []
    };

    return {
        world: world,

        init: function() {
            world.init();
        }
    };
}();






//   var colorWheel = function () {
//     var radius = 200;
//     var resolution = 111;
//     var step = Math.PI*2/resolution;

//     var hue = 0.0;
//     var saturation = 1.0;
//     var luminance = 0.5;

//     var draw = function (context) {
//       context.beginPath();
//       context.moveTo(radius, 0);

//       for(var ii = 0; ii < resolution; ii++) {
//         var wedge = ii*step;
// //        console.log(wedge);
//         context.fillStyle = vector_to_rgba([wedge, 0.5, luminance, 1]);
//         context.lineTo(Math.cos(wedge)*radius, Math.sin(wedge)*radius);
//       }

// //       context.fillStyle = vector_to_rgba([wedge, 0.0, luminance, 1.0]);
// //       context.lineTo(0, 0);
//       context.closePath();
//       context.fill();
//     }

//     var perceive = function (canvas) {

//     }

//     var adjust = function () {

//     }

//     return {
//       transform: 'screen',
//       perceive: perceive,
//       adjust: adjust,
//       draw: draw
//     }
//   }();

