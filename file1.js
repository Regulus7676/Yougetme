'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _window$nanogl = window.nanogl,
    Program = _window$nanogl.Program,
    ArrayBuffer = _window$nanogl.ArrayBuffer,
    IndexBuffer = _window$nanogl.IndexBuffer,
    Texture = _window$nanogl.Texture;


var canvas = document.createElement('canvas');
document.body.appendChild(canvas);

var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) throw 'WebGL not supported';

gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);

var NUM_PARTICLES = 6000;

var uniforms = {
  u_time: 0,
  u_view: mat4.create(),
  u_mouse: [0, 0],
  u_resolution: [],
  u_projection: mat4.create()
};

var camera = {};
camera.eye = [0, 0, 5];
camera.target = [0, 0, 0];
camera.up = [0, 1, 0];

var transform = {};
transform.rotation = [0, 0, 0];

var Snowstorm = function () {
  function Snowstorm(gl) {
    _classCallCheck(this, Snowstorm);

    var vert = document.getElementById('snowstorm-vert').textContent;
    var frag = document.getElementById('snowstorm-frag').textContent;

    this.gl = gl;
    this.program = new Program(gl, vert, frag, '\n      precision highp float;\n      #define PI 3.141592653589793\n      #define TWO_PI 6.283185307179586\n      #define HALF_PI 1.5707963267948966\n    ');

    this.program.use();
    this.model = mat4.translate([], mat4.create(), [0, 25, 0]);

    var particles = fill(NUM_PARTICLES, function (i) {
      var x = random(-20, 20);
      var y = -50;
      var z = random(-50);
      return [x, y, z];
    }).reduce(function (result, p) {
      return result.concat(p[0], p[1], p[2]);
    }, []);

    var position = new ArrayBuffer(gl);
    position.attrib('position', 3, gl.FLOAT);
    position.data(new Float32Array(particles));

    var offset = new ArrayBuffer(gl);
    offset.attrib('offset', 1, gl.FLOAT);
    offset.data(new Float32Array(fill(NUM_PARTICLES, function (i) {
      return random();
    })));

    var size = new ArrayBuffer(gl);
    size.attrib('size', 1, gl.FLOAT);
    size.data(new Float32Array(fill(NUM_PARTICLES, function (i) {
      return random(1, 6);
    })));

    this.buffers = { position: position, offset: offset, size: size };
  }

  _createClass(Snowstorm, [{
    key: 'uniforms',
    value: function uniforms(_uniforms) {

      this.program.use();

      for (var name in _uniforms) {
        var setter = this.program[name];
        if (setter === undefined) continue;
        setter(_uniforms[name]);
      }

      return this;
    }
  }, {
    key: 'render',
    value: function render() {

      var gl = this.gl;

      this.program.use();
      this.program.u_model(this.model);

      for (var key in this.buffers) {
        this.buffers[key].attribPointer(this.program);
      }

      this.buffers.position.bind();
      this.buffers.position.draw(gl.POINTS);
    }
  }]);

  return Snowstorm;
}();

var Snowflake = function () {
  function Snowflake(gl) {
    _classCallCheck(this, Snowflake);

    // snowflake-complex.js
    var positions = window.complex.positions.reduce(function (result, value) {
      return result.concat([value[0], value[1], value[2]]);
    }, []);

    var cells = fill(window.complex.positions.length, function (i) {
      return i;
    });

    var vert = document.getElementById('snowflake-vert').textContent;
    var frag = document.getElementById('snowflake-frag').textContent;

    this.gl = gl;
    this.program = new Program(gl, vert, frag, '\n      precision mediump float;\n      #define PI 3.141592653589793\n      #define TWO_PI 6.283185307179586\n      #define HALF_PI 1.5707963267948966\n    ');
    this.program.use();
    this.model = mat4.create();

    var position = new ArrayBuffer(gl);
    position.attrib('position', 3, gl.FLOAT);
    position.attribPointer(this.program);
    position.data(new Float32Array(positions));

    var colors = cells.reduce(function (result) {
      var rgba = [1.0, 1.0, 1.0, 0.1 + Math.random() * 0.5];
      return result.concat(rgba, rgba, rgba);
    }, []);

    var color = new ArrayBuffer(gl);
    color.attrib('color', 4, gl.FLOAT);
    color.attribPointer(this.program);
    color.data(new Float32Array(colors));

    var index = new ArrayBuffer(gl);
    var indices = cells.reduce(function (result, i) {
      return result.concat([i, i, i]);
    }, []);
    index.attrib('index', 1, gl.FLOAT);
    index.attribPointer(this.program);
    index.data(new Float32Array(indices));

    this.buffers = { position: position, color: color, index: index };
    this.elements = new IndexBuffer(gl);
    this.elements.data(new Uint16Array(cells));
  }

  // nanogl's program.my_uniform() is convenient for setting uniforms,
  // but not necessarily safe according to "Can we use the setters directly?"
  // https://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
  // this uniforms() method addresses that
  // program.uniforms({ u_model: model, u_projection: projection });


  _createClass(Snowflake, [{
    key: 'uniforms',
    value: function uniforms(_uniforms2) {

      this.program.use();

      for (var name in _uniforms2) {
        var setter = this.program[name];
        if (setter === undefined) continue;
        setter(_uniforms2[name]);
      }

      return this;
    }
  }, {
    key: 'render',
    value: function render() {

      var gl = this.gl;
      var model = this.model;

      this.program.use();
      this.program.u_model(this.model);

      for (var key in this.buffers) {
        this.buffers[key].attribPointer(this.program);
      }

      this.elements.bind();
      this.elements.draw(gl.TRIANGLES);
    }
  }]);

  return Snowflake;
}();

var snowstorm = new Snowstorm(gl);
var snowflake = new Snowflake(gl);

function centroid(triangle) {

  var dimension = triangle[0].length;
  var result = new Array(dimension);

  for (var i = 0; i < dimension; i++) {
    var t0 = triangle[0][i];
    var t1 = triangle[1][i];
    var t2 = triangle[2][i];
    result[i] = (t0 + t1 + t2) / 3;
  }

  return result;
}

function fill(size, fn) {
  var array = Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = fn(i);
  }
  return array;
}

function random(min, max) {

  if (arguments.length == 0) {
    return Math.random();
  }

  if (Array.isArray(min)) {
    return min[Math.floor(Math.random() * min.length)];
  }

  if (typeof min == 'undefined') min = 1;
  if (typeof max == 'undefined') max = min || 1, min = 0;

  return min + Math.random() * (max - min);
}

function resize(event) {

  var scale = window.devicePixelRatio || 1;
  var width = window.innerWidth;
  var height = window.innerHeight;

  gl.canvas.width = width * scale;
  gl.canvas.height = height * scale;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  uniforms.u_resolution = [width, height];
  mat4.perspective(uniforms.u_projection, Math.PI / 4, width / height, 0.01, 100);
}

function mousemove(event) {
  event.preventDefault();
  var width = window.innerWidth;
  var height = window.innerHeight;
  var x = event.touches ? event.touches[0].pageX : event.pageX;
  var y = event.touches ? event.touches[0].pageY : event.pageY;
  uniforms.u_mouse[0] = x / width * 2 - 1;
  uniforms.u_mouse[1] = y / height * -2 + 1;
}

function animate(time) {

  uniforms.u_time = time;
  mat4.lookAt(uniforms.u_view, camera.eye, camera.target, camera.up);

  snowstorm.uniforms(uniforms);
  snowstorm.render();

  var mouse = [].concat(_toConsumableArray(uniforms.u_mouse));
  transform.rotation[0] += (-mouse[0] - transform.rotation[0]) * 0.1;
  transform.rotation[1] += (mouse[1] - transform.rotation[1]) * 0.1;

  var model = snowflake.model;
  mat4.identity(model);
  mat4.rotateX(model, model, transform.rotation[1]);
  mat4.rotateY(model, model, transform.rotation[0]);

  snowflake.uniforms(uniforms);
  snowflake.uniforms({ u_model: model });
  snowflake.render();

  requestAnimationFrame(animate);
}

function init() {
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('touchmove', mousemove);
  window.addEventListener('touchend', function (event) {
    return uniforms.u_mouse = [0, 0];
  });
  window.addEventListener('contextmenu', function (event) {
    return event.preventDefault();
  });
  resize();
  requestAnimationFrame(animate);
}

init();
