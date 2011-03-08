var neural = function() {
    var neurons = [];

    var neuron = linkage.type({
        init: function() {
            
        }
    });

    var world = flux.canvas({
        id: 'neural',
        motes: neurons
    });

    return world.generator();
}