uniform vec3 inCol;
uniform float multiplier;
uniform float divisor;
varying vec4 pos;
uniform int lightNum;

//Other
uniform float time;
varying vec3 normal;
uniform float m1;
uniform vec4 v1;

void main()
{
	float intensity;
	vec4 color;
	intensity = dot(vec3(gl_LightSource[lightNum].position),normalize(normal)) * multiplier;

	if (intensity > 0.95)
		color = vec4(inCol.x/(divisor/5),inCol.y/(divisor/5),inCol.z/(divisor/5),1.0);
	else if (intensity > 0.75)
		color = vec4(inCol.x/(divisor/4),inCol.y/(divisor/4),inCol.z/(divisor/4),1.0);
	else if (intensity > 0.5)
		color = vec4(inCol.x/(divisor/3),inCol.y/(divisor/3),inCol.z/(divisor/3),1.0);
	else if (intensity > 0.25)
		color = vec4(inCol.x/(divisor/2),inCol.y/(divisor/2),inCol.z/(divisor/2),1.0);
	else
		color = vec4(inCol.x/divisor,inCol.y/divisor,inCol.z/divisor,1.0);
	
	// Other
	vec4 newCol;
	if(pos.x > v1.x && pos.y > v1.y && pos.x < v1.z && pos.y < v1.w)
	{
		newCol = vec4(cos(pos.x)*time/10.0,cos(pos.y),sin(pos.z)*time/10.0,1.0);
	}else{
		newCol=color;
	}

	
	gl_FragColor = newCol;
}