"use client";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

const options: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: { value: 110, density: { enable: true } },
    color: { value: ["#ff71ce", "#01cdfe", "#fffb96", "#ffffff"] },
    shape: { type: "circle" },
    opacity: {
      value: { min: 0.25, max: 0.95 },
      animation: { enable: true, speed: 1.2, sync: false },
    },
    size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 2, sync: false } },
    move: {
      enable: true,
      direction: "top",
      speed: { min: 0.2, max: 1 },
      straight: false,
      outModes: { default: "out" },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "repulse" },
      onClick: { enable: true, mode: "push" },
    },
    modes: {
      repulse: { distance: 110, duration: 0.6 },
      push: { quantity: 4 },
    },
  },
  detectRetina: true,
};

export default function ParticleField() {
  return (
    <ParticlesProvider init={(engine) => loadSlim(engine)}>
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute inset-0 pointer-events-auto">
          <Particles id="vapor-particles" options={options} />
        </div>
      </div>
    </ParticlesProvider>
  );
}
