import type { WritableGrain } from "@grainular/grains";
import { add, cross, normalize, scale, type Vector3 } from "@photon/core";
import { Projection, type Camera } from "@photon/renderer";
import { directionFromYawPitch, yawPitchFromDirection } from "./orientation.ts";

const DEFAULT_UP: Vector3 = [0, 1, 0];
const MOVE_SPEED = 5;
const FAST_MOVE_MULTIPLIER = 3;
const LOOK_SENSITIVITY = 0.002;
const MIN_ORTHOGRAPHIC_SCALE = 0.01;
const MAX_ORTHOGRAPHIC_SCALE = 100_000;
const ZOOM_SENSITIVITY = 0.001;

type Movement = {
  readonly forward: number;
  readonly right: number;
};

const NAVIGATION_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft"]);

const cameraAxes = (camera: Camera) => {
  const forward = normalize(camera.direction);
  const right = normalize(cross(forward, camera.up ?? DEFAULT_UP));
  const up = cross(right, forward);

  return { forward, right, up };
};

const normalizeMovement = ({ forward, right }: Movement): Movement => {
  const length = Math.hypot(forward, right);

  return length > 1 ? { forward: forward / length, right: right / length } : { forward, right };
};

const moveCamera = (camera: Camera, movement: Movement, distance: number): Camera => {
  const normalizedMovement = normalizeMovement(movement);
  const axes = cameraAxes(camera);
  const verticalAxis = camera.projection === Projection.Orthographic ? axes.up : axes.forward;
  const offset = add(
    scale(verticalAxis, normalizedMovement.forward * distance),
    scale(axes.right, normalizedMovement.right * distance),
  );

  return { ...camera, position: add(camera.position, offset) };
};

export const createCameraNavigation = (camera: WritableGrain<Camera>) => {
  let yawPitch = yawPitchFromDirection(camera().direction);
  const pressedKeys = new Set<string>();

  const getMovement = (): Movement => ({
    forward: Number(pressedKeys.has("KeyW")) - Number(pressedKeys.has("KeyS")),
    right: Number(pressedKeys.has("KeyD")) - Number(pressedKeys.has("KeyA")),
  });

  return (canvas: HTMLCanvasElement) => {
    let locked = false;
    let animationFrame: number | undefined;
    let previousFrameTime: number | undefined;

    const stopMovement = () => {
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }

      previousFrameTime = undefined;
      pressedKeys.clear();
    };

    const updateMovement = (time: number) => {
      if (!locked) {
        return;
      }

      const elapsedSeconds = Math.min((time - (previousFrameTime ?? time)) / 1000, 0.1);
      previousFrameTime = time;
      const movement = getMovement();

      if (movement.forward !== 0 || movement.right !== 0) {
        const speedMultiplier = pressedKeys.has("ShiftLeft") ? FAST_MOVE_MULTIPLIER : 1;
        camera.update((current) =>
          moveCamera(current, movement, MOVE_SPEED * speedMultiplier * elapsedSeconds),
        );
      }

      animationFrame = requestAnimationFrame(updateMovement);
    };

    const onPointerLockChange = () => {
      locked = document.pointerLockElement === canvas;

      if (locked) {
        previousFrameTime = undefined;
        animationFrame = requestAnimationFrame(updateMovement);
      } else {
        stopMovement();
      }
    };

    const onClick = () => {
      if (!locked) {
        void canvas.requestPointerLock();
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!locked) {
        return;
      }

      yawPitch = {
        yawRadians: yawPitch.yawRadians - event.movementX * LOOK_SENSITIVITY,
        pitchRadians: yawPitch.pitchRadians - event.movementY * LOOK_SENSITIVITY,
      };
      camera.update((current) => ({ ...current, direction: directionFromYawPitch(yawPitch) }));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!locked || !NAVIGATION_KEYS.has(event.code)) {
        return;
      }

      if (event.code.startsWith("Key")) {
        event.preventDefault();
      }
      pressedKeys.add(event.code);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (NAVIGATION_KEYS.has(event.code)) {
        pressedKeys.delete(event.code);
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!locked || camera().projection !== Projection.Orthographic) {
        return;
      }

      event.preventDefault();
      camera.update((current) => {
        if (current.projection !== Projection.Orthographic) {
          return current;
        }

        return {
          ...current,
          orthographicScale: Math.min(
            Math.max(
              current.orthographicScale * Math.exp(event.deltaY * ZOOM_SENSITIVITY),
              MIN_ORTHOGRAPHIC_SCALE,
            ),
            MAX_ORTHOGRAPHIC_SCALE,
          ),
        };
      });
    };

    const onBlur = () => pressedKeys.clear();

    const unsubscribeCamera = camera.subscribe((value) => {
      yawPitch = yawPitchFromDirection(value.direction);
    });

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      stopMovement();
      unsubscribeCamera();
      canvas.classList.remove("cursor-none");
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  };
};
