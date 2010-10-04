var neural = function() {
    var neurons = [];

    var world = flux.canvas({
        id: 'neural',
        motes: neurons
    });

    return world.generator();
}