
//
// fire.vert: Vertex shader for producing a fire effect
//
// author: Randi Rost
//
// Copyright (c) 2002: 3Dlabs, Inc.
//

varying float LightIntensity;
varying vec3  MCposition;

//uniform vec3  LightPosition;
uniform int lightNum;
uniform float Scale;

void main(void)
{
    vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;
    MCposition      = vec3 (gl_Vertex) * Scale;
    vec3 tnorm      = normalize(vec3 (gl_NormalMatrix * gl_Normal));
    //LightPosition
    LightIntensity  = dot(normalize(vec3(gl_LightSource[lightNum].position) - vec3 (ECposition)), tnorm) * 1.5;
    gl_Position     = gl_ModelViewProjectionMatrix * gl_Vertex;
}
