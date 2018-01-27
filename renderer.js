function orthographic(left, right, bottom, top, near, far, dst) {
  dst = dst || new Float32Array(16);

  dst[ 0] = 2 / (right - left);
  dst[ 1] = 0;
  dst[ 2] = 0;
  dst[ 3] = 0;
  dst[ 4] = 0;
  dst[ 5] = 2 / (top - bottom);
  dst[ 6] = 0;
  dst[ 7] = 0;
  dst[ 8] = 0;
  dst[ 9] = 0;
  dst[10] = 2 / (near - far);
  dst[11] = 0;
  dst[12] = (left + right) / (left - right);
  dst[13] = (bottom + top) / (bottom - top);
  dst[14] = (near + far) / (near - far);
  dst[15] = 1;

  return dst;
}

function scale(m, sx, sy, sz, dst) {
    // This is the optimized verison of
    // return multiply(m, scaling(sx, sy, sz), dst);
    dst = dst || new Float32Array(16);

    dst[ 0] = sx * m[0 * 4 + 0];
    dst[ 1] = sx * m[0 * 4 + 1];
    dst[ 2] = sx * m[0 * 4 + 2];
    dst[ 3] = sx * m[0 * 4 + 3];
    dst[ 4] = sy * m[1 * 4 + 0];
    dst[ 5] = sy * m[1 * 4 + 1];
    dst[ 6] = sy * m[1 * 4 + 2];
    dst[ 7] = sy * m[1 * 4 + 3];
    dst[ 8] = sz * m[2 * 4 + 0];
    dst[ 9] = sz * m[2 * 4 + 1];
    dst[10] = sz * m[2 * 4 + 2];
    dst[11] = sz * m[2 * 4 + 3];

    if (m !== dst) {
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
}

function translate(m, tx, ty, tz, dst) {
  // This is the optimized version of
  // return multiply(m, translation(tx, ty, tz), dst);
  dst = dst || new Float32Array(16);

  var m00 = m[0];
  var m01 = m[1];
  var m02 = m[2];
  var m03 = m[3];
  var m10 = m[1 * 4 + 0];
  var m11 = m[1 * 4 + 1];
  var m12 = m[1 * 4 + 2];
  var m13 = m[1 * 4 + 3];
  var m20 = m[2 * 4 + 0];
  var m21 = m[2 * 4 + 1];
  var m22 = m[2 * 4 + 2];
  var m23 = m[2 * 4 + 3];
  var m30 = m[3 * 4 + 0];
  var m31 = m[3 * 4 + 1];
  var m32 = m[3 * 4 + 2];
  var m33 = m[3 * 4 + 3];

  if (m !== dst) {
    dst[ 0] = m00;
    dst[ 1] = m01;
    dst[ 2] = m02;
    dst[ 3] = m03;
    dst[ 4] = m10;
    dst[ 5] = m11;
    dst[ 6] = m12;
    dst[ 7] = m13;
    dst[ 8] = m20;
    dst[ 9] = m21;
    dst[10] = m22;
    dst[11] = m23;
  }

  dst[12] = m00 * tx + m10 * ty + m20 * tz + m30;
  dst[13] = m01 * tx + m11 * ty + m21 * tz + m31;
  dst[14] = m02 * tx + m12 * ty + m22 * tz + m32;
  dst[15] = m03 * tx + m13 * ty + m23 * tz + m33;

  return dst;
}

function rgbString (r, g, b) {
  return `rgb(${r}, ${g}, ${b})`
}

function hexToRGB (hex) {
  return [hexToR(hex), hexToG(hex), hexToB(hex)]
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

// const foregroundColor = hexToRGB("#00000")
const foregroundColor = hexToRGB("#111111")
// const foregroundColor = [123, 45, 38]
// const foregroundColor = [255, 255, 255]
// const backgroundColor = [171, 161, 148]
// const backgroundColor = [0, 0, 0]
// const backgroundColor = hexToRGB("#FFFCEB")
const backgroundColor = hexToRGB("#137752")

const width = 300
const height = 20
const string = "Lorem ipsum dolor"
const font = "12px FiraCode-Regular"
const textCtx = document.createElement("canvas").getContext("2d", {alpha: false});
textCtx.canvas.width  = width;
textCtx.canvas.height = height;
textCtx.font = font;
textCtx.textAlign = "center";
textCtx.textBaseline = "middle";
textCtx.fillStyle = "white";
textCtx.fillRect(0, 0, width, height);
textCtx.fillStyle = "black";
textCtx.fillText(string, width / 2, height / 2);

document.body.appendChild(textCtx.canvas)

const refCtx = document.createElement("canvas").getContext("2d", {alpha: false});
refCtx.canvas.width  = width;
refCtx.canvas.height = height;
refCtx.font = font;
refCtx.textAlign = "center";
refCtx.textBaseline = "middle";
refCtx.fillStyle = rgbString(...backgroundColor);
refCtx.fillRect(0, 0, width, height);
refCtx.fillStyle = rgbString(...foregroundColor);
refCtx.fillText(string, width / 2, height / 2);

document.body.appendChild(refCtx.canvas)

const gl = document.createElement("canvas").getContext("webgl");
gl.canvas.width = textCtx.canvas.width
gl.canvas.height = textCtx.canvas.height

const vertexShaderSource = `
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_matrix;

varying vec2 v_texcoord;

void main() {
   gl_Position = u_matrix * a_position;
   v_texcoord = a_texcoord;
}
`

const fc = foregroundColor.map(f => f / 255)
const bc = backgroundColor.map(f => f / 255)

const fragmentShaderPass1 = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main() {
  vec3 textColor = vec3(${fc[0]}, ${fc[1]}, ${fc[2]});
  vec3 a = texture2D(u_texture, v_texcoord).rgb;
  a = mix(vec3(1.0) - a, sqrt(vec3(1.0) - a * a), textColor);
  gl_FragColor = vec4(a, 1.0);
}
`

const fragmentShaderPass2 = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main() {
  vec3 textColor = vec3(${fc[0]}, ${fc[1]}, ${fc[2]});
  vec3 a = texture2D(u_texture, v_texcoord).rgb;
  a = mix(vec3(1.0) - a, sqrt(vec3(1.0) - a * a), textColor);
  gl_FragColor = vec4(textColor, 1.0) * vec4(a, 1.0);
}
`

gl.enable(gl.BLEND);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(bc[0], bc[1], bc[2], 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const program1 = createProgram(gl, vertexShaderSource, fragmentShaderPass1);
gl.useProgram(program1);
gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
draw(gl, program1)

const program2 = createProgram(gl, vertexShaderSource, fragmentShaderPass2);
gl.useProgram(program2);
gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
gl.drawArrays(gl.TRIANGLES, 0, 6);
draw(gl, program2)



function createProgram (gl, vertexShaderSource, fragmentShaderSource) {
  const program = gl.createProgram();
  if (vertexShaderSource) gl.attachShader(program, createShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
  if (fragmentShaderSource) gl.attachShader(program, createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);
  return program
}

function createShader (gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader
}

function draw (gl, program) {
  const canvasTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, canvasTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCtx.canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

  // lookup uniforms
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const textureLocation = gl.getUniformLocation(program, "u_texture");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1
  ])
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  const texcoords = new Float32Array([
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1
  ])
  gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.enableVertexAttribArray(texcoordLocation);
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

  let matrix = orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

  // this matrix will translate our quad to dstX, dstY
  matrix = translate(matrix, 0, 0, 0);

  // this matrix will scale our 1 unit quad
  // from 1 unit to texWidth, texHeight units
  matrix = scale(matrix, width, height, 1);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  // Tell the shader to get the texture from texture unit 0
  gl.uniform1i(textureLocation, 0);

  // draw the quad (2 triangles, 6 vertices)
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

document.body.appendChild(gl.canvas)
