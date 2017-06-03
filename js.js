var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

function gen_line(point1, point2) {
  var x1 = point1.x;
  var y1 = point1.y;
  var z1 = point1.z;
  var x2 = point2.x;
  var y2 = point2.y;
  var z2 = point2.z;
  var points = [];
  if (z1 > z2) {
    return gen_line(point2, point1);
  }
  if (x1 == x2) {
    if (z1 == z2) {
      return [];
    }
    for (var z = z1 + 1; z < z2; z++) {
      points.push(new Point(x1, 0, z));
    }
  } else {
    var slope = (z1 - z2) / (x1 - x2);
    if (slope == 0) {
      if (x1 < x2) {
        for (var x = x1 + 1; x < x2; x++) {
          points.push(new Point(x, 0, z1));
        }
      } else {
        for (var x = x1 - 1; x > x2; x--) {
          points.push(new Point(x, 0, z1));
        }
      }
    } else if (slope <= 1 && slope > 0) {
      var z_intercept = z1 - slope * x1;
      for (var x = x1 + 1; x < x2; x++) {
        points.push(new Point(x, 0, x * slope + z_intercept));
      }
    } else if (slope > 0 || slope <= -1) {
      slope = (x1 - x2) / (z1 - z2);
      var x_intercept = x1 - slope * z1;
      for (var z = z1 + 1; z < z2; z++) {
        points.push(new Point(z * slope + x_intercept, 0, z));
      }
    } else {
      var z_intercept = z1 - slope * x1;
      for (var x = x2 + 1; x < x1; x++) {
        points.push(new Point(x, 0, x * slope + z_intercept));
      }
    }
  }
  return points;
}

var Face = function (a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

Face.prototype.generate = function () {
  return this.get_lines().concat(this.get_points());
};

Face.prototype.get_lines = function () {
  var v = this.get_points();
  var points = gen_line(v[0], v[1]);
  return points;
};

Face.prototype.get_points = function () {
  return [this.a, this.b, this.c]
};

Face.prototype.draw = function() {
  var v = this.generate();
  for (var i = 0; i < v.length; i++) {
    v[i].draw();
  }
};

var Point = function (x, y, z) {
  this.x = Math.round(x);
  this.y = Math.round(y);
  this.z = Math.round(z);
}

Point.prototype.draw = function() {
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(this.x * 20, this.z * 20, 20, 20);
};

var faces = [new Face(new Point(5, 0, 2), new Point(2, 0, 5), new Point(1, 0, 10))];

function update_loc(event) {
  faces = [new Face(new Point(Math.round(event.clientX / 20), 0, Math.round(event.clientY / 20)), new Point(10, 0, 10), new Point(1, 0, 10))]
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faces[0].draw();
  ctx.beginPath();
  for (var i = 1; i < 20; i++) {
    ctx.moveTo(0, i * 20);
    ctx.lineTo(400, i * 20);
  }
  for (var i = 1; i < 20; i++) {
    ctx.moveTo(i * 20, 0);
    ctx.lineTo(i * 20, 400);
  }
  ctx.stroke();
}