const { Program, ArrayBuffer, IndexBuffer, Texture } = window.nanogl;

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if(!gl) throw 'WebGL not supported';

gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);

const NUM_PARTICLES = 6000;

const uniforms = {
  u_time: 0,
  u_view: mat4.create(),
  u_mouse: [0, 0],
  u_resolution: [],
  u_projection: mat4.create()
};

const camera = {};
camera.eye = [0, 0, 5];
camera.target = [0, 0, 0];
camera.up = [0, 1, 0];

const transform = {};
transform.rotation = [0, 0, 0];

class Snowstorm {

  constructor(gl) {

    const vert = document.getElementById('snowstorm-vert').textContent;
    const frag = document.getElementById('snowstorm-frag').textContent;

    this.gl = gl;
    this.program = new Program(gl, vert, frag, `
      precision highp float;
      #define PI 3.141592653589793
      #define TWO_PI 6.283185307179586
      #define HALF_PI 1.5707963267948966
    `);

    this.program.use();
    this.model = mat4.translate([], mat4.create(), [0, 25, 0]);

    const particles = fill(NUM_PARTICLES, function(i) {
      const x = random(-20, 20);
      const y = -50;
      const z = random(-50);
      return [ x, y, z ];
    }).reduce((result, p) => result.concat(p[0], p[1], p[2]), []);

    const position = new ArrayBuffer(gl);
    position.attrib('position', 3, gl.FLOAT);
    position.data(new Float32Array(particles));

    const offset = new ArrayBuffer(gl);
    offset.attrib('offset', 1, gl.FLOAT);
    offset.data(new Float32Array(fill(NUM_PARTICLES, i => random())));

    const size = new ArrayBuffer(gl);
    size.attrib('size', 1, gl.FLOAT);
    size.data(new Float32Array(fill(NUM_PARTICLES, i => random(1, 6))));

    this.buffers = { position, offset, size };
  }

  uniforms(uniforms) {

    this.program.use();

    for(let name in uniforms) {
      let setter = this.program[name];
      if(setter === undefined) continue;
      setter(uniforms[name]);
    }

    return this;
  }

  render() {

    const gl = this.gl;

    this.program.use();
    this.program.u_model(this.model);

    for(const key in this.buffers) {
      this.buffers[key].attribPointer(this.program);
    }

    this.buffers.position.bind();
    this.buffers.position.draw(gl.POINTS);
  }
}

class Snowflake {

  constructor(gl) {

    // snowflake-complex.js
    const positions = window.complex.positions.reduce((result, value) => {
      return result.concat([value[0], value[1], value[2]]);
    }, []);

    const cells = fill(window.complex.positions.length, i => i);

    const vert = document.getElementById('snowflake-vert').textContent;
    const frag = document.getElementById('snowflake-frag').textContent;

    this.gl = gl;
    this.program = new Program(gl, vert, frag, `
      precision mediump float;
      #define PI 3.141592653589793
      #define TWO_PI 6.283185307179586
      #define HALF_PI 1.5707963267948966
    `);
    this.program.use();
    this.model = mat4.create();

    const position = new ArrayBuffer(gl);
    position.attrib('position', 3, gl.FLOAT);
    position.attribPointer(this.program);
    position.data(new Float32Array(positions));

    const colors = cells.reduce(result => {
      const rgba = [1.0, 1.0, 1.0, 0.1 + Math.random() * 0.5];
        return result.concat(rgba, rgba, rgba);
    }, []);

    const color = new ArrayBuffer(gl);
    color.attrib('color', 4, gl.FLOAT);
    color.attribPointer(this.program);
    color.data(new Float32Array(colors));

    const index = new ArrayBuffer(gl);
    const indices = cells.reduce((result, i) => result.concat([i, i, i]), []);
    index.attrib('index', 1, gl.FLOAT);
    index.attribPointer(this.program);
    index.data(new Float32Array(indices));

    this.buffers = { position, color, index };
    this.elements = new IndexBuffer(gl);
    this.elements.data(new Uint16Array(cells));
  }

  // nanogl's program.my_uniform() is convenient for setting uniforms,
  // but not necessarily safe according to "Can we use the setters directly?"
  // https://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
  // this uniforms() method addresses that
  // program.uniforms({ u_model: model, u_projection: projection });
  uniforms(uniforms) {

    this.program.use();

    for(const name in uniforms) {
      const setter = this.program[name];
      if(setter === undefined) continue;
      setter(uniforms[name]);
    }

    return this;
  }

  render() {

    const gl = this.gl;
    const model = this.model;

    this.program.use();
    this.program.u_model(this.model);

    for(const key in this.buffers) {
      this.buffers[key].attribPointer(this.program);
    }

    this.elements.bind();
    this.elements.draw(gl.TRIANGLES);
  }
}

const snowstorm = new Snowstorm(gl);
const snowflake = new Snowflake(gl);

function centroid(triangle) {

  const dimension = triangle[0].length;
  let result = new Array(dimension);

  for(let i = 0; i < dimension; i++) {
    const t0 = triangle[0][i];
    const t1 = triangle[1][i];
    const t2 = triangle[2][i];
    result[i] = (t0 + t1 + t2) / 3;
  }

  return result;
}

function fill(size, fn) {
  const array = Array(size);
  for(let i = 0; i < size; i++) {
    array[i] = fn(i);
  }
  return array;
}

function random(min, max) {

  if(arguments.length == 0) {
    return Math.random();
  }

  if(Array.isArray(min)) {
    return min[ Math.floor(Math.random() * min.length) ];
  }

  if(typeof min == 'undefined') min = 1;
  if(typeof max == 'undefined') max = min || 1, min = 0;

  return min + Math.random() * (max - min);
}

function resize(event) {

  const scale = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  gl.canvas.width = width * scale;
  gl.canvas.height = height * scale;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  uniforms.u_resolution = [width, height];
  mat4.perspective(uniforms.u_projection, Math.PI / 4, width / height, 0.01, 100);
}

function mousemove(event) {
  event.preventDefault();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const x = (event.touches) ? event.touches[0].pageX : event.pageX;
  const y = (event.touches) ? event.touches[0].pageY : event.pageY;
  uniforms.u_mouse[0] = (x / width)  *  2 - 1;
  uniforms.u_mouse[1] = (y / height) * -2 + 1;
}

function animate(time) {

  uniforms.u_time = time;
  mat4.lookAt(uniforms.u_view, camera.eye, camera.target, camera.up);

  snowstorm.uniforms(uniforms);
  snowstorm.render();

  const mouse = [...uniforms.u_mouse];
  transform.rotation[0] += (-mouse[0] - transform.rotation[0]) * 0.1;
  transform.rotation[1] += ( mouse[1] - transform.rotation[1]) * 0.1;

  const model = snowflake.model;
  mat4.identity(model);
  mat4.rotateX(model, model, transform.rotation[1]);
  mat4.rotateY(model, model, transform.rotation[0]);

  snowflake.uniforms(uniforms);
  snowflake.uniforms({u_model: model});
  snowflake.render();

  requestAnimationFrame(animate);
}

function init() {
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('touchmove', mousemove);
  window.addEventListener('touchend', (event) => uniforms.u_mouse = [0, 0]);
  window.addEventListener('contextmenu', (event) => event.preventDefault());
  resize();
  requestAnimationFrame(animate);
}

init();
