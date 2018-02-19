attribute vec4 position;

//varying vec3 normal;

uniform vec4 v1;
uniform float m1;
uniform float time;

void main(){
	//normal = gl_NormalMatrix * gl_Normal;

	//gl_Position = position;
	//gl_Position = gl_Vertex;
	//gl_Position = gl_ModelViewMatrix * gl_Vertex;
	//gl_Position = gl_ProjectionMatrix * gl_Vertex;
	//gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
	
	//ftransform
	//vec4 pos = ftransform();

	gl_Position =  gl_ModelViewProjectionMatrix * gl_Vertex * v1;
	//gl_Position = gl_ModelViewMatrix * ftransform();
	//gl_Position = gl_ProjectionMatrix * ftransform();
	//gl_Position = gl_ModelViewProjectionMatrix * ftransform();
}