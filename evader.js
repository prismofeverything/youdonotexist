var evader = function(spec) {
	var that = {};

	that.element = $(spec.element);
	that.over = spec.over
	that.out = spec.out

	that.origin = vector2d({x: 500, y: 300});
	that.threshhold = 100;
	that.spriteliness = 2000.0;
	that.intervalFactor = 100;
	that.approachFactor = 1000;

	that.now = vector2d({x: 0, y: 0});
	that.before = vector2d({x: 0, y: 0});
	that.motion = vector2d({x: 0, y: 0});
	that.offset = vector2d({x: -25, y: -20});
	that.approached = false;
	that.accepted = false;
	that.rejected = false;

	that.evading = vector2d({x: 0, y: 0});

	that.applyMotion = function() {
		that.orient();
		that.evade();

		that.origin.applyTo(that.element);
	};

	that.orient = function() {
		that.direction = that.origin.difference(that.now);
		that.distance = that.origin.distance(that.now);
		that.motion = that.now.difference(that.before);
	};

	that.track = function(event) {
		that.before = that.now;
		that.now = vector2d({x: event.pageX, y: event.pageY}).sum(that.offset);
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
		self = that;
		that.interval = setInterval(function(){self.approach();}, self.intervalFactor);
	};

	that.approach = function() {
		if(that.distance > 5 && !that.accepted) {
			that.orient();
			factor = that.approachFactor * (1.0 / (that.distance + 1.0));
			that.origin.add(that.direction.inverse().normalize().scale(factor));
			that.origin.applyTo(that.element);
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

                that.perpendicular = that.direction.perpendicular().normalize();
                if (that.angle < 0) {
                    that.perpendicular.invert();
                }

                //        that.factor = (that.distance == 0) ? 1 : (that.spriteliness / that.distance)
                that.factor = ((that.spriteliness * 100) / square(that.distance));
                that.force = that.direction.copy().normalize().scale(that.factor);
                that.origin.add(that.force);
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
