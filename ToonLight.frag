#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float sphere(vec3 p){
    float d = length(p);
	
	float r = 1.0;
	
	return d-r;
}

float raymatching(vec3 viewPos,vec3 viewDir){
    float distance = 1.0;
	float d = 0.0;
	
	for(int i = 0;i<64;i++){
		
		vec3 p = viewPos + viewDir*distance;
	
	        d = sphere(p);
		
		distance+=d;
		
	}
   
	return distance;
	
}

vec3 normal(vec3 p){
    const vec2 e = vec2(0.01,0);
	
	vec3 nDir = vec3(
	    sphere(p+e.xyy)-sphere(p),
		sphere(p+e.yxy)-sphere(p),
		sphere(p+e.yyx)-sphere(p)
	);
	return normalize(nDir);	
}

uniform vec3 lightPos;
uniform vec3 test;

void main() {
	vec2 r = resolution;
    vec2 uv = (gl_FragCoord.xy+gl_FragCoord.xy-r)/r.y;     //将uv的坐标转换为-1·1
	
	vec3 viewPos = vec3(0,0,-5);      //构建相机的位置
	
	vec3 viewDir = normalize(vec3(uv,2));   //构建视向量
	
	float dis = raymatching(viewPos,viewDir);
	
	vec3 surface = viewPos+viewDir*dis;
	
	vec3 nDir = normal(surface); //surface
	
	vec3 lDir = normalize(lightPos);
	
	float diff = max(0.,dot(lDir,nDir));
	diff+=floor(diff*0.9+0.5);
	
	if(dis<60.0){
	
		gl_FragColor = vec4(0,1,1,1)*diff;
	
	}

	//gl_FragColor = vec4(uv,0,1);
}