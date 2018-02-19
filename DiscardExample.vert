//uniform mat4 pvm;
 
attribute vec4 position;
attribute vec2 texCoord;
 
varying vec2 texCoordV;
 
void main() { 
    texCoordV = gl_TexCoord[0];
    gl_Position = ftransform();
}