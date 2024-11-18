import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGesture, DragConfig } from '@use-gesture/react'
import { ForwardRefComponent } from '@react-three/drei/helpers/ts-utils'

const initialModelPosition = new THREE.Vector3()
const mousePosition2D = new THREE.Vector2()
const mousePosition3D = new THREE.Vector3()
const dragOffset = new THREE.Vector3()
const dragPlaneNormal = new THREE.Vector3()
const dragPlane = new THREE.Plane()

type ControlsProto = {
  enabled: boolean
}

export type CustomDragControlsProps = {
  /** If autoTransform is true, automatically apply the local transform on drag, true */
  autoTransform?: boolean
  /** The matrix to control */
  matrix?: THREE.Matrix4
  /** Lock the drag to a specific axis */
  axisLock?: 'x' | 'y' | 'z'
  /** Limits */
  dragLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
  /** Hover event */
  onHover?: (hovering: boolean) => void
  /** Drag start event */
  onDragStart?: (origin: THREE.Vector3) => void
  /** Drag event */
  onDrag?: (
    localMatrix: THREE.Matrix4,
    deltaLocalMatrix: THREE.Matrix4,
    worldMatrix: THREE.Matrix4,
    deltaWorldMatrix: THREE.Matrix4
  ) => void /** Drag end event */
  onDragEnd?: () => void
  children: React.ReactNode
  dragConfig?: DragConfig
  preventOverlap?: boolean /** If preventOverlap is true, other overlapping CustomDragControls will not be dragged*/
}

export const CustomDragControls: ForwardRefComponent<CustomDragControlsProps, THREE.Group> = React.forwardRef<
  THREE.Group,
  CustomDragControlsProps
>(
  (
    {
      autoTransform = true,
      matrix,
      axisLock,
      dragLimits,
      onHover,
      onDragStart,
      onDrag,
      onDragEnd,
      children,
      dragConfig,
      ...props
    },
    fRef
  ) => {
    const defaultControls = useThree((state) => (state as any).controls) as ControlsProto | undefined
    const { camera, size, raycaster, invalidate } = useThree()
    const ref = React.useRef<THREE.Group>(null!)

    const bind = useGesture(
      {
        onHover: ({ hovering }) => onHover && onHover(hovering ?? false),
        // onDragStart: ({ event }) => {
        //   console.log('onDragStart', event);
        //   // if (defaultControls) defaultControls.enabled = false
        //   const { point } = event as any

        //   ref.current.matrix.decompose(initialModelPosition, new THREE.Quaternion(), new THREE.Vector3())

        //   console.log('> point', point);
        //   console.log('> initialModelPosition', initialModelPosition);

        //   // mousePosition3D.copy(point)
        //   // dragOffset.copy(mousePosition3D).sub(initialModelPosition)

        //   // onDragStart && onDragStart(initialModelPosition)
        //   // invalidate()
        // },
        onPointerDown: ({ event }) => {
          console.log('onPointerDown', event);

          // if (defaultControls) defaultControls.enabled = false

          const { point } = event as any

          ref.current.matrix.decompose(initialModelPosition, new THREE.Quaternion(), new THREE.Vector3())

          // mousePosition3D.copy(point)
          dragOffset.copy(mousePosition3D).sub(initialModelPosition)

          onDragStart && onDragStart(initialModelPosition)

          // invalidate()
        },
        // onDrag: ({ xy: [dragX, dragY], intentional, event }) => {
        //   // if (!intentional) return

        //   // if (props.preventOverlap === true) {
        //   //   event.stopPropagation();
        //   // }

        //   // const normalizedMouseX = ((dragX - size.left) / size.width) * 2 - 1
        //   // const normalizedMouseY = -((dragY - size.top) / size.height) * 2 + 1

        //   // mousePosition2D.set(normalizedMouseX, normalizedMouseY)
        //   // raycaster.setFromCamera(mousePosition2D, camera)

        //   // if (!axisLock) {
        //   //   camera.getWorldDirection(dragPlaneNormal).negate()
        //   // } else {
        //   //   switch (axisLock) {
        //   //     case 'x':
        //   //       dragPlaneNormal.set(1, 0, 0)
        //   //       break
        //   //     case 'y':
        //   //       dragPlaneNormal.set(0, 1, 0)
        //   //       break
        //   //     case 'z':
        //   //       dragPlaneNormal.set(0, 0, 1)
        //   //       break
        //   //   }
        //   // }

        //   // dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, mousePosition3D)
        //   // raycaster.ray.intersectPlane(dragPlane, mousePosition3D)

        //   // const previousLocalMatrix = ref.current.matrix.clone()
        //   // const previousWorldMatrix = ref.current.matrixWorld.clone()

        //   // const intendedNewPosition = new THREE.Vector3(
        //   //   mousePosition3D.x - dragOffset.x,
        //   //   mousePosition3D.y - dragOffset.y,
        //   //   mousePosition3D.z - dragOffset.z
        //   // )

        //   // if (dragLimits) {
        //   //   intendedNewPosition.x = dragLimits[0]
        //   //     ? Math.max(Math.min(intendedNewPosition.x, dragLimits[0][1]), dragLimits[0][0])
        //   //     : intendedNewPosition.x
        //   //   intendedNewPosition.y = dragLimits[1]
        //   //     ? Math.max(Math.min(intendedNewPosition.y, dragLimits[1][1]), dragLimits[1][0])
        //   //     : intendedNewPosition.y
        //   //   intendedNewPosition.z = dragLimits[2]
        //   //     ? Math.max(Math.min(intendedNewPosition.z, dragLimits[2][1]), dragLimits[2][0])
        //   //     : intendedNewPosition.z
        //   // }

        //   // if (autoTransform) {
        //   //   ref.current.matrix.setPosition(intendedNewPosition)

        //   //   const deltaLocalMatrix = ref.current.matrix.clone().multiply(previousLocalMatrix.invert())
        //   //   const deltaWorldMatrix = ref.current.matrix.clone().multiply(previousWorldMatrix.invert())

        //   //   onDrag && onDrag(ref.current.matrix, deltaLocalMatrix, ref.current.matrixWorld, deltaWorldMatrix)
        //   // } else {
        //   //   const tempMatrix = new THREE.Matrix4().copy(ref.current.matrix)
        //   //   tempMatrix.setPosition(intendedNewPosition)

        //   //   const deltaLocalMatrix = tempMatrix.clone().multiply(previousLocalMatrix.invert())
        //   //   const deltaWorldMatrix = tempMatrix.clone().multiply(previousWorldMatrix.invert())

        //   //   onDrag && onDrag(tempMatrix, deltaLocalMatrix, ref.current.matrixWorld, deltaWorldMatrix)
        //   // }

        //   // console.log('> dpoint', mousePosition3D);

        //   // invalidate()
        // },
        onPointerMove: ({ event }) => {
          const point = event?.point as any
          console.log('> ppoint', event);

          if (!point) return



          mousePosition3D.copy(point)


          const previousLocalMatrix = ref.current.matrix.clone()
          const previousWorldMatrix = ref.current.matrixWorld.clone()


          const intendedNewPosition = new THREE.Vector3(
            mousePosition3D.x - dragOffset.x,
            mousePosition3D.y - dragOffset.y,
            mousePosition3D.z - dragOffset.z
          )

          if (dragLimits) {
            intendedNewPosition.x = dragLimits[0]
              ? Math.max(Math.min(intendedNewPosition.x, dragLimits[0][1]), dragLimits[0][0])
              : intendedNewPosition.x
            intendedNewPosition.y = dragLimits[1]
              ? Math.max(Math.min(intendedNewPosition.y, dragLimits[1][1]), dragLimits[1][0])
              : intendedNewPosition.y
            intendedNewPosition.z = dragLimits[2]
              ? Math.max(Math.min(intendedNewPosition.z, dragLimits[2][1]), dragLimits[2][0])
              : intendedNewPosition.z
          }

          if (autoTransform) {
            ref.current.matrix.setPosition(intendedNewPosition)

            const deltaLocalMatrix = ref.current.matrix.clone().multiply(previousLocalMatrix.invert())
            const deltaWorldMatrix = ref.current.matrix.clone().multiply(previousWorldMatrix.invert())

            onDrag && onDrag(ref.current.matrix, deltaLocalMatrix, ref.current.matrixWorld, deltaWorldMatrix)
          } else {
            const tempMatrix = new THREE.Matrix4().copy(ref.current.matrix)
            tempMatrix.setPosition(intendedNewPosition)

            const deltaLocalMatrix = tempMatrix.clone().multiply(previousLocalMatrix.invert())
            const deltaWorldMatrix = tempMatrix.clone().multiply(previousWorldMatrix.invert())

            onDrag && onDrag(tempMatrix, deltaLocalMatrix, ref.current.matrixWorld, deltaWorldMatrix)
          }

          event.stopPropagation();



          invalidate()
        },
        // onDragEnd: () => {
        //   // if (defaultControls) defaultControls.enabled = true

        //   // onDragEnd && onDragEnd()
        //   // invalidate()
        // },
        onPointerUp: ({ event }) => {
          // if (defaultControls) defaultControls.enabled = true


          onDragEnd && onDragEnd()

          // event.stopPropagation();
          invalidate()
        },
        // onPointerLeave: ({ event }) => {
        //   // if (defaultControls) defaultControls.enabled = true

        //   onDragEnd && onDragEnd()
        //   invalidate()
        //   event.stopPropagation();
        // }
      },
      {
        drag: {
          // filterTaps: true,
          threshold: 1,
          ...(typeof dragConfig === 'object' ? dragConfig : {}),
        },
      }
    )

    React.useImperativeHandle(fRef, () => ref.current, [])

    React.useLayoutEffect(() => {
      if (!matrix) return

      // If the matrix is a real matrix4 it means that the user wants to control the gizmo
      // In that case it should just be set, as a bare prop update would merely copy it
      ref.current.matrix = matrix
    }, [matrix])

    return (
      <>
        <group ref={ref} {...(bind() as any)} matrix={matrix} matrixAutoUpdate={false} {...props}>
          {children}

        </group>

        <PointerIndicator />
      </>
    )
  }
)

function PointerIndicator() {

  const ref = React.createRef<THREE.Group>()


  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(mousePosition3D)
    }
  })

  return (
    <group ref={ref}>
      {/* disable pointer events and interactions */}
      <mesh position={[0.1, 0, 0]} >
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  )
}