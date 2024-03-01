import P5, { Vector } from "p5";
import assert from "assert";

import { Particles, INITIAL_POOL_SIZE, ParticleOptions } from "../../collections/particles";
import { ScreenShakeState } from "../../types";
import { Gradients } from "../../collections/gradients";
import { fakeP5 } from "../helpers/FakeP5";

const getParticle = (num: number) => {
  const options: Omit<ParticleOptions, "birthtime"> = {
    originX: num,
    originY: num,
    positionStartX: num,
    positionStartY: num,
    positionEndX: num,
    positionEndY: num,
    scaleStart: num,
    scaleEnd: num,
    lifetime: num,
    orbit: num,
    gradientIndex: num,
  };
  return options;
}

describe("Collections", () => {
  describe("Particles", () => {
    const p5: P5 = fakeP5;
    const gradients = new Gradients(p5);
    const screenShake: ScreenShakeState = {
      offset: new Vector(0, 0),
      timeSinceStarted: 0,
      timeSinceLastStep: 0,
      magnitude: 0,
      timeScale: 0,
    }

    it("should initialize particles", () => {
      const particles = new Particles(p5, gradients, screenShake);
      assert.strictEqual(particles.getLength(), 0);
    });
    it("should add particles", () => {
      const particles = new Particles(p5, gradients, screenShake);
      assert.strictEqual(particles.length, 0);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      particles.spawn(getParticle(1));
      particles.spawn(getParticle(2));
      particles.spawn(getParticle(3));
      assert.strictEqual(particles.length, 3);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      for (let i = 0; i < particles.getLength(); i++) {
        assert(particles.get(i));
      }
      for (let i = particles.length; i < particles.getMaxLength(); i++) {
        assert(!particles.get(i));
      }
    });
    it("should remove particles", () => {
      const particles = new Particles(p5, gradients, screenShake);
      assert.strictEqual(particles.length, 0);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      particles.spawn(getParticle(0));
      particles.spawn(getParticle(1));
      particles.spawn(getParticle(2));
      particles.spawn(getParticle(3));
      assert.strictEqual(particles.length, 4);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      assert.strictEqual(particles.get(2).lifetime, 2);
      particles.remove(2);
      assert.strictEqual(particles.length, 3);
      assert.strictEqual(particles.get(0).lifetime, 0);
      assert.strictEqual(particles.get(1).lifetime, 1);
      assert.strictEqual(particles.get(2).lifetime, 3);
      particles.remove(0);
      assert.strictEqual(particles.length, 2);
      assert.strictEqual(particles.get(0).lifetime, 1);
      assert.strictEqual(particles.get(1).lifetime, 3);
      particles.remove(0);
      assert.strictEqual(particles.length, 1);
      assert.strictEqual(particles.get(0).lifetime, 3);
      particles.remove(1);
      particles.remove(2);
      particles.remove(3);
      particles.remove(99);
      assert.strictEqual(particles.length, 1);
      assert.strictEqual(particles.get(0).lifetime, 3);
      particles.remove(0);
      assert.strictEqual(particles.length, 0);
      assert.strictEqual(particles.get(0), undefined);
    });
    it("should reset particles", () => {
      const particles = new Particles(p5, gradients, screenShake);
      assert.strictEqual(particles.length, 0);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      particles.spawn(getParticle(0));
      particles.spawn(getParticle(1));
      particles.spawn(getParticle(2));
      particles.spawn(getParticle(3));
      particles.spawn(getParticle(4));
      particles.spawn(getParticle(5));
      particles.spawn(getParticle(6));
      particles.spawn(getParticle(7));
      particles.spawn(getParticle(8));
      particles.spawn(getParticle(9));
      assert.strictEqual(particles.length, 10);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      assert.strictEqual(particles.get(0).originX, 0);
      assert.strictEqual(particles.get(5).positionEndY, 5);
      particles.reset();
      assert.strictEqual(particles.length, 0);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(particles.get(i), undefined);
      }
    });
    it("should double array size when adding too many items", () => {
      const particles = new Particles(p5, gradients, screenShake);
      assert.strictEqual(particles.length, 0);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      for (let i = 0; i < INITIAL_POOL_SIZE; i++) {
        particles.spawn(getParticle(Math.floor(Math.random() * 30)));
      }
      assert.strictEqual(particles.length, INITIAL_POOL_SIZE);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      particles.spawn(getParticle(Math.floor(Math.random() * 30)));
      assert.strictEqual(particles.length, INITIAL_POOL_SIZE + 1);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE * 2);
    });
    it("should tick particles correctly", () => {
      const particles = new Particles(p5, gradients, screenShake);
      assert.strictEqual(particles.length, 0);
      assert.strictEqual(particles._internalLength, INITIAL_POOL_SIZE);
      particles.spawn(getParticle(0));
      particles.spawn(getParticle(1));
      particles.spawn(getParticle(2));
      particles.spawn(getParticle(3));
      particles.spawn(getParticle(4));
      particles.spawn(getParticle(5));
      particles.spawn(getParticle(6));
      particles.spawn(getParticle(7));
      particles.spawn(getParticle(8));
      particles.spawn(getParticle(9));
      particles.tick(1);
      assert.strictEqual(particles._timeElapsed, 1);
      assert.strictEqual(particles.length, 9);
      assert.strictEqual(particles.get(0).lifetime, 1);
      particles.tick(1);
      // should have removed all items with lifetime < 2
      assert.strictEqual(particles._timeElapsed, 2);
      assert.strictEqual(particles.length, 8);
      assert.strictEqual(particles.get(0).lifetime, 2);
      particles.tick(3);
      // should have removed all items with lifetime < 5
      assert.strictEqual(particles._timeElapsed, 5);
      assert.strictEqual(particles.length, 5);
      assert.strictEqual(particles.get(0).lifetime, 5);
    })
  });
});
