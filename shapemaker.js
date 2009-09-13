var shapemaker = function() {
  var shape_index = 0;

  var mote = flux.mote({
    shapes: [flux.shape()],
    
  });
  var world = flux.canvas({
    id: 'shapemaker',

    resize: function(browser, canvas) {
      canvas.width = browser.w - 500;
      canvas.height = browser.h;
    }
  });

  var start = function() {
    world.init();
  }

  return {
    start: start
  }
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

