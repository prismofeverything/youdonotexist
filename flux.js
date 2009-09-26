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

  var range = defineClass({
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
  var bounds = defineClass({
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

      return bounds(this.x.low - wfactor, this.x.high + wfactor, this.y.low - hfactor, this.y.high + hfactor);
    }
  });

  var op = function() {
    var base = function(spec) {
      var that = {};

      that.op = spec.op;
      that.method = spec.method || 'lineTo';
      that.to = spec.to ? [spec.to[0], spec.to[1]] : [0, 0];

      that.args = function() {
        return that.to;
      };

      that.prod = function(box) {
        box.include(that.to);
      };

      that.clone = function() {
        return base(that);
      };

      that.between = function(other, cycles) {
        return [tweenV({
          obj: that,
          property: 'to',
          to: other.to,
          cycles: cycles
        })];
      };

      return that;
    };

    var line = function(spec) {
      spec.method = 'lineTo';

      var that = base(spec);

      that.clone = function() {
        return line(that);
      };

      return that;
    };

    var move = function(spec) {
      spec.method = 'moveTo';

      var that = base(spec);

      that.clone = function() {
        return move(that);
      };

      return that;
    };

    var text = function(spec) {
      spec.method = 'opText';
      var that = base(spec);

      that.size = spec.size || 12;
      that.string = spec.string || '';

      that.clone = function() {
        return text(that);
      };

      that.args = function() {
        return [true, that.size, that.to[0], that.to[1], that.string];
      };

      that.prod = function(box) {
        var renderLength = function(string) {
          return CanvasTextFunctions.measure(true, that.size, string);
        };

        // find the longest line to use as the outermost horizontal boundary
        var lines = that.string.split('\n');
        var longest = {length: renderLength(lines[0]), line: lines[0]};
        for (var index=1; index < lines.length; index++) {
          var possible = renderLength(line[index]);
          if (possible > longest.length) {
            longest = {length: possible, line: line[index]};
          }
        }

        box.union(bounds(
          that.to[0],
          that.to[0] + longest.length,
          that.to[1] - that.size,
          that.to[1] + that.size*lines.length
        ));
      };

      return that;
    };

    var arc = function(spec) {
      spec.method = 'arc';

      var that = base(spec);

      that.radius = spec.radius || 10;
      that.arc = spec.arc || [0, Math.PI*2];
      that.clockwise = spec.clockwise || true;

      that.args = function() {
        return that.to.concat([that.radius].concat(that.arc).push(that.clockwise));
      };

      that.between = function(other, cycles) {
        return [
          tweenV({obj: that,
                       property: 'to',
                       to: other.to,
                       cycles: cycles}),
          tweenN({obj: that,
                       property: 'radius',
                       to: other.radius,
                       cycles: cycles}),
          tweenN({obj: that,
                       property: 'arc',
                       to: other.arc,
                       cycles: cycles})
        ];
      };

      that.prod = function(box) {
        box.union(bounds(
          that.to[0] - that.radius,
          that.to[0] + that.radius,
          that.to[1] - that.radius,
          that.to[1] + that.radius
        ));
      };

      that.clone = function() {
        return arc(that);
      };

      return that;
    };

    var bezier = function(spec) {
      spec.method = 'bezierCurveTo';
      spec.to = spec.to ? spec.to.clone() : [10, 10];

      var that = base(spec);

      that.control1 = spec.control1 ? spec.control1.clone() : [0, 0];
      that.control2 = spec.control2 ? spec.control2.clone() : [0, 0];

      that.args = function() {
        return that.control1.concat(that.control2).concat(that.to);
      };

      that.prod = function(box) {
        box.include(that.to);
        box.include(that.control1);
        box.include(that.control2);
      };

      that.between = function(other, cycles) {
        return [
          tweenV({
            obj: that,
            property: 'to',
            to: other.to,
            cycles: cycles}),
          tweenV({
            obj: that,
            property: 'control1',
            to: other.control1,
            cycles: cycles}),
          tweenV({
            obj: that,
            property: 'control2',
            to: other.control2,
            cycles: cycles})
        ];
      };

      that.clone = function() {
        return bezier(that);
      };

      return that;
    };

    return {
      base: base,
      line: line,
      move: move,
      text: text,
      arc: arc,
      bezier: bezier
    }
  }();

  // provide objects to represent atomic drawing operations
  var shape = function(spec) {
    spec = spec || {};

    var ops = spec.ops ? spec.ops.map(function(pp) {return op[pp.op](pp);}) : [] || [];
    var color = spec.color;
    var fill = spec.fill || 'fill';

    var between = function(other, cycles, postcycle) {
      return ops.inject([], function(tweens, op, index) {
        return tweens.concat(op.between(other.ops[index], cycles));
      });
    };

    var clone = function() {
      return shape({ops: ops.map(function(vertex) {return vertex.clone();})});
    };

    // construct a simple bounding box to tell if further bounds checking is necessary
    var boxFor = function() {
      var box = bounds(0, 0, 0, 0);
      ops.each(function(vertex) {
        vertex.prod(box);
      });
      return box;
    };

    var box = boxFor();

    var addOp = function(newop) {
      ops.push(op[newop.op](newop));
      console.log(ops.map(function(o) {return o.to.toString()}));
    };

    var updateColor = function(newcolor) {
      for (var ee = 0; ee < color.length; ee++) {
        if (!(newcolor[ee] === undefined) && !(newcolor[ee] === null)) {
          color[ee] = newcolor[ee];
        }
      }
    }

    var draw = function(context) {
      context.beginPath();
      if (color) { context[fill+'Style'] = vector_to_rgba(color) };

      ops.each(function(vertex) {
        context[vertex.method].apply(context, vertex.args());
      });

      context.closePath();
      context[fill]();
    };

    return {
      ops: ops,
      color: color,
      fill: fill,
      between: between,
      clone: clone,
      boxFor: boxFor,
      box: box,
      addOp: addOp,
      updateColor: updateColor,
      draw: draw
    }
  };

  // generic base tween object
  var tween = function(spec) {
    var that = {};

    that.obj = spec.obj || spec;
    that.property = spec.property || ((spec.property === 0) ? spec.property : 'this');
    that.target = spec.target || function(value) {return value === 0;};
    that.step = spec.step || function(value) {return value - 1;};

    that.value = function() {
      return that.obj[that.property];
    };

    that.cycle = function() {
      if (that.target(that.value())) {
        return false;
      } else {
        that.obj[that.property] = that.step(that.value());
        return true;
      }
    };

    return that;
  };

  // tween object for numbers
  var tweenN = function(spec) {
    var that = tween(spec);
    var increment = spec.increment || (spec.cycles ? ((spec.to - spec.obj[spec.property]) / spec.cycles) : 1);

    var greater = function(where, to) {return where >= to;};
    var less = function(where, to) {return where <= to;};

    that.to = spec.to || 0;
    that.test = spec.test || ((that.value() < that.to) ? greater : less);

    that.target = spec.target || function(value) {
      return that.test(value, that.to);
    };

    that.step = spec.step || function(value) {
      return value + increment;
    };

    return that;
  };

  // tween object for vectors
  var tweenV = function(spec) {
    var that = {};

    that.obj = spec.obj || spec;
    that.property = spec.property || 'this';
    that.to = spec.to || [1, 1];
    that.cycles = spec.cycles || 10;
    that.postcycle = spec.postcycle || function() {};
    that.posttween = spec.posttween || function() {};

    that.vector = function() {
      return that.obj[that.property];
    };

    var differing = $R(0, that.vector().length - 1).select(function(index) {
      return !(that.vector()[index] === that.to[index]);
    });

    that.tweens = differing.map(function(index) {
      return tweenN({
        obj: that.vector(),
        property: index,
        to: that.to[index],
        cycles: that.cycles
      });
    });

    that.cycle = function() {
      that.tweens = that.tweens.select(function(tween) {return tween.cycle();});
      that.postcycle();

      if (that.tweens.length === 0) {
        that.posttween();
      }

      return that.tweens.length > 0;
    };

    return that;
  };

  var tweenEvent = function(spec) {
    spec.obj = {count: 0};
    spec.property = 'count';

    var that = tween(spec);

    that.cycles = spec.cycles || 10;
    that.event = spec.event || function() {};

    that.target = function(n) {
      var met = true;

      if (n < that.cycles) {
        met = false;
      } else {
        that.event();
      }

      return met;
    };

    that.step = function(n) {
      return n += 1;
    };

    return that;
  };

  // representation of individual agents
  var mote = function(spec) {
    var that = {};
    spec = spec || {};

    that.type = spec.type || 'mote';
    that.supermote = spec.supermote || null;
    that.submotes = spec.submotes || [];

    that.pos = spec.pos || [0, 0];
    that.shape = spec.shape || shape(); 
    that.scale = spec.scale || [1, 1];
    that.orientation = (spec.orientation === undefined) ? 0 : spec.orientation;
    that.rotation = (spec.rotation === undefined) ? 0 : spec.rotation;
    that.velocity = spec.velocity || [0, 0];

    that.shapes = spec.shapes || [that.shape];
    that.visible = spec.visible === undefined ? true : spec.visible;

    that.color = spec.color || [200, 200, 200, 1];
    that.fill = spec.fill || 'fill';
    that.lineWidth = spec.lineWidth || 1;
    that.outline = spec.outline || null;
    that.bounds = spec.bounds;
    that.transform = spec.transform || 'pos';
    that.paused = false;

    that.tweens = [];

    that.future = [];
    that.neighbors = [];

    that.mouseDown = function(mouse) {};
    that.mouseUp = function(mouse) {};
    that.mouseClick = function(mouse) {};
    that.mouseIn = function(mouse) {};
    that.mouseOut = function(mouse) {};
    that.mouseMove = function(mouse) {};

    // absolute is a function to find the absolute position of the mote
    // with the position, orientation and scale each supermote in this mote's
    // heirarchy of supermotes taken into consideration.

    // rise takes a position and recursively applies the transformations of
    // all supermotes onto it
    that.rise = function(pos) {
      pos = that.transform === 'screen' ? pos.add(that.pos.times(browser.dim())) : pos;
      return that.supermote ? that.supermote.rise(that.supermote.extrovert(pos)) : pos;
    };

    // find_absolute is for the cache, so that the absolute position does not
    // need to be calculated every time it is accessed, only when the
    // position or orientation of it or one of its supermotes is changed.
    var find_absolute = function() {
      return that.rise(that.pos);
    };
    that.absolute = linkage.cache(find_absolute);
    that.absolute.expiring = function() {
      that.submotes.each(function(submote) {
        submote.absolute.expire();
      });
    };

    that.contains = function(point) {
      return that.box.inside(point.subtract(that.absolute()));
    };

    // construct a simple bounding box to tell if further bounds checking is necessary
    that.findBox = function() {
      var box = bounds(0, 0, 0, 0);

      box = that.shapes.inject(box, function(grow, shape) {
        grow.union(shape.box);
        return grow;
      });

      that.submotes.each(function(submote) {
        box.union(submote.box);
      });

      that.box = box;
      return box;
    };

    that.findBox();

    that.findIn = function(mouse, pos) {
      if (that.contains(pos) && !mouse.inside.include(that)) {
        mouse.inside.push(that);
        that.mouseIn(mouse);
      }

      that.submotes.invoke('findIn', mouse, pos);
    };

    var findColorSpec = function(prop) {
      return function() {return vector_to_rgba(that[prop]);};
    };

    that.color_spec = linkage.cache(findColorSpec('color'));
    that.outline_spec = linkage.cache(findColorSpec('outline'));

    that.tweenColor = function(color, cycles, posttween) {
      posttween = posttween || function() {};

      that.tweens.push(tweenV({
        obj: that,
        property: 'color',
        to: color,
        cycles: cycles,
        postcycle: function() {that.color_spec.expire();},
        posttween: posttween
      }));

      return that;
    };

    that.tweenPos = function(to, cycles, posttween) {
      that.tweens.push(tweenV({
        obj: that,
        property: 'pos',
        to: to,
        cycles: cycles,
        postcycle: function() {that.absolute.expire();},
        posttween: posttween
      }));

      return that;
    };

    that.tweenOrientation = function(orientation, cycles, posttween) {
      that.tweens.push(tweenN({
        obj: that,
        property: 'orientation',
        to: orientation,
        cycles: cycles,
        posttween: posttween
      }));

      return that;
    };

    that.tweenScale = function(scale, cycles) {
      that.tweens.push(tweenV({
        obj: that,
        property: 'scale',
        to: scale,
        cycles: cycles
      }));

      return that;
    };

    that.tweenShape = function(shape, cycles) {
      var tween = that.shape.between(shape, cycles);
      that.tweens = that.tweens.concat(tween);

      return that;
    };

    that.tweenEvent = function(event, cycles) {
      var tween = tweenEvent({event: event, cycles: cycles});
      that.tweens = that.tweens.concat(tween);

      return that;
    };

    that.expireSupermotes = function() {
      that.supermotes.expire();
      that.absolute.expire();
      that.submotes.each(function(submote) {
        submote.expireSupermotes();
      });
    };

    that.attach = function(other) {
      other.orientation -= that.orientation;
      if (other.supermote) {
        other.supermote.submotes = other.supermote.submotes.without(other);
      }
      that.submotes.push(other);

      other.supermote = that;
      other.expireSupermotes();
    };

    that.detach = function(other) {
      that.submotes = that.submotes.without(other);

      other.orientation += that.orientation;
      //        other.pos = other.supermote.extrovert(other.pos);
      other.supermote = null;

      if (that.supermote) {
        //            other.pos = that.supermote.extrovert(other.pos);
        that.supermote.attach(other);
      }

      other.absolute.expire();
    };

    that.addSubmotes = function(submotes) {
      submotes.each(function(submote) {
        that.attach(submote);
      });
    };

    that.introvert = function(pos) {
      return pos.times(that.scale.map(function(el) {return 1.0 / el;})).rotate(-that.orientation, that.pos).subtract(that.pos);
    };

    that.extrovert = function(pos) {
      //        var transform = that.transform === 'screen' ? pos.add(that.pos.times(browser.dim())) : pos.add(that.pos);
      var transform = pos.add(that.pos);
      return transform.rotate(that.orientation, that.pos).times(that.scale);
    };

    that.find_supermotes = function() {
      return (that.supermote === null) ? [] : that.supermote.supermotes().slice().push(that.supermote);
    };

    that.supermotes = linkage.cache(that.find_supermotes);

    that.commonSupermote = function(other) {
      if (that.supermote === null || other.supermote === null) {
        return null;
      }

      var n = that.supermotes().length - 1;
      var common = null;
      var down = -1;
      var possible = null;

      while (!common && n >= 0) {
        possible = that.supermotes()[n];
        down = other.supermotes().indexOf(possible);

        if (down >= 0) {
          common = possible;
        } else {
          n -= 1;
        }
      }

      return {
        common: common,
        up: that.supermotes().length - 1 - n,
        down: down === -1 ? other.supermotes().length : other.supermotes().length - 1 - down
      };
    };

    that.relativePos = function(other) {
      if (that.supermote === other.supermote) {
        return other.pos;
      }

      var common = that.commonSupermote(other);
      var transformed = other.pos;

      for (var extro = 0; extro < common.down; extro++) {
        transformed = other.supermotes()[(other.supermotes().length - 1) - extro].extrovert(transformed);
      }

      for (var intro = 0; intro < common.up; intro++) {
        transformed = that.supermotes()[(that.supermotes().length - common.up) + intro].introvert(transformed);
      }

      return transformed;
    };

    that.distance = function(other) {
      return that.absolute().distanceFrom(other.absolute());
    };

    that.to = function(other) {
      return other.absolute().subtract(that.absolute());
    };

    that.angleFrom = function(other) {
      return that.pos.angleFrom(other.pos);
    };

    // this finds the closest mote from a list of possible motes.
    // a predicate can be provided to filter out choices.
    that.findClosest = function(others, predicate) {
      var closestMote = null;
      var closestDistance = null;

      predicate = predicate || function(other) {return true;};

      others.each(function(other) {
        if (predicate(other)) {
          if (closestMote === null) {
            closestMote = other;
            closestDistance = that.distance(other);
          } else {
            var newDistance = that.distance(other);
            if (newDistance < closestDistance) {
              closestMote = other;
              closestDistance = newDistance;
            }
          }
        }
      });

      return closestMote;
    };

    that.pause = function() {
      that.paused = true;
    };

    that.unpause = function() {
      that.paused = false;
    };

    that.perceive = spec.perceive || function(env) {
      that.submotes.each(function(submote) {
        submote.perceive(env);
      });
    };

    that.adjust = spec.adjust || function() {
      if (!that.paused) {
        that.orientation += that.rotation;

        while (that.orientation > Math.PI) {
          that.orientation -= Math.PI*2;
        } while (that.orientation < -Math.PI) {
          that.orientation += Math.PI*2;
        }

        for (var dim=0; dim < that.pos.length; dim++) {
          that.pos[dim] += that.velocity[dim];
        }

        that.future.each(function(moment) {
          moment(that);
        });
        that.future = [];

      }

      that.tweens = that.tweens.select(function(tween) {
        return tween.cycle();
      });

      that.submotes.invoke('adjust');
      that.absolute.expire();

      // ----------- lazy bounds checking ---------------
      if (that.bounds) {
        var check = that.bounds.check(that.pos);

        check.each(function(result, index) {
          if (!(result === 0)) {
            that.velocity[index] = -that.velocity[index];
          }
        });
      }
      // -------------------------------------------------

    };

    that.drawShape = function(context, fill) {
      context.beginPath();

      that.shape.ops.each(function(vertex) {
        context[vertex.method].apply(context, vertex.args());
      });

      context.closePath();
      context[fill]();
    };

    that.draw = function(context) {
      // drawing lines to neighbors
      if (that.visible && that.neighbors.length > 1) {
        context.save();

        that.neighbors.each(function(neighbor) {
          context.lineWidth = 3;
          context.strokeStyle = that.color_spec();
          context.beginPath();
          context.moveTo.apply(context, that.pos);
          context.lineTo.apply(context, that.relativePos(neighbor));
          context.closePath();
          context.stroke();
        });

        context.restore();
      }

      // drawing the shape
      context.save();

      context[that.fill + 'Style'] = that.color_spec();
      context.lineWidth = that.lineWidth;

      if (that.transform === 'screen') {
        context.translate(Math.floor(that.pos[0]*browser.w), Math.floor(that.pos[1]*browser.h));
      } else {
        context.translate.apply(context, that.pos);
      }

      context.rotate(that.orientation);
      context.scale.apply(context, that.scale);

      if (that.visible) {
        var len = that.shapes.length;
        for (var index=0; index < len; index++){
          that.shapes[index].draw(context);
        }

        if (that.outline) {
          context.save();
          context.strokeStyle = that.outline_spec();
          that.drawShape(context, 'stroke');
          context.restore();
        }
      }

      that.submotes.invoke('draw', context);

      context.restore();
    };

    return that;
  };

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

    that.tweenScale = function(scale, cycles) {
      var tween = tweenV({
        obj: that,
        property: 'scale',
        to: scale,
        cycles: cycles
      });

      that.tweens.push(tween);
      return that;
    };

    that.tweenTranslation = function(translation, cycles) {
      var tween = tweenV({
        obj: that,
        property: 'translation',
        to: translation,
        cycles: cycles
      });

      that.tweens.push(tween);
      return that;
    };

    that.tweenViewport = function(spec, cycles) {
      if (spec.scale) that.tweenScale(spec.scale, cycles);
      if (spec.translation) that.tweenTranslation(spec.translation, cycles);
    };

    var update = function() {
      before = now;
      now = time();
      interval = now - before;

      that.motes.invoke('perceive', that);
      that.motes.invoke('adjust');

      that.tweens = that.tweens.select(function(tween) {
        return tween.cycle();
      });

      draw();
    };

    var draw = function() {
      context.clearRect(0, 0, browser.w, browser.h);
      that.predraw(context);

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
