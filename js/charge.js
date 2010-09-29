var charge = function(id) {
    var particle = linkage.type([flux.mote], {
        init: function(spec) {
            arguments.callee.uber.call(this, spec);

            this.charge = spec.charge;
            this.mass = spec.mass;
        }
    });

    var world = flux.canvas({
        id: 'charge'
    });
    
    return {
        world: world,

        init: function() {
            world.init();
        }
    };
}();