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

