var charge = function(id) {
    var numberOfParticles = 100;
    var forceFactor = 33;
    var permittivity = 1;
    var colorBasis = 50;
    var colorFactor = 17;

    var chargeColor = function(charge) {
        var color = [colorBasis, colorBasis, colorBasis, 255];
        var hue = colorBasis + (Math.abs(charge) * colorFactor);

        var spectrum = (charge < 0) ? 2 : 0; // blue is less than 0, red greater than 0
        color[spectrum] = hue;

//        color[1] = hue;

        return color;
    };

    var particles = [];

    var particle = linkage.type([flux.mote], {
        init: function(spec) {
            this.charge = spec.charge || 0;
            this.mass = spec.mass || 1;

            spec.shapes = spec.shapes || [flux.shape({
                color: chargeColor(this.charge),
                ops: [{op: 'arc', to: [0, 0], radius: this.mass}]
            })];

            spec.pos = [Math.random() * 500, Math.random() * 500];

            arguments.callee.uber.call(this, spec);
        },

        forceOn: function(other) {
            var unit = other.pos.subtract(this.pos).toUnitVector();
            var strength = this.charge * other.charge * permittivity;
            var distance = this.pos.distanceSquared(other.pos);

            return unit.multiply(strength / distance);
        },

        perceive: function(env) {
            var force = [0, 0];
            var forcePartial = 0;

            for (var v = 0; v < particles.length; v++) {
                var other = particles[v];
                if (!(other === this)) {
                    var subforce = other.forceOn(this);
                    for (var f = 0; f < force.length; f++) {
                        force[f] += subforce[f];
                    }
                }
            }

            for (var f = 0; f < force.length; f++) {
                forcePartial = (force[f] * forceFactor / this.mass);
                this.velocity[f] += forcePartial;
            }
        }
    });

    for (var i = 0; i < numberOfParticles; i++) {
        particles.push(particle({
            charge: (Math.random() * 20) - 10,
            mass: Math.random() * 20,
            velocity: [Math.random() - 0.5, Math.random() - 0.5]
        }));
    }

    var world = flux.canvas({
        id: 'charge',
        motes: particles,
        trace: true,
        translation: [400, 200]
        // background: "#eeeeee"
    });
    
    return world.generator();
}();