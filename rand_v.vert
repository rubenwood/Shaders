// VS input
attribute vec4 position;
attribute vec4 uv0;

varying vec4 color;

varying vec3 N;
varying vec3 v;

varying vec4 oUv0;

void main(){
	// https://www.youtube.com/watch?v=-tonZsbHty8#aid=P8Xs_WR4zIw
	// http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/

	//color = position;
	//color = gl_ModelViewMatrix * position; //
	//color = gl_ModelViewProjectionMatrix * position; //
	//color = gl_ProjectionMatrix * position; // 

	//gl_Position = gl_ModelViewProjectionMatrix * position;

	oUv0 = uv0;
	v = vec3(gl_ModelViewMatrix * gl_Vertex);
	N = normalize(gl_NormalMatrix * gl_Normal);

	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;

	
}