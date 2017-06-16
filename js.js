var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

function gen_points(point1, point2) {
  var x1 = point1.x;
  var y1 = point1.y;
  var z1 = point1.z;
  var x2 = point2.x;
  var y2 = point2.y;
  var z2 = point2.z;
  if (x1 - x2 > 0) {
    return gen_points(point2, point1);
  }
  var diff_x = x1 - x2;
  var diff_y = y1 - y2;
  var diff_z = z1 - z2;
  var y_delta = diff_y / diff_x;
  var z_delta = diff_z / diff_x;
  var points = [];
  var y_current = y1;
  var z_current = z1;
  for (i = 0; i < Math.abs(x1 - x2); i++) {
    this_x = x1 + i;
    this_y = y_current;
    y_current += y_delta;
    this_z = z_current;
    z_current += z_delta;

    points.push(new Point(Math.round(this_x), Math.round(this_y), Math.round(this_z)));
  }
  return points;
}

function swap_points(points, what_to_swap) {
  var new_points = [];
  for (var i = 0; i < points.length; i++) {
    if (what_to_swap == "y") {
      new_points[i] = new Point(points[i].y, points[i].x, points[i].z);
    } else {
      new_points[i] = new Point(points[i].z, points[i].y, points[i].x);
    }
  }
  return new_points;
}

function gen_line(point1, point2) {
  var x1 = point1.x;
  var y1 = point1.y;
  var z1 = point1.z;
  var x2 = point2.x;
  var y2 = point2.y;
  var z2 = point2.z;
  var diff_x = Math.abs(x1 - x2);
  var diff_y = Math.abs(y1 - y2);
  var diff_z = Math.abs(z1 - z2);
  var points = [];
  var p = [];
  var final_p = [];
  if (diff_x >= diff_y) {
    if (diff_x >= diff_z) {
      return gen_points(point1, point2);
    } else {
      p = swap_points([point1, point2], "z");
      points = gen_line(p[0], p[1]);
      return swap_points(points, "z");
    }
  } else {
    p = swap_points([point1, point2], "y");
    points = gen_line(p[0], p[1]);
    return swap_points(points, "y");
  }
}

var Face = function (a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

Face.prototype.generate = function () {
  var i = this.get_lines().concat(this.get_points());
  return i;
};

Face.prototype.get_lines = function () {
  var v = this.get_points();
  var points_a = gen_line(v[0], v[1]);
  var points_b = gen_line(v[1], v[2]);
  var points_c = gen_line(v[2], v[0]);
  var points = points_a.concat(points_b.concat(points_c));
  for (var i = 0; i < points_a.length; i++) {
    points = points.concat(gen_line(points_a[i], v[2]));
  }
  for (var i = 0; i < points_b.length; i++) {
    points = points.concat(gen_line(points_b[i], v[0]));
  }
  for (var i = 0; i < points_c.length; i++) {
    points = points.concat(gen_line(points_c[i], v[1]));
  }
  var s = new Set();
  for (var i = 0; i < points.length; i++) {
    s.add(JSON.stringify(points[i]));
  }
  points = [];
  for (let i of s) {
    v = JSON.parse(i);
    points.push(new Point(v.x, v.y, v.z));
  }
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

function handleFile(files) {
  for (var i = 0, f; f = files[i]; i++) {
    // Only process image files.
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        console.log(e.srcElement.result);
        console.log(fromOBJ(e.srcElement.result));
      };
    })(f);
    // Read in the image file as a data URL.
    reader.readAsText(f);
  }
}