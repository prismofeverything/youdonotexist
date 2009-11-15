var shapemaker = function() {
  var shape_index = 0;

  var shape = flux.shape({
    color: [255, 255, 255, 255]
  });

  var mote = flux.mote({
    shapes: [shape]
  });

  var cursor = linkage.type({
    init: function(which, focus, collection, create) {
      this.which = which;
      this.focus = focus;

      this.collection = collection || function() {
        var col = []; 
        return function() {return col};
      };
    },

    stepCursor: function(step) {
      var collection = this.collection();
      var nextIndex = (collection.indexOf(this.focus) + step) % collection.length;

      this.focus = collection[nextIndex];
    },

    next: function() {
      this.stepCursor(1);
    },

    previous: function() {
      this.stepCursor(-1);
    },

    add: function(spec) {
      var newCursor = flux[this.which](spec);
      var collection = this.collection();
      var newIndex = collection.indexOf(this.focus);

      collection.splice(newIndex, 0, newCursor);
      this.focus = newCursor;

      return newCursor;
    },

    remove: function() {
      var collection = this.collection();
      var oldIndex = collection.indexOf(this.focus);

      return collection.splice(oldIndex, 1);
    }
  });

  var cursors = {
    mote: cursor('mote', mote, function() {
      return this.focus.supermote ? this.focus.supermote.motes : world.motes;
    }),

    shape: cursor('shape', shape, function() {return cursors.mote.focus.shapes}),
    op: cursor('op', null, function() {return cursors.shape.focus.ops})
  };

  // create world
  var world = flux.canvas({
    id: 'shapemaker',

    resize: function(browser, canvas) {
      canvas.width = browser.w - 500;
      canvas.height = browser.h;
    },

    down: function(mouse) {
      cursors.op.add({op: 'line', to: mouse.pos});
    },
  });

  world.colorChange = function(color) {
    cursors.shape.focus.updateColor(color);
  };

  world.addMote(mote);

  var start = function() {
    world.init();
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
    start: start
  };
}();






//   var colorWheel = function() {
//     var radius = 200;
//     var resolution = 111;
//     var step = Math.PI*2/resolution;

//     var hue = 0.0;
//     var saturation = 1.0;
//     var luminance = 0.5;

//     var draw = function(context) {
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

//     var perceive = function(canvas) {

//     }

//     var adjust = function() {

//     }

//     return {
//       transform: 'screen',
//       perceive: perceive,
//       adjust: adjust,
//       draw: draw
//     }
//   }();

