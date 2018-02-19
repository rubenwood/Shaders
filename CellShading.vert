uniform vec4 light_position;
varying vec4 v_normal;
varying vec4 v_lightdir;
varying vec4 v_eye;

void main()
{
  gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;

  v_normal = gl_ModelViewMatrix  * vec4(gl_Normal.xyz, 0.0);
  vec4 view_vertex = gl_ModelViewMatrix * gl_Vertex;
  v_lightdir = light_position - view_vertex;
  v_eye = -view_vertex;
}