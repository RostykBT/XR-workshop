"use client";

import * as THREE from 'three'
import { RefObject, Suspense, useRef, useState } from 'react'
import { Canvas, extend, useThree, useFrame, GroupProps } from '@react-three/fiber'
import { BallCollider, CuboidCollider, Physics, useRopeJoint, useSphericalJoint, RigidBody } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { XR, createXRStore, useXRInputSourceStateContext, XRSpace, XRHandModel, PointerCursorModel, defaultTouchPointerOpacity, useTouchPointer, useXRInputSourceStates, useXRInputSourceState } from '@react-three/xr';
import { Environment, useGLTF } from '@react-three/drei';

extend({ MeshLineGeometry, MeshLineMaterial })


const leftHandQuaternionHelper = new THREE.Quaternion()
const rightHandQuaternionHelper = new THREE.Quaternion()



const leftHandPointerHelper = new THREE.Vector3()
const rightHandPointerHelper = new THREE.Vector3()

let rightHandActivePointerId: number | null = null
let leftHandActivePointerId: number | null = null


interface DraggableProps extends GroupProps {

}


export function HandInteractions() {
    const leftHandState = useXRInputSourceState('hand', 'left')
    const rightHandState = useXRInputSourceState('hand', 'right')

    useFrame((state, delta) => {

        if (leftHandState && leftHandState.object) {
            console.log(leftHandState.object)
            leftHandQuaternionHelper.copy(leftHandState.object.getWorldQuaternion(leftHandQuaternionHelper))
        }

        if (rightHandState && rightHandState.object) {
            console.log(rightHandState.object)
            rightHandQuaternionHelper.copy(rightHandState.object.getWorldQuaternion(rightHandQuaternionHelper))
        }

    })

    return null
}


export function Draggable(props: DraggableProps) {

    const currentPointerPosition = useRef<THREE.Vector3>(new THREE.Vector3())


    const initialPointerPositionOffset = useRef<THREE.Vector3>(new THREE.Vector3())
    const initialPointerRotationOffset = useRef<THREE.Quaternion>(new THREE.Quaternion())



    const card = useRef()
    const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3() // prettier-ignore
    const [dragged, drag] = useState(false)

    const pointerIndicatorRef = useRef<THREE.Group>(null)
    const pointerIdRef = useRef<number | null>(null)



    useFrame((state, delta, xrstate) => {



        if (dragged) {
            // console.log(state)
            // console.log(xrstate)

            const currentPointerQuaternion = new THREE.Quaternion()


            if (pointerIdRef.current === leftHandActivePointerId) {

                currentPointerQuaternion.copy(leftHandQuaternionHelper)
                console.log("left", currentPointerQuaternion)

            } else if (pointerIdRef.current === rightHandActivePointerId) {

                currentPointerQuaternion.copy(rightHandQuaternionHelper)
                console.log("right", currentPointerQuaternion)
            } else {
                console.log("no pointer id")
            }

            // console.log(pointerHelper)

            // pointerHelper.applyQuaternion(quaternionHelper)

            // console.log(card.current)





            // const targetRotation = new THREE.Quaternion().copy(currentPointerQuaternion).multiply(initialPointerRotationOffset.current)

            // const rotatedOffset = new THREE.Vector3().copy(initialPointerPositionOffset.current)

            // rotatedOffset.applyQuaternion(targetRotation)

            // const targetPosition = new THREE.Vector3().copy(new THREE.Vector3(0, 4, 0)).sub(new THREE.Vector3(0, 3, 0)).sub(initialPointerPositionOffset.current)


            // Rotate target position by the target rotation
            // targetPosition.applyQuaternion(targetRotation)





            const targetPosition = new THREE.Vector3().copy(currentPointerPosition.current)
            const targetRotation = new THREE.Quaternion().copy(currentPointerQuaternion).multiply(initialPointerRotationOffset.current)

            // @ts-expect-error weird remapping in the library
            card.current.setRotation({
                x: targetRotation.x,
                y: targetRotation.y,
                z: targetRotation.z,
                w: targetRotation.w
            })

            // @ts-expect-error weird remapping in the library
            card.current.setTranslation({
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z
            })



        }

        // pointerIndicatorRef.current?.position.copy(initialPointerPositionOffset.current)
        // pointerIndicatorRef.current?.quaternion.copy(initialPointerRotationOffset.current)


        pointerIndicatorRef.current?.position.copy(currentPointerPosition.current)

        // if (fixed.current) {
        //     // Calculate catmul curve      
        //     curve.points[0].copy(j3.current.translation())
        //     curve.points[1].copy(j2.current.translation())
        //     curve.points[2].copy(j1.current.translation())
        //     curve.points[3].copy(fixed.current.translation())
        //     band.current.geometry.setPoints(curve.getPoints(32))
        //     // Tilt it back towards the screen
        //     ang.copy(card.current.angvel())
        //     rot.copy(card.current.rotation())
        //     card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
        // }
    })

    return (
        <>
            <group {...props}

                onPointerUp={(e) => {
                    if (!e.target) return

                    // @ts-expect-error weird remapping in the library
                    e.target.releasePointerCapture(e.pointerId);
                    drag(false)
                }}

                onPointerDown={(e) => {

                    if (!card.current) return
                    if (!e.target) return

                    pointerIdRef.current = e.pointerId

                    console.log(">", e.nativeEvent)
                    console.log(">>", e.pointerType)

                    // @ts-expect-error weird remapping in the library
                    const nativeEvent: XRInputSourceEvent = e.nativeEvent as XRInputSourceEvent


                    // @ts-expect-error weird remapping in the library
                    const objectPosition: THREE.Vector3 = new THREE.Vector3().copy(card.current.translation())

                    // @ts-expect-error weird remapping in the library
                    const objectQuaternion: THREE.Quaternion = new THREE.Quaternion().copy(card.current.rotation())

                    if (nativeEvent?.inputSource?.handedness === 'left') {
                        leftHandActivePointerId = e.pointerId
                        console.log("left", e.pointerId)

                        initialPointerRotationOffset.current.copy(new THREE.Quaternion().copy(leftHandQuaternionHelper).invert().multiply(objectQuaternion))

                    } else if (nativeEvent?.inputSource?.handedness === 'right') {
                        rightHandActivePointerId = e.pointerId
                        console.log("right", e.pointerId)

                        initialPointerRotationOffset.current.copy(new THREE.Quaternion().copy(rightHandQuaternionHelper).invert().multiply(objectQuaternion))

                    }

                    // @ts-expect-error weird remapping in the library
                    e.target.setPointerCapture(e.pointerId);

                    drag(true)
                    // console.log(e)

                    const pointInLocalSpace = new THREE.Vector3().copy(e.point).sub(objectPosition).applyQuaternion(objectQuaternion.clone().invert())


                    initialPointerPositionOffset.current.copy(new THREE.Vector3().copy(pointInLocalSpace).sub(objectPosition))

                }}

                onPointerMove={(e) => {

                    // @ts-expect-error weird remapping in the library

                    const nativeEvent: XRInputSourceEvent = e.nativeEvent as XRInputSourceEvent

                    const object = e.object as THREE.Object3D

                    if (nativeEvent?.inputSource?.handedness === 'left') {
                        leftHandActivePointerId = e.pointerId

                        // Update the pointer position
                        leftHandPointerHelper.copy(e.point)
                        leftHandQuaternionHelper.copy(e.object.getWorldQuaternion(leftHandQuaternionHelper))

                        // console.log("left", e.pointerId)
                    } else if (nativeEvent?.inputSource?.handedness === 'right') {
                        rightHandActivePointerId = e.pointerId
                        // console.log("right", e.pointerId)

                        // Update the pointer position
                        rightHandPointerHelper.copy(e.point)
                        rightHandQuaternionHelper.copy(e.object.getWorldQuaternion(rightHandQuaternionHelper))
                    }


                    // console.log(e.point)
                    // console.log(e.target)

                    currentPointerPosition.current.set(e.point.x, e.point.y, e.point.z)

                    // const pointerInLocalSpace = new THREE.Vector3().copy(e.point).sub(object.position).applyQuaternion(object.quaternion.clone().invert())

                    // console.log(pointerInLocalSpace)

                    // currentPointerPosition.current.copy(pointerInLocalSpace)


                }

                }

                onPointerLeave={(e) => {
                    drag(false)
                }}
            >
                {/* Pointer Indicator */}

                {/* @ts-expect-error weird remapping in the library */}
                <RigidBody position={[2, 0, 0]} ref={card} colliders={'hull'} angularDamping={2} linearDamping={2} type={dragged ? 'kinematicPosition' : 'dynamic'} >
                    {/* {dragged && <mesh position={dragged}>
                        <sphereGeometry args={[0.02]} />
                        <meshBasicMaterial color="blue" />
                    </mesh>} */}
                    <group>
                        {props.children}
                    </group>

                    <group ref={pointerIndicatorRef}>
                        {/* <mesh position={[0, 0.3, 0]} >
                            <coneGeometry args={[0.05, 0.2]} />
                            <meshBasicMaterial color="red" />
                        </mesh> */}
                    </group>




                    {/* <mesh
                        onPointerUp={(e) => {
                            console.log(e)
                            e.target.releasePointerCapture(e.pointerId);
                            drag(false)
                        }}
                        onPointerDown={(e) => {
                            e.target.setPointerCapture(e.pointerId);
                            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
                            console.log(e)
                        }
                        }
                        onPointerMove={(e) => {
                            pointerHelper.set(e.point.x, e.point.y, e.point.z)

                        }}
                    >
                        <planeGeometry args={[0.8 * 2, 1.125 * 2]} />
                        <meshBasicMaterial transparent opacity={0.25} color="white" side={THREE.DoubleSide} />
                    </mesh> */}

                </RigidBody >
            </group >

        </>
    )
}

