// var square = function(n) { return n * n };
// var lawOfCosines = function(a, b, c) {
//   num = square(b) + square(c) - square(a);
//   den = 2 * b * c;

//   return (den == 0) ? 0 : (Math.acos(num / den) - (Math.PI / 2));
// };

// // P for Position
// var P = Class.create({
//   initialize: function(x, y) {
//     this.x = x;
//     this.y = y;
//   },

//   toString: function() {
//     return '' + this.x + '|' + this.y;
//   },

//   add: function(pos) {
//     this.x += pos.x;
//     this.y += pos.y;

//     return this;
//   },

//   copy: function() {
//     return new P(this.x, this.y);
//   },

//   invert: function(pos) {
//     this.x = -this.x;
//     this.y = -this.y;

//     return this;
//   },

//   sum: function(pos) {
//     return new P(this.x + pos.x, this.y + pos.y);
//   },

//   difference: function(pos) {
//     return new P(this.x - pos.x, this.y - pos.y);
//   },
  
//   inverse: function(pos) {
//     return new P(-this.x, -this.y);
//   }, 

//   perpendicular: function() { 
//     return new P(-this.y, this.x);
//   },

//   distance: function(pos) {
//     return Math.abs( Math.sqrt( square(this.x - pos.x) + square(this.y - pos.y) ) );
//   },

//   normalize: function() {
//     distance = this.distance(new P(0, 0));

//     if (distance == 0) {
//     } else {
//       this.x /= distance;
//       this.y /= distance;
//     }
//     return this;
//   },

//   scale: function(factor) {
//     this.x *= factor;
//     this.y *= factor;

//     return this;
//   },

//   applyTo: function(element) {
//     element.style.left = '' + this.x + 'px';
//     element.style.top = '' + this.y + 'px';

//     return this;
//   }
// });

// // M for Modulo
// var M = Class.create({
//   initialize: function(base, value) {
//     this.base = base;
//     this.value = value;

//     return this.modulate();
//   },

//   modulate: function() {
//     if (this.value < 0 || this.value > this.base) {
//       this.value %= this.base;
//     }

//     return this;
//   }
// });

// var Evader = Class.create({
//   initialize: function(element, over, out) {
//     this.element = $(element);
//     this.over = over
//     this.out = out

//     this.origin = new P(500, 300);
//     this.threshhold = 100;
//     this.spriteliness = 2000.0;
//     this.intervalFactor = 100;
//     this.approachFactor = 1000;

//     this.now = new P(0, 0);
//     this.before = new P(0, 0);
//     this.motion = new P(0, 0);
//     this.offset = new P(-25, -20);
//     this.approached = false;
//     this.accepted = false;
//     this.rejected = false;

//     this.evading = new P(0, 0);
//     this.applyMotion(this.origin);

//     document.observe('mousemove', this.track.bindAsEventListener(this));
//     this.element.observe('mouseover', this.accept.bindAsEventListener(this))
//     this.element.observe('mouseout', this.reject.bindAsEventListener(this))
//   },

//   applyMotion: function() {
//     this.orient();
//     this.evade();

//     this.origin.applyTo(this.element);
//   },

//   orient: function() {
//     this.direction = this.origin.difference(this.now);
//     this.distance = this.origin.distance(this.now);
//     this.motion = this.now.difference(this.before);
//   },

//   track: function(event) {
//     this.before = this.now;
//     this.now = new P(event.pageX, event.pageY).sum(this.offset);
//     this.applyMotion();
//   },

//   accept: function(event) {
//     if (!this.rejected) {
//       this.over();
//       this.accepted = true;
//     }
//   },

//   reject: function(event) {
//     this.out();
//     this.rejected = true;
//     this.element.addClassName('nothingness');
//   },

//   decide: function() {
//     this.decided = true;
//     self = this;
//     this.interval = setInterval(function(){self.approach();}, self.intervalFactor);
//   },

//   approach: function() {
//     if(this.distance > 5 && !this.accepted) {
//       this.orient();
//       factor = this.approachFactor * (1.0 / (this.distance + 1.0));
//       this.origin.add(this.direction.inverse().normalize().scale(factor));
//       this.origin.applyTo(this.element);
//     }
//   },

//   clear: function() {
//     if(this.decided) {this.decided = false;};
//     if(this.timeout != null) {
//       clearTimeout(this.timeout);
//       this.timeout = null;
//     }
//     if(this.interval != null) {
//       clearInterval(this.interval);
//       this.interval = null;
//     }
//   },

//   evade: function() {
//     this.clear();

//     if(!this.rejected) {
//       if (this.distance < this.threshhold) {
//         if(this.approached == false) {
//           this.approached = true;
//         }

//         this.perpendicular = this.direction.perpendicular().normalize();
//         if (this.angle < 0) {
//           this.perpendicular.invert();
//         }

// //        this.factor = (this.distance == 0) ? 1 : (this.spriteliness / this.distance)
//         this.factor = ((this.spriteliness * 100) / square(this.distance));
//         this.force = this.direction.copy().normalize().scale(this.factor);
//         this.origin.add(this.force);
//       }

//       if(this.approached) {
//         self = this;
//         this.timeout = setTimeout(function(){self.decide();}, 5000);
//       }
//     }
//   }
// });

var statementOver = function(element) {
  this.element.style.color = "#cb9";
  this.element.href = "/statement/";
  this.element.update("You Do Not Exist");
};

var statementOut = function(element) {
  this.element.style.color = '#aa7755';
  this.element.href = '#';
  this.element.update("nothingness");
};







//    this.mousequeue = $R(0, 2).map(function(z) { return new P(0, 0) });

//     surge = this.now.difference(this.mousequeue.last());
//     this.mousequeue.push(this.now);
//     trace = this.mousequeue.shift();
//     trail = trace.difference(this.mousequeue.first())

//     this.motion.add(surge);
//     this.motion.add(trail);

//       forward = this.motion.sum(this.now);
//       this.angle = lawOfCosines(this.origin.distance(forward), this.now.distance(forward), this.distance)

//       this.factor = (this.distance == 0) ? 1 : (this.spriteliness / this.distance)
//       this.force = this.perpendicular.scale(this.factor);

