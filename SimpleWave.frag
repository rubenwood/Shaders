#ifdef GL_ES
precision mediump float;
#endif
#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
varying vec2 surfacePosition;

void main( void ) {
    
    vec2 p = surfacePosition; 
    
    vec3 destColor = vec3(0.0);
    
    for(float i = 5.0; i < 27.0; ++i){
        float s = time * i / 50.0;
        vec2 q = p + vec2(cos(s),sin(s*2.7)) * 0.5;
        destColor += 0.001 / length(q * 0.27 );
    };
    
    gl_FragColor = vec4(destColor, 15.0);
}