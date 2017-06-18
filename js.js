var Point = function (x, y, z) {
  this.x = Math.round(x);
  this.y = Math.round(y);
  this.z = Math.round(z);
}

function fromOBJ(file) {
  var list = file.split("\n");
  var points = [];
  var faces = [];
  var temp_list = [];
  var temp_arr = [];
  var point_a;
  var point_b;
  var point_c;
  var temp_points = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i][0] + list[i][1] == "v ") {
      temp_list = list[i].split(" ");
      points.push(new Point(Math.round(parseFloat(temp_list[1])), Math.round(parseFloat(temp_list[2])), Math.round(parseFloat(temp_list[3]))));
    }
    if (list[i][0] == "f") {
      temp_points = [];
      for (var v = 1; v < 4; v++) {
        temp_arr = list[i].split(" ")[v].split("/")
        temp_points.push(parseInt(temp_arr[0]));
      }
      temp_points = remove_duplicates(temp_points);
      point_a = points[temp_points[0] - 1]
      point_b = points[temp_points[1] - 1]
      point_c = points[temp_points[2] - 1]
      faces.push(new Face(point_a, point_b, point_c));
    }
  }
  return faces;
}

function to_minecraft_function(arr, block, offset_x, offset_y, offset_z) {
  top_most = null;
  bottom_most = null;
  north_most = null;
  south_most = null;
  east_most = null;
  west_most = null;
  functions = [];
  for (var i = 0; i < arr.length; i++) {
    temp_arr = arr[i].generate();
    for (var v = 0; v < temp_arr.length; v++) {
      if (temp_arr[v].y + offset_y > top_most || top_most === null) {
        top_most = temp_arr[v].y + offset_y;
      }
      if (temp_arr[v].y + offset_y < bottom_most || bottom_most === null) {
        bottom_most = temp_arr[v].y + offset_y;
      }
      if (temp_arr[v].z + offset_z < north_most || north_most === null) {
        north_most = temp_arr[v].z + offset_z;
      }
      if (temp_arr[v].z + offset_z > south_most || south_most === null) {
        south_most = temp_arr[v].z + offset_z;
      }
      if (temp_arr[v].x + offset_x > east_most || east_most === null) {
        east_most = temp_arr[v].x + offset_x;
      }
      if (temp_arr[v].x + offset_x < west_most || west_most === null) {
        west_most = temp_arr[v].x + offset_x;
      }
      functions.push("setblock " + (temp_arr[v].x + offset_x) + " " + (temp_arr[v].y + offset_y) + " " + (temp_arr[v].z + offset_z) + " " + block);
    }
  }
  var res = {};
  res.size = functions.length;
  res.function = remove_duplicates(functions).join("\n");
  res.top = top_most;
  res.bottom = bottom_most;
  res.north = north_most;
  res.south = south_most;
  res.east = east_most;
  res.west = west_most;
  return res;
}

function remove_duplicates(list) {
  var new_list = [];
  for (var i = 0; i < list.length; i++) {
    if (!new_list.includes(list[i])) {
      new_list.push(list[i])
    }
  }
  return new_list;
}

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
  return remove_duplicates(points);
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

var blob;
var faces;
var file;
var x_offset = parseInt(document.getElementById("x").value);
var y_offset = parseInt(document.getElementById("y").value);
var z_offset = parseInt(document.getElementById("z").value);
var block = document.getElementById("block").value;
var size_text = document.getElementById("size");
var top_text = document.getElementById("top");
var bottom_text = document.getElementById("bottom");
var north_text = document.getElementById("north");
var south_text = document.getElementById("south");
var east_text = document.getElementById("east");
var west_text = document.getElementById("west");
var warning_text = document.getElementById("warning");
function make_function() {
  x_offset = parseInt(document.getElementById("x").value);
  y_offset = parseInt(document.getElementById("y").value);
  z_offset = parseInt(document.getElementById("z").value);
  block = document.getElementById("block").value;
  file_and_data = to_minecraft_function(faces, block, x_offset, y_offset, z_offset);
  size_text.innerHTML = file_and_data.size;
  top_text.innerHTML = file_and_data.top;
  bottom_text.innerHTML = file_and_data.bottom;
  north_text.innerHTML = file_and_data.north;
  south_text.innerHTML = file_and_data.south;
  east_text.innerHTML = file_and_data.east;
  west_text.innerHTML = file_and_data.west;
  if (file_and_data.top > 255) {
    if (file_and_data.bottom < 0) {
      warning_text.innerHTML = "WARNING! This will go above and below the world";
      warning_text.style.color = "red";
    } else {
      warning_text.innerHTML = "WARNING! This will go above the world"
      warning_text.style.color = "red";
    }
  } else {
    if (file_and_data.bottom < 0) {
      warning_text.innerHTML = "WARNING! This will go below the world"
      warning_text.style.color = "red";
    } else {
      warning_text.innerHTML = "All good!"
      warning_text.style.color = "green";
    }
  }
  blob = new Blob([file_and_data.function], {type: "text/plain;charset=ascii"});
}

function download_function() {
  saveAs(blob, "function.mcfunction");
}

function handleFile(files) {
  for (var i = 0, f; f = files[i]; i++) {
    var reader = new FileReader();
    reader.onload = (function(theFile) {
      return function(e) {
        faces = fromOBJ(e.srcElement.result);
      };
    })(f);
    reader.readAsText(f);
  }
}