var evader = function(spec) {
    var that = {};

    that.element = $(spec.element);
    that.over = spec.over
    that.out = spec.out

    that.origin = vector({elements: [500, 300]});
    that.threshhold = 100;
    that.spriteliness = 2000.0;
    that.intervalFactor = 100;
    that.approachFactor = 1000;

    that.now = vector({elements: [0, 0]});
    that.before = vector({elements: [0, 0]});
    that.motion = vector({elements: [0, 0]});
    that.offset = vector({elements: [-25, -20]});
    that.approached = false;
    that.accepted = false;
    that.rejected = false;

    that.evading = vector({elements: [0, 0]});

    that.applyVector = function(v) {
        that.element.style.left = '' + v.elements[0] + 'px';
        that.element.style.top = '' + v.elements[1] + 'px';

        return that;
    };

    that.applyMotion = function() {
        that.orient();
        that.evade();

        that.applyVector(that.origin);
    };

    that.orient = function() {
        that.direction = that.origin.subtract(that.now);
        that.distance = that.origin.distance(that.now);
        that.motion = that.now.subtract(that.before);
    };

    that.track = function(event) {
        that.before = that.now;
        that.now = vector({elements: [event.pageX, event.pageY]}).add(that.offset);
        that.applyMotion();
    };

    that.accept = function(event) {
        if (!that.rejected) {
            that.over();
            that.accepted = true;
        }
    };

    that.reject = function(event) {
        that.out();
        that.rejected = true;
        that.element.addClassName('nothingness');
    };

    that.decide = function() {
        that.decided = true;
        var self = that;
        that.interval = setInterval(function(){self.approach();}, self.intervalFactor);
    };

    that.approach = function() {
        if(that.distance > 5 && !that.accepted) {
            that.orient();
            var factor = that.approachFactor * (8.0 / (that.distance + 1.0));
            var new_origin = that.origin.add(that.direction.invert().normalize().scale(factor));

            that.origin.set(new_origin);
            that.applyVector(that.origin);
        }
    };

    that.clear = function() {
        if(that.decided) {that.decided = false;};
        if(that.timeout != null) {
            clearTimeout(that.timeout);
            that.timeout = null;
        }
        if(that.interval != null) {
            clearInterval(that.interval);
            that.interval = null;
        }
    };

    that.evade = function() {
        that.clear();

        if(!that.rejected) {
            if (that.distance < that.threshhold) {
                if(that.approached == false) {
                    that.approached = true;
                }

                //        that.factor = (that.distance == 0) ? 1 : (that.spriteliness / that.distance)
                that.factor = ((that.spriteliness * 100) / that.distance.square());
                that.force = that.direction.normalize().scale(that.factor);
                that.origin.set(that.origin.add(that.force));
            }

            if(that.approached) {
                self = that;
                that.timeout = setTimeout(function(){self.decide();}, 5000);
            }
        }
    };

    that.applyMotion();

    document.observe('mousemove', that.track.bindAsEventListener(that));
    that.element.observe('mouseover', that.accept.bindAsEventListener(that))
    that.element.observe('mouseout', that.reject.bindAsEventListener(that))

	return that;
};
