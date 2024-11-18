"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, DragControls, Box, RoundedBox, ContactShadows, AccumulativeShadows, Grid } from '@react-three/drei';
import { PointerEvents, XR, createXRStore, noEvents } from '@react-three/xr';
import { GridHelper, Mesh, PointLight, Ray, Vector3 } from 'three';
import { Suspense, useRef, useState } from 'react';
import { Physics, RigidBody } from '@react-three/rapier';
import DraggableRigidBody from '@/helpers/DraggableRigidBody';
import { DraggableRigidBodyProps } from '@/helpers/DraggableRigidBody';
import { Button } from '@/components/ui/button';
const store = createXRStore({
  hand: {
    grabPointer: true,
    rayPointer: false,
    touchPointer: false,
  },
  secondaryInputSources: true,

  controller: {
    rayPointer: true,
    grabPointer: true,
  },
})

// Beggingin of the Project //////////////////////////////////////////////
export default function XRPage() {
  return (
    <>
      Empty Page
    </>
  );
}
