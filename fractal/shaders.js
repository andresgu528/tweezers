export const shader = /*wgsl*/ `
const tol: f32 = 1e-6;
//const scale: f32 = 0.001;
const scale: f32 = 1;
const niter: u32 = 48;
//const tr: vec2f = vec2f(0.85009, -0.653);
const tr: vec2f = vec2f(0, 0);
struct NewtonMethodOutput {
  root: vec2f,
  iter: u32,
  valid: bool
};
fn cmult(a: vec2f, b: vec2f) -> vec2f {
  return vec2f(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
};
fn cdiv(a: vec2f, b: vec2f) -> vec2f {
  let lb = length(b);
  return cmult(a, vec2(b.x, -b.y))/(lb*lb);
};
fn f(x: vec2f) -> vec2f {
  //return cmult(cmult(x, x), x) - vec2f(1, 0);
  return cmult(cmult(cmult(x, x), x), cmult(x, x)) - vec2f(1, 0);
}
fn df(x: vec2f) -> vec2f {
  //return 3 * cmult(x, x);
  return 5 * cmult(cmult(x, x), cmult(x, x));
}
fn newtonMethod(x: vec2f) -> NewtonMethodOutput {
  var result: NewtonMethodOutput;
  var prev: vec2f; 
  var delta: vec2f;
  result.root = x;
  result.iter = 0;
  result.valid = false;
  for (var i: u32 = 0; i<niter; i++) {
    prev = result.root;
    if (length(f(prev))<tol) {
      result.iter = i;
      result.valid = true;
      return result;
    } else {
      delta = - cdiv(f(prev),df(prev));
      result.root = prev + delta;
    }
  }
  result.iter = niter;
  return result;
};
struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) clippos: vec2f
};
@group(0) @binding(0) var<uniform> dimensions: vec3f;
@vertex fn vs(
  @builtin(vertex_index) vertexIndex: u32
) -> VSOut {
  const square: array<vec2f, 6> = array<vec2f, 6>(
    vec2f(-1, -1),
    vec2f(1, -1),
    vec2f(-1, 1),
    vec2f(1, 1),
    vec2f(-1, 1),
    vec2f(1, -1)
  );
  var vsOut: VSOut;
  vsOut.pos = vec4f(square[vertexIndex], 0, 1);
  vsOut.clippos = square[vertexIndex];
  return vsOut;
}
@fragment fn fs(
  vsOut: VSOut
) -> @location(0) vec4f {
  //let ang: f32 = -18/360.0*2*3.14159265358979;
  let ang: f32 = dimensions.z;
  let transf: vec2f = mat2x2f(cos(ang), -sin(ang), sin(ang), cos(ang))*vec2f(vsOut.clippos.x*dimensions.x/dimensions.y*scale, vsOut.clippos.y*scale);
  let transf2: vec2f = (transf+tr);
  //let t = log2(f32(newtonMethod(transf).iter+1)) / log2(f32(niter+1));
  let t = f32(newtonMethod(transf2).iter) / f32(niter);
  return mix(vec4f(0, 0, 0, 1), vec4f(1, 1, 1, 1), t);
  //return vec4f(viridis_approx(t), 1);
}
`