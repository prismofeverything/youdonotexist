var shapemaker = function() {
  var shape_index = 0;

  var shape = flux.shape({
    color: [255, 255, 255, 255]
  });

  var mote = flux.mote({
    shapes: [shape]
  });

  var moteCursor = mote;
  var shapeCursor = shape;

  var world = flux.canvas({
    id: 'shapemaker',

    resize: function(browser, canvas) {
      canvas.width = browser.w - 500;
      canvas.height = browser.h;
    },

    down: function(mouse) {
      shapeCursor.addOp({op: 'line', to: mouse.pos});
    },
  });

  world.colorChange = function(color) {
    shapeCursor.updateColor(color);
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

