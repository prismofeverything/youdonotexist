var the_function = function() {
	$('canvas').each(function() {
		var p = Processing(this);
		p.size(500, 500);
		p.colorMode(p.RGB, 1, 1, 1, 1);
		p.background(1, 1, 1, 1);
		p.fill(0.3, 0.4, 0.7);
		p.ellipse(150, 150, 150, 150);

		f = flux({pos: $V([200, 200])});
		f.draw(p);
	});
};

