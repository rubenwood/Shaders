uniform int multiplicationFactor = 8;
uniform float threshold = 0.1;
uniform vec3 colour;
 
varying vec2 texCoordV;
vec4 colorOut;
 
void main() {
    // multiplicationFactor scales the number of stripes
    vec2 t = texCoordV * multiplicationFactor ;
 
    // the threshold constant defines the with of the lines
    if (fract(t.s) < threshold  || fract(t.t) < threshold ){
        colorOut = vec4(colour, 1.0);
    }
    else{
        discard;
    }

    gl_FragColor = colorOut;
}