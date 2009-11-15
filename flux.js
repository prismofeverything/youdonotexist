var exists = function(value) {
  return !(value === null || value === undefined);
};

function rgbToHsl(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
}

Array.prototype.groupBy = function(iterator, context) {
  var result = {};
  this.each(function(value, index) {
    var key = iterator(value, index);
    if (!result[key]) result[key] = [];
    result[key].push(value);
  });
  return result;
}

var inversePi = 0.5 / (Math.PI);

var vector_to_rgba = function(v) {
  if (v) {
    var inner = v.map(function(component) {
      return Math.floor(component);
    }).join(', ');

    return 'rgba(' + inner + ')';
  } else {
    return '';
  }
};

// basic framework namespace
var flux = function() {
  var browser = {
    dim: function() {
      var w = arguments[0];
      var h = arguments[1];

      // if two arguments are provided, they represent width and height
      if (w && h) {
        this.w = w;
        this.h = h;
        this.dimension = [w, h];
        // if only one, it is a vector
      } else if (w) {
        this.w = w[0];
        this.h = w[1];
        this.dimension = w;
      }

      // if none (or any), simply return dimension
      return this.dimension;
    }
  }

  var range = linkage.type({
    init: function(low, high) {
      this.low = low;
      this.high = high;
    },

    between: function() {
      return this.high - this.low;
    },

    randomValue: function() {
      return Math.random()*this.between()+this.low;
    },

    union: function(other) {
      this.low = Math.min(this.low, other.low);
      this.high = Math.max(this.high, other.high);
    },

    include: function(value) {
      this.low = Math.min(this.low, value);
      this.high = Math.max(this.high, value);
    },

    translate: function(value) {
      this.low += value;
      this.high += value;
    },

    check: function(value) {
      return value >= this.low ? value <= this.high ? 0 : 1 : -1
    }
  });

  // very much a two-dimensional object
  var bounds = linkage.type({
    init: function(xlow, xhigh, ylow, yhigh) {
      this.x = range(xlow, xhigh);
      this.y = range(ylow, yhigh);
    },

    copy: function() {
      return bounds(this.x.low, this.x.high, this.y.low, this.y.high);
    },

    width: function() {
      return this.x.between();
    },

    height: function() {
      return this.y.between();
    },

    randomPoint: function() {
      return [this.x.randomValue(), this.y.randomValue()];
    },

    // unions with another bounds object
    union: function(other) {
      this.x.union(other.x);
      this.y.union(other.y);
    },

    // grows to ensure it encloses the given point
    include: function(point) {
      this.x.include(point[0]);
      this.y.include(point[1]);
    },

    // shifts the entire object by the given vector
    translate: function(point) {
      this.x.translate(point[0]);
      this.y.translate(point[1]);
    },

    // check whether the given point is within these bound,
    // returning a list of comparision values by axis
    check: function(point) {
      return [this.x.check(point[0]), this.y.check(point[1])];
    },

    // check whether the given point is within these bound,
    // returning a boolean
    inside: function(point) {
      return this.x.check(point[0]) === 0 && this.y.check(point[1]) === 0;
    },

    shapeFor: function() {
      return shape({ops: [
        {op: 'move', to: [this.x.low, this.y.low]},
        {op: 'line', to: [this.x.high, this.y.low]},
        {op: 'line', to: [this.x.high, this.y.high]},
        {op: 'line', to: [this.x.low, this.y.high]}
      ]});
    },

    scale: function(factor) {
      var w = this.width();
      var h = this.height();
      var wfactor = (w*factor-w)*0.5;
      var hfactor = (h*factor-h)*0.5;

      return bounds(
        this.x.low - wfactor, 
        this.x.high + wfactor, 
        this.y.low - hfactor, 
        this.y.high + hfactor
      );
    }
  });

  var op = function() {
    var uberbase = linkage.type({
      init: function(spec) {
        this.method = 'base';
        this.op = spec.op;
        this.to = spec.to ? spec.to.clone() : [0, 0];
      },

      args: function() {
        return this.to;
      },

      prod: function(box) {
        box.include(this.to);
      },

      clone: function() {
        return base(this);
      },

      between: function(other, ticks) {
        return [tweenV({
          obj: this,
          property: 'to',
          to: other.to,
          ticks: ticks
        })];
      }
    });

    var base = linkage.type([uberbase], {
      init: function(spec) {
        arguments.callee.uber.call(this, spec);
        this.animal = 'mockingbird';
      }
    });

    var line = linkage.type([base], {
      init: function(spec) {
        arguments.callee.uber.call(this, spec);
        this.method = 'lineTo';
      },
      clone: function() {
        return line(this);
      }
    });

    var move = linkage.type([base], {
      init: function(spec) {
        arguments.callee.uber.call(this, spec);
        this.method = 'moveTo';
      },
      clone: function() {
        return move(this);
      }
    });

    var text = linkage.type([base], {
      init: function(spec) {
        arguments.callee.uber.call(this, spec);
        this.method = 'opText';

        this.size = spec.size || 12;
        this.string = spec.string || '';
      },

      clone: function() {
        return text(this);
      },

      args: function() {
        return [true, this.size, this.to[0], this.to[1], this.string];
      },

      prod: function(box) {
        var renderLength = function(string) {
          return CanvasTextFunctions.measure(true, this.size, string);
        };

        // find the longest line to use as the outermost horizontal boundary
        var lines = this.string.split('\n');
        var longest = {length: renderLength(lines[0]), line: lines[0]};
        for (var index = 1; index < lines.length; index++) {
          var possible = renderLength(line[index]);
          if (possible > longest.length) {
            longest = {length: possible, line: line[index]};
          }
        }

        box.union(bounds(
          this.to[0],
          this.to[0] + longest.length,
          this.to[1] - this.size,
          this.to[1] + this.size*lines.length
        ));
      }
    });

    var arc = linkage.type([base], {
      init: function(spec) {
        arguments.callee.uber.call(this, spec);
        this.method = 'arc';

        this.radius = spec.radius || 10;
        this.arc = spec.arc || [0, Math.PI*2];
        this.clockwise = spec.clockwise || true;
      },

      args: function() {
        return this.to.concat([this.radius].concat(this.arc).push(this.clockwise));
      },

      between: function(other, ticks) {
        return [
          tweenV({obj: this,
                       property: 'to',
                       to: other.to,
                       ticks: ticks}),
          tweenN({obj: this,
                       property: 'radius',
                       to: other.radius,
                       ticks: ticks}),
          tweenN({obj: this,
                       property: 'arc',
                       to: other.arc,
                       ticks: ticks})
        ];
      },

      prod: function(box) {
        box.union(bounds(
          this.to[0] - this.radius,
          this.to[0] + this.radius,
          this.to[1] - this.radius,
          this.to[1] + this.radius
        ));
      },

      clone: function() {
        return arc(this);
      }
    });

    var bezier = linkage.type([base], {
      init: function(spec) {
        arguments.callee.uber.call(this, spec);
        this.method = 'bezierCurveTo';

        this.control1 = spec.control1 ? spec.control1.clone() : [0, 0];
        this.control2 = spec.control2 ? spec.control2.clone() : [0, 0];
      },

      args: function() {
        return this.control1.concat(this.control2).concat(this.to);
      },

      prod: function(box) {
        box.include(this.to);
        box.include(this.control1);
        box.include(this.control2);
      },

      between: function(other, ticks) {
        return [
          tweenV({
            obj: this,
            property: 'to',
            to: other.to,
            ticks: ticks}),
          tweenV({
            obj: this,
            property: 'control1',
            to: other.control1,
            ticks: ticks}),
          tweenV({
            obj: this,
            property: 'control2',
            to: other.control2,
            ticks: ticks})
        ];
      },

      clone: function() {
        return bezier(this);
      }
    });

    var opmap = {
      base: base,
      line: line,
      move: move,
      text: text,
      arc: arc,
      bezier: bezier
    }

    return function(pp) {
      return opmap[pp.op](pp);
    };
  }();

  // provide objects to represent atomic drawing operations
  var shape = linkage.type({
    init: function(spec) {
      spec = spec || {};

      this.ops = spec.ops ? spec.ops.map(op) : [] || [];
      this.color = spec.color;
      this.fill = spec.fill || 'fill';
      this.box = this.boxFor();
    },

    between: function(other, ticks, posttick) {
      return this.ops.inject([], function(tweens, op, index) {
        return tweens.concat(op.between(other.ops[index], ticks));
      });
    },

    clone: function() {
      return shape({ops: this.ops.map(function(vertex) {return vertex.clone();})});
    },

    // construct a simple bounding box to tell if further bounds checking is necessary
    boxFor: function() {
      var box = bounds(0, 0, 0, 0);
      this.ops.each(function(vertex) {
        vertex.prod(box);
      });
      return box;
    },

    addOp: function(newop) {
      this.ops.push(op(newop));
      console.log(this.ops.map(function(o) {return o.to.toString()}));
    },

    updateColor: function(newcolor) {
      for (var ee = 0; ee < this.color.length; ee++) {
        if (!(newcolor[ee] === undefined) && !(newcolor[ee] === null)) {
          this.color[ee] = newcolor[ee];
        }
      }
    },

    draw: function(context) {
      context.beginPath();
      if (this.color) { context[this.fill+'Style'] = vector_to_rgba(this.color) };

      this.ops.each(function(vertex) {
        try {
          context[vertex.method].apply(context, vertex.args());
        } catch(err) {
          console.log(vertex.method);
          console.log(vertex.args());
        }
      });

      context.closePath();
      context[this.fill]();
    }
  });

  // generic base tween object
  var tween = linkage.type({
    init: function(spec) {
      this.obj = spec.obj || spec;
      this.property = spec.property || ((spec.property === 0) ? spec.property : 'this');

      if (spec.target) {this.target = spec.target};
      if (spec.step) {this.step = spec.step};
    },

    value: function() {
      return this.obj[this.property];
    },

    tick: function() {
      if (this.target(this.value())) {
        return false;
      } else {
        this.obj[this.property] = this.step(this.value());
        return true;
      }
    },

    target: function(value) {return value === 0},
    step: function(value) {return value - 1}
  });

  // tween object for numbers
  var tweenN = linkage.type([tween], {
    init: function(spec) {
      arguments.callee.uber.call(this, spec);
      this.increment = spec.increment || (spec.ticks ? ((spec.to - spec.obj[spec.property]) / spec.ticks) : 1);
      this.to = spec.to || 0;
      this.test = spec.test || ((this.value() < this.to) ? this.greater : this.less);

      if (spec.target) {this.target = spec.target};
      if (spec.step) {this.step = spec.step};
    },

    greater: function(where, to) {return where >= to;},
    less: function(where, to) {return where <= to;},

    target: function(value) {
        return this.test(value, this.to);
    },

    step: function(value) {
      return value + this.increment;
    }
  });

  // tween object for vectors
  var tweenV = linkage.type([tween], {
    init: function(spec) {
      arguments.callee.uber.call(this, spec);

      this.obj = spec.obj || spec;
      this.property = spec.property || 'this';
      this.to = spec.to || [1, 1];
      this.ticks = spec.ticks || 10;

      if (spec.posttick) {this.posttick = spec.posttick};
      if (spec.posttween) {this.posttween = spec.posttween};

      var vector = this.vector(); 
      var p, len = vector.length, differing = [];
      for (p = 0; p < len; p++) {
        if (vector[p] !== this.to[p]) {
          differing.push(tweenN({
            obj: vector,
            property: p,
            to: this.to[p],
            ticks: this.ticks
          }));
        }
      }

      this.tweens = differing;
    },

    posttick: function() {},
    posttween: function() {},

    vector: function() {
      return this.obj[this.property];
    },

    tick: function() {
      this.tweens = this.tweens.select(function(tween) {return tween.tick();});
      this.posttick();

      if (this.tweens.length === 0) {
        this.posttween();
      }

      return this.tweens.length > 0;
    }
  });

  // place a onetime event sometime in the future
  var tweenEvent = linkage.type([tween], {
    init: function(spec) {
      spec = linkage.extend({obj: {count: 0}, property: 'count'}, spec);
      argument.callee.uber.call(this, spec);

      this.ticks = spec.ticks || 10;
      if (spec.event) {this.event = spec.event};
    },

    event: function() {},

    target: function(n) {
      var met = true;

      if (n < this.ticks) {
        met = false;
      } else {
        this.event();
      }

      return met;
    },

    step: function(n) {
      return n += 1;
    }
  });

  // representation of individual agents
  var mote = linkage.type({
    init: function(spec) {
      spec = spec || {};

      this.type = spec.type || 'mote';
      this.supermote = spec.supermote || null;
      this.submotes = spec.submotes || [];

      this.pos = spec.pos || [0, 0];
      this.shape = spec.shape || shape(); 
      this.scale = spec.scale || [1, 1];
      this.orientation = (spec.orientation === undefined) ? 0 : spec.orientation;
      this.rotation = (spec.rotation === undefined) ? 0 : spec.rotation;
      this.velocity = spec.velocity || [0, 0];

      this.shapes = spec.shapes || [this.shape];
      this.visible = spec.visible === undefined ? true : spec.visible;

      this.color = spec.color || [200, 200, 200, 1];
      this.fill = spec.fill || 'fill';
      this.lineWidth = spec.lineWidth || 1;
      this.outline = spec.outline || null;
      this.bounds = spec.bounds;
      this.transform = spec.transform || 'pos';
      this.paused = false;

      this.tweens = [];

      this.future = [];
      this.neighbors = [];

      this.absolute = linkage.cache(this, this.find_absolute);
      this.absolute.expiring = function() {
        this.submotes.each(function(submote) {
          submote.absolute.expire();
        });
      };

      this.color_spec = linkage.cache(this, this.findColorSpec('color'));
      this.outline_spec = linkage.cache(this, this.findColorSpec('outline'));

      this.supermotes = linkage.cache(this, this.find_supermotes);

      if (spec.perceive) {this.perceive = spec.perceive};
      if (spec.adjust) {this.adjust = spec.adjust};
      this.findBox();
    },

    mouseDown: function(mouse) {},
    mouseUp: function(mouse) {},
    mouseClick: function(mouse) {},
    mouseIn: function(mouse) {},
    mouseOut: function(mouse) {},
    mouseMove: function(mouse) {},

    // absolute is a function to find the absolute position of the mote
    // with the position, orientation and scale each supermote in this mote's
    // heirarchy of supermotes taken into consideration.

    // rise takes a position and recursively applies the transformations of
    // all supermotes onto it
    rise: function(pos) {
      pos = this.transform === 'screen' ? pos.add(this.pos.times(browser.dim())) : pos;
      return this.supermote ? this.supermote.rise(this.supermote.extrovert(pos)) : pos;
    },

    // find_absolute is for the cache, so that the absolute position does not
    // need to be calculated every time it is accessed, only when the
    // position or orientation of it or one of its supermotes is changed.
    find_absolute: function() {
      return this.rise(this.pos);
    },

    contains: function(point) {
      return this.box.inside(point.subtract(this.absolute()));
    },

    // construct a simple bounding box to tell if further bounds checking is necessary
    findBox: function() {
      var box = bounds(0, 0, 0, 0);

      box = this.shapes.inject(box, function(grow, shape) {
        grow.union(shape.box);
        return grow;
      });

      this.submotes.each(function(submote) {
        box.union(submote.box);
      });

      this.box = box;
      return box;
    },

    findIn: function(mouse, pos) {
      if (this.contains(pos) && !mouse.inside.include(this)) {
        mouse.inside.push(this);
        this.mouseIn(mouse);
      }

      this.submotes.invoke('findIn', mouse, pos);
    },

    findColorSpec: function(prop) {
      return function() {return vector_to_rgba(this[prop]);};
    },

    tweenColor: function(color, ticks, posttween) {
      posttween = posttween || function() {};
      var that = this;

      this.tweens.push(tweenV({
        obj: this,
        property: 'color',
        to: color,
        ticks: ticks,
        posttick: function() {that.color_spec.expire();},
        posttween: posttween
      }));

      return this;
    },

    tweenPos: function(to, ticks, posttween) {
      var that = this;
      that.tweens.push(tweenV({
        obj: that,
        property: 'pos',
        to: to,
        ticks: ticks,
        posttick: function() {that.absolute.expire();},
        posttween: posttween
      }));

      return this;
    },

    tweenOrientation: function(orientation, ticks, posttween) {
      this.tweens.push(tweenN({
        obj: this,
        property: 'orientation',
        to: orientation,
        ticks: ticks,
        posttween: posttween
      }));

      return this;
    },

    tweenScale: function(scale, ticks) {
      this.tweens.push(tweenV({
        obj: this,
        property: 'scale',
        to: scale,
        ticks: ticks
      }));

      return this;
    },

    tweenShape: function(shape, ticks) {
      var tween = this.shape.between(shape, ticks);
      this.tweens = this.tweens.concat(tween);

      return this;
    },

    tweenEvent: function(event, ticks) {
      var tween = tweenEvent({event: event, ticks: ticks});
      this.tweens = this.tweens.concat(tween);

      return this;
    },

    expireSupermotes: function() {
      this.supermotes.expire();
      this.absolute.expire();
      this.submotes.each(function(submote) {
        submote.expireSupermotes();
      });
    },

    attach: function(other) {
      other.orientation -= this.orientation;
      if (other.supermote) {
        other.supermote.submotes = other.supermote.submotes.without(other);
      }
      this.submotes.push(other);

      other.supermote = this;
      other.expireSupermotes();
    },

    detach: function(other) {
      this.submotes = this.submotes.without(other);

      // other.pos = other.supermote.extrovert(other.pos);
      other.orientation += this.orientation;
      other.supermote = null;

      if (this.supermote) {
        // other.pos = this.supermote.extrovert(other.pos);
        this.supermote.attach(other);
      }

      other.absolute.expire();
    },

    addSubmotes: function(submotes) {
      var q, len = submotes.length;
      for (q = 0; q < len; q++) {
        this.attach(submotes[q]);
      }
    },

    introvert: function(pos) {
      return pos.times(this.scale.map(function(el) {return 1.0 / el;})).rotate(-this.orientation, this.pos).subtract(this.pos);
    },

    extrovert: function(pos) {
      //        var transform = this.transform === 'screen' ? pos.add(this.pos.times(browser.dim())) : pos.add(this.pos);
      var transform = pos.add(this.pos);
      return transform.rotate(this.orientation, this.pos).times(this.scale);
    },

    find_supermotes: function() {
      return (this.supermote === null) ? [] : this.supermote.supermotes().slice().push(this.supermote);
    },

    commonSupermote: function(other) {
      if (this.supermote === null || other.supermote === null) {
        return null;
      }

      var n = this.supermotes().length - 1;
      var common = null;
      var down = -1;
      var possible = null;

      while (!common && n >= 0) {
        possible = this.supermotes()[n];
        down = other.supermotes().indexOf(possible);

        if (down >= 0) {
          common = possible;
        } else {
          n -= 1;
        }
      }

      return {
        common: common,
        up: this.supermotes().length - 1 - n,
        down: down === -1 ? other.supermotes().length : other.supermotes().length - 1 - down
      };
    },

    relativePos: function(other) {
      if (this.supermote === other.supermote) {
        return other.pos;
      }

      var common = this.commonSupermote(other);
      var transformed = other.pos;

      for (var extro = 0; extro < common.down; extro++) {
        transformed = other.supermotes()[(other.supermotes().length - 1) - extro].extrovert(transformed);
      }

      for (var intro = 0; intro < common.up; intro++) {
        transformed = this.supermotes()[(this.supermotes().length - common.up) + intro].introvert(transformed);
      }

      return transformed;
    },

    distance: function(other) {
      return this.absolute().distanceFrom(other.absolute());
    },

    to: function(other) {
      return other.absolute().subtract(this.absolute());
    },

    angleFrom: function(other) {
      return this.pos.angleFrom(other.pos);
    },

    // this finds the closest mote from a list of possible motes.
    // a predicate can be provided to filter out choices.
    findClosest: function(others, predicate) {
      var closestMote;
      var closestDistance;

      predicate = predicate || function() {return true};

      var q, other, len = others.length;
      for (q = 0; q < len; q++) {
        other = others[q];

        if (predicate(other)) {
          if (closestMote === null) {
            closestMote = other;
            closestDistance = this.distance(other);
          } else {
            var newDistance = this.distance(other);
            if (newDistance < closestDistance) {
              closestMote = other;
              closestDistance = newDistance;
            }
          }
        }
      };

      return closestMote;
    },

    pause: function() {
      this.paused = true;
    },

    unpause: function() {
      this.paused = false;
    },

    perceive: function(env) {
      this.submotes.each(function(submote) {
        submote.perceive(env);
      });
    },

    adjust: function() {
      if (!this.paused) {
        this.orientation += this.rotation;

        while (this.orientation > Math.PI) {
          this.orientation -= Math.PI*2;
        } while (this.orientation < -Math.PI) {
          this.orientation += Math.PI*2;
        }

        var dim, len = this.pos.length;
        for (dim = 0; dim < len; dim++) {
          this.pos[dim] += this.velocity[dim];
        }

        len = this.future.length;
        for (dim = 0; dim < len; dim++) {
          this.future[dim](this);
        };
        this.future = [];
      }

      this.tweens = this.tweens.select(function(tween) {
        return tween.tick();
      });

      this.submotes.invoke('adjust');
      this.absolute.expire();

      // ----------- lazy bounds checking ---------------
      if (this.bounds) {
        var check = this.bounds.check(this.pos);

        len = check.length
        for (dim = 0; dim < len; dim++) {
          if (!(check[dim] === 0)) {
            this.velocity[dim] = -this.velocity[dim];
          }
        };
      }
      // -------------------------------------------------

    },

    drawShape: function(context, fill) {
      context.beginPath();

      this.shape.ops.each(function(vertex) {
        context[vertex.method].apply(context, vertex.args());
      });

      context.closePath();
      context[fill]();
    },

    draw: function(context) {
      // drawing lines to neighbors
      if (this.visible && this.neighbors.length > 1) {
        context.save();

        var q, len = this.neighbors.length;
        for (q = 0; q < len; q++) {
          context.lineWidth = 3;
          context.strokeStyle = this.color_spec();
          context.beginPath();
          context.moveTo.apply(context, this.pos);
          context.lineTo.apply(context, this.relativePos(this.neighbors[q]));
          context.closePath();
          context.stroke();
        };

        context.restore();
      }

      // drawing the shape
      context.save();

      context[this.fill + 'Style'] = this.color_spec();
      context.lineWidth = this.lineWidth;

      if (this.transform === 'screen') {
        context.translate(Math.floor(this.pos[0]*browser.w), Math.floor(this.pos[1]*browser.h));
      } else {
        context.translate.apply(context, this.pos);
      }

      context.rotate(this.orientation);
      context.scale.apply(context, this.scale);

      if (this.visible) {
        var q, len = this.shapes.length;
        for (q = 0; q < len; q++){
          this.shapes[q].draw(context);
        }

        if (this.outline) {
          context.save();
          context.strokeStyle = this.outline_spec();
          this.drawShape(context, 'stroke');
          context.restore();
        }
      }

      this.submotes.invoke('draw', context);

      context.restore();
    }
  });

  // managing the canvas for all motes
  var canvas = function(spec) {
    var that = {};

    var width = spec.width;
    var height = spec.height;

    var canvas, context;
    var now, before, interval;

    that.motes = spec.motes || [];
    that.id = spec.id || '';

    that.transforms = that.motes.groupBy(function(mote) {
      return mote.transform;
    });

    that.down = spec.down || function(m){return null;};
    that.up = spec.up || function(m){return null;};
    that.move = spec.move || function(m){return null;};

    that.translation = spec.translation || [0, 0];
    that.orientation = spec.orientation || 0;
    that.scale = spec.scale || [1, 1];

    that.tweens = [];

    that.predraw = spec.predraw || function(context) {};
    that.postdraw = spec.postdraw || function(context) {};

    that.resize = spec.resize || function(browser, canvas) {
      canvas.width = width || browser.w;
      canvas.height = height || browser.h;
    };

    that.wheel = spec.wheel || function(delta) {};
    that.preventKeys = spec.preventKeys || false;

    var time = function() {
      return new Date().getTime();
    };

    that.triangulate = function() {

    };

    var keys = {};

    keys.pressed = {};
    keys.predown = function(key) {
      keys.pressed[key] = true;
      keys.down(that, key);
    };
    keys.preup = function(key) {
      delete this.pressed[key];
      keys.up(that, key);
    };

    keys.down = spec.keyDown || function(th, key) {};
    keys.up = spec.keyUp || function(th, key) {};

    var mouse = {
      pos: [0, 0],
      prevpos: [0, 0],

      screen: [0, 0],
      prevscreen: [0, 0],

      down: false,
      inside: [],

      diffpos: function() {
        return this.pos.subtract(this.prevpos);
      },

      diffscreen: function() {
        return this.screen.subtract(this.prevscreen);
      },

      posify: function(where) {
        return where.subtract(that.translation).times(that.scale.map(function(el) {return 1.0 / el;}));
      },

      deposify: function(where) {
        return where.times(that.scale).add(that.translation);
      }
    };

    that.addMote = function(mote) {
      if (!that.transforms[mote.transform]) that.transforms[mote.transform] = [];

      that.transforms[mote.transform].push(mote);
      that.motes.push(mote);
    };

    that.removeMote = function(mote) {
      that.transforms[mote.transform] = that.transforms[mote.transform].without(mote);
      that.motes = that.motes.without(mote);
    };

    that.tweenScale = function(scale, ticks) {
      var tween = tweenV({
        obj: that,
        property: 'scale',
        to: scale,
        ticks: ticks
      });

      that.tweens.push(tween);
      return that;
    };

    that.tweenTranslation = function(translation, ticks) {
      var tween = tweenV({
        obj: that,
        property: 'translation',
        to: translation,
        ticks: ticks
      });

      that.tweens.push(tween);
      return that;
    };

    that.tweenViewport = function(spec, ticks) {
      if (spec.scale) that.tweenScale(spec.scale, ticks);
      if (spec.translation) that.tweenTranslation(spec.translation, ticks);
    };

    var update = function() {
      before = now;
      now = time();
      interval = now - before;

      that.motes.invoke('perceive', that);
      that.motes.invoke('adjust');

      that.tweens = that.tweens.select(function(tween) {
        return tween.tick();
      });

      draw();
    };

    var draw = function() {
      context.clearRect(0, 0, browser.w, browser.h);
      that.predraw(context);

//       var q, len = that.motes.length;
//       for (q = 0; q < len; q++) {
      if (that.transforms['pos']) {
        context.save();
        context.translate(that.translation[0], that.translation[1]);
        context.scale(that.scale[0], that.scale[1]);
        context.rotate(that.orientation);

        that.transforms['pos'].invoke('draw', context);

        context.restore();
      }

      if (that.transforms['screen']) {
        context.save();

        that.transforms['screen'].invoke('draw', context);

        context.restore();
      }

      that.postdraw(context);
    };

    var mouseEvent = function(event, mouse) {
      mouse.inside.each(function(mote) {
        mote['mouse'+event](mouse);
      });

      return that;
    };

    var mouseDown = function(e) {
      mouse.down = true;
      mouseEvent('Down', mouse);

      that.down(mouse);
    };

    var mouseUp = function(e) {
      mouse.down = false;
      mouseEvent('Up', mouse);

      that.up(mouse);
    };

    var mouseClick = function(e) {
      mouseEvent('Click', mouse);
    };

    var mouseMove = function(e) {
      var scrollX = window.scrollX != null ? window.scrollX : window.pageXOffset;
      var scrollY = window.scrollY != null ? window.scrollY : window.pageYOffset;

      var x = (e.clientX - canvas.offsetLeft + scrollX);
      var y = (e.clientY - canvas.offsetTop + scrollY);

      mouse.prevscreen = mouse.screen;
      mouse.screen = [x, y];

      mouse.prevpos = mouse.pos;
      mouse.pos = mouse.posify(mouse.screen);

      // sort out which motes are no longer under the mouse
      // and which still contain it
      if (mouse.inside.length > 0) {
        var motion = mouse.inside.partition(function(mote) {
          return mote.contains(mouse[mote.transform]);
        });

        mouse.inside = motion[0];
        mouse.inside.each(function(mote) {
          mote.mouseMove(mouse);
        });
        motion[1].each(function(mote) {
          mote.mouseOut(mouse);
        });
      }

      // find out which motes are newly under the mouse
      that.motes.each(function(mote) {
        mote.findIn(mouse, mouse[mote.transform]);
      });

      // call custom mouse move function, if one is defined
      that.move(mouse);
    };

    // parse the mouse wheel event and call wheel with a useful value
    var readDeltas = function(e) {
      var delta = 0;
      if (!e) {
        e = window.event;
      }
      if (e.wheelDelta) {
        delta = e.wheelDelta/120;
      } else if (e.detail) {
        delta = -e.detail/3;
      }
      if (delta) {
        that.wheel(that, delta);
      }
      if (e.preventDefault) {
        e.preventDefault();
      }

      e.returnValue = false;
    };

    var keyDown = function(e) {
      keys.predown(e.keyCode);

      if (that.preventKeys) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        return false;
      }

      return true;
    };

    var keyUp = function(e) {
      keys.preup(e.keyCode);

      if (that.preventKeys) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        return false;
      }

      return true;
    };

    // zoom keeping the current mouse position fixed.
    // works by finding the vector from the mouse position to the top left corner,
    // then scaling it to the new zoom factor.
    that.zoom = function(factor) {
      var buffer = mouse.pos.subtract(mouse.posify([0, 0])).multiply(1.0/factor);

      that.scale = that.scale.multiply(factor);
      that.translation = that.translation.subtract(mouse.deposify(mouse.pos.subtract(buffer)));
    };

    that.init = function() {
      // resize
      var resize = function(e) {
        browser.dim(window.innerWidth, window.innerHeight);

        that.resize(browser, canvas);
      };
      window.onresize = resize;

      // mouse wheel
      if (window.addEventListener) {
        window.addEventListener('DOMMouseScroll', readDeltas, false);
      }
      window.onmousewheel = document.onmousewheel = readDeltas;

      // canvas
      canvas = document.getElementById ? document.getElementById(spec.id) : null;
      if (!canvas || !canvas.getContext) {
        return;
      }
      context = canvas.getContext('2d');
      CanvasTextFunctions.enable(context);

      // mouse events
      canvas.addEventListener('mousedown', mouseDown, false);
      canvas.addEventListener('mouseup', mouseUp, false);
      canvas.addEventListener('click', mouseClick, false);
      canvas.addEventListener('mousemove', mouseMove, false);

      // key events
      window.addEventListener('keydown', keyDown, false);
      window.addEventListener('keyup', keyUp, false);

      // set initial sizes
      resize();

      // provide a reference to the actual canvas object
      that.canvas = canvas;

      context.strokeStyle = 'rgba(0, 0, 0, 1)';
      context.lineWidth = 5;

      // timer
      setInterval(update, 20);
    };

    return that;
  };

  return {
    browser: browser, 
    range: range,
    bounds: bounds, 
    op: op,
    shape: shape,
    tween: tween,
    tweenN: tweenN,
    tweenV: tweenV,
    tweenEvent: tweenEvent,
    mote: mote,
    canvas: canvas
  };
}();


//  that.shape = spec.shape || [[-20, 0], [20, 20], [30, -10], [-20, -20]];
//  that.shape = spec.shape || [[0, 0], [100, 10], [200, -10]];
