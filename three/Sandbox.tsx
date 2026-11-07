"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { Board } from "./Board";
import { DartRig } from "./DartRig";
import { createStageState, type QualityTier, type StageState } from "./state";
import { Lighting } from "./Lighting";
import {
  BULLSEYE_Z,
  CAMERA,
  CAM_HERO_Z,
  CAM_HOLD_Z,
  RING_RADIUS,
  RING_Z,
  dartPath,
} from "@/storyboard/world";

/**
 * Phase 4a sandbox. No scroll anywhere — every value in the storyboard is
 * exposed as a control so the scene can be verified in isolation before
 * Phase 4b wires it to a scroll position. If a pose looks wrong here, it is
 * a geometry bug; if it only looks wrong under scroll, it is a timing bug.
 * Keeping those two failures separable is the entire point of this file.
 */

const BEAT_LABELS = [
  "1 · Styles",
  "2 · Structure",
  "3 · Fit",
  "4 · Signal",
  "5 · Security",
  "6 · Lasts",
];

function CameraRig({
  target,
  orbit,
}: {
  target: number | "bull" | "hero";
  orbit: boolean;
}) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());

  useEffect(() => {
    const z =
      target === "hero"
        ? CAM_HERO_Z
        : target === "bull"
          ? BULLSEYE_Z + 8.8
          : CAM_HOLD_Z[target];
    desired.current.set(0, 0, z);
  }, [target]);

  useFrame((_, dt) => {
    if (orbit) return;
    camera.position.lerp(desired.current, 1 - Math.exp(-6 * dt));
    camera.lookAt(0, 0, desired.current.z - 60);
  });

  return null;
}

export function Sandbox() {
  // Same mutable object the page uses, driven by sliders instead of scroll.
  const stage = useRef(
    createStageState({ telescope: 1, active: 1, clip: 0.6, segments: 0.6, resolve: 0.5 }),
  ).current;
  const [controls, setControls] = useState<StageState>({ ...stage });
  const [camTarget, setCamTarget] = useState<number | "bull" | "hero">(1);
  const [orbit, setOrbit] = useState(false);
  // Flight progress along the spiral. t = i/6 is ring i's impact frame.
  const [flightT, setFlightTState] = useState(1 / 6);
  const setFlightT = (v: number) => {
    stage.dartT = v;
    stage.launch = 1;
    setFlightTState(v);
  };

  const set = <K extends keyof StageState>(k: K, v: StageState[K]) => {
    // Mutate the live object the scene reads, then mirror it into state so
    // the panel re-renders. The scene never waits on React.
    (stage[k] as StageState[K]) = v;
    setControls((c) => ({ ...c, [k]: v }));
  };

  return (
    <div className="relative h-[100svh] w-full bg-void">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far, position: [0, 0, CAM_HOLD_Z[1]] }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Lighting />
        <Board state={stage} />
        <DartRig state={stage} />
        <CameraRig target={camTarget} orbit={orbit} />
        {orbit && <OrbitControls makeDefault enablePan target={[0, 0, RING_Z[2]]} />}
        <Stats className="!left-auto !right-0" />
      </Canvas>

      <Panel
        controls={controls}
        set={set}
        camTarget={camTarget}
        setCamTarget={setCamTarget}
        orbit={orbit}
        setOrbit={setOrbit}
        flightT={flightT}
        setFlightT={setFlightT}
      />
    </div>
  );
}

function Panel({
  controls,
  set,
  camTarget,
  setCamTarget,
  orbit,
  setOrbit,
  flightT,
  setFlightT,
}: {
  controls: StageState;
  set: <K extends keyof StageState>(k: K, v: StageState[K]) => void;
  camTarget: number | "bull" | "hero";
  setCamTarget: (t: number | "bull" | "hero") => void;
  orbit: boolean;
  setOrbit: (b: boolean) => void;
  flightT: number;
  setFlightT: (n: number) => void;
}) {
  return (
    <aside className="absolute top-4 left-4 w-[290px] rounded-xl border border-gunmetal-rim/60 bg-void/92 p-5 text-sm backdrop-blur-md">
      <p className="font-display text-xs tracking-[0.3em] text-aim-mid">
        PHASE 4A · SANDBOX
      </p>

      <Group label="Camera">
        <div className="flex flex-wrap gap-1.5">
          <Chip group="cam" on={camTarget === "hero"} onClick={() => setCamTarget("hero")}>
            Hero
          </Chip>
          {BEAT_LABELS.map((label, i) => (
            <Chip
              key={label}
              group="cam"
              on={camTarget === i}
              onClick={() => setCamTarget(i)}
            >
              {i + 1}
            </Chip>
          ))}
          <Chip group="cam" on={camTarget === "bull"} onClick={() => setCamTarget("bull")}>
            Bull
          </Chip>
        </div>
        <label className="mt-3 flex items-center gap-2 text-faint">
          <input
            type="checkbox"
            checked={orbit}
            onChange={(e) => setOrbit(e.target.checked)}
          />
          Free orbit (inspect geometry)
        </label>
      </Group>

      <Group label="Live ring">
        <div className="flex flex-wrap gap-1.5">
          <Chip group="ring" on={controls.active === null} onClick={() => set("active", null)}>
            none
          </Chip>
          {BEAT_LABELS.map((label, i) => (
            <Chip
              key={label}
              group="ring"
              on={controls.active === i}
              onClick={() => set("active", i)}
            >
              {i + 1}
            </Chip>
          ))}
          <Chip group="ring" on={controls.active === "bull"} onClick={() => set("active", "bull")}>
            Bull
          </Chip>
        </div>
      </Group>

      <Slider
        label="Telescope"
        hint="0 flat board · 1 tunnel"
        value={controls.telescope}
        onChange={(v) => set("telescope", v)}
      />
      <Slider
        label="Ring 2 cut"
        hint="clipping plane sweep"
        value={controls.clip}
        onChange={(v) => set("clip", v)}
      />
      <Slider
        label="Ring 3 segments"
        hint="DTR lights last"
        value={controls.segments}
        onChange={(v) => set("segments", v)}
      />
      <Slider
        label="Ring 4 resolve"
        hint="scatter → trend line"
        value={controls.resolve}
        onChange={(v) => set("resolve", v)}
      />
      <Slider
        label="Ring 5 aperture"
        hint="closes behind you"
        value={controls.aperture}
        onChange={(v) => set("aperture", v)}
      />
      <Slider
        label="Dart flight"
        hint="spiral progress · i/6 = ring i impact"
        value={flightT}
        onChange={setFlightT}
      />

      <Group label="Quality">
        <div className="flex gap-1.5">
          {(["high", "mid", "low"] as QualityTier[]).map((tier) => (
            <Chip
              key={tier}
              on={controls.quality === tier}
              onClick={() => set("quality", tier)}
            >
              {tier}
            </Chip>
          ))}
        </div>
      </Group>
    </aside>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs tracking-wide text-faint uppercase">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  on,
  onClick,
  group,
  children,
}: {
  on: boolean;
  onClick: () => void;
  group?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-chip={group ? `${group}:${String(children)}` : undefined}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
        on
          ? "bg-aim text-white"
          : "bg-gunmetal/60 text-muted hover:bg-gunmetal"
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  hint,
  value,
  max = 1,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="font-mono text-xs text-aim-live">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        data-ctl={label}
        aria-label={label}
        min={0}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-[#0e8fa6]"
      />
      <p className="mt-0.5 text-[11px] text-faint">{hint}</p>
    </div>
  );
}
