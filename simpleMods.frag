uniform vec3 colour;

uniform vec2 resolution;

uniform int useTime;
uniform float time;
uniform float speed;

uniform float scale;

uniform int mode;

uniform int uvPosMode;

uniform int numLights;

void main(){
	float sum = 0;
	float size = resolution.x / scale;

	vec2 position = resolution;

	for(int i = 0; i < numLights; i++){
		// if time is used then manipulate position
		if(useTime > 0){
			float t = (float(1) + time) / speed;
			float c = float(1) * 4.0;
			position.x += sin(3.0 * t + c) * abs(sin(t)+0.2) * resolution.x * 0.2;
			position.y += sin(0.5 * t - c) * abs(cos(t)+0.2) * resolution.y * 0.48;		
		}else{	
			//UV Pos Mode
			if(uvPosMode > 0){ // 1 is relative, 0 is absolute
				position = resolution.xy/2;
			}
		}

		// Shader apply mode
		if(mode == 0){
			sum += size/length(gl_FragCoord.xy - position);
		}else if(mode == 1){
			sum += size/(gl_FragCoord.xy - position);
		}else{
			//sum += length(gl_FragCoord.xy - position);
		}
	}

	gl_FragColor = vec4(sum * colour.x, sum * colour.y, sum * colour.z,1.0);
}
