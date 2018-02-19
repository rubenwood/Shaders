// Playing around with Lissajous curves.
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
//My Uniforms (Controls)
uniform int numParticles;
uniform float posDiv;
uniform float glowIntensity; //resolution divider
uniform float timeDiv;

uniform float mod1;
uniform float mod2;

uniform int mode;

//const int num = 300; // particles

void main() {
    float sum = -mod1;
    float size = resolution.x / glowIntensity;

    for (int i = 0; i < numParticles; i++) {
        vec2 position = resolution / posDiv;
    	float t = (float(i) + time) / timeDiv;
    	float c = float(i) * 4.0;

        if(mode == 0){
            position.x += sin(3.0 * t + c) * abs(sin(t)+mod1) * resolution.x * mod1;
            position.y += sin(mod2 * t - c) * abs(cos(t)+mod1) * resolution.y * (mod2-0.02);
        }else if(mode == 1){
            position.x += cos(3.0 * t + c) * abs(cos(t)+mod1) * resolution.x * mod1;
            position.y += cos(mod2 * t - c) * abs(cos(t)+mod1) * resolution.y * (mod2-0.02);
        }else{
            position.x += tan(3.0 * t + c) * abs(tan(t)+mod1) * resolution.x * mod1;
            position.y += tan(mod2 * t - c) * abs(cos(t)+mod1) * resolution.y * (mod2-0.02);
        }

        sum += size / length(gl_FragCoord.xy - position);
    }

    gl_FragColor = vec4(sum * 0.1, sum * 0.5, sum, 1);
}