
class Particle {
  _positionStart = null;
  _positionEnd = null;
  _colorStart = null;
  _colorEnd = null;
  _rotationStart = 0;
  _rotationEnd = 0;
  _scaleStart = 1;
  _scaleEnd = 1;
  _index = -1;

  constructor({
    positionStart,
    positionEnd,
    colorStart,
    colorEnd,
    scaleStart = 1,
    scaleEnd = 1,
    index,
  }) {
    if (index || index === 0) this._index = index;
    this._positionStart = positionStart;
    this._positionEnd = positionEnd;
    this._colorStart = colorStart;
    this._colorEnd = colorEnd;
    this._scaleStart = scaleStart;
    this._scaleEnd = scaleEnd;
  }

  draw(BLOCK_SIZE, screenShake, normalizedTimeElapsed) {
    if (!this._colorStart) return;
    const scale = lerp(this._scaleStart, this._scaleEnd, normalizedTimeElapsed);
    const calcColor = lerpColor(this._colorStart, this._colorEnd, Utils.clamp(normalizedTimeElapsed * 10 - 9, 0, 1));
    const position = p5.Vector.lerp(this._positionStart, this._positionEnd, normalizedTimeElapsed);
    const drawPosition = {
      x: position.x * BLOCK_SIZE.x + screenShake.offset.x,
      y: position.y * BLOCK_SIZE.y + screenShake.offset.y,
    }
    fill(calcColor);
    stroke(calcColor);
    strokeWeight(0);
    square(drawPosition.x, drawPosition.y, BLOCK_SIZE.x * scale);
  }
}

// eslint-disable-next-line no-unused-vars
class ParticleSystem {
  _particles = [];
  _lifetime = 0;
  _timeElapsed = 0;
  _destroyed = false;
  _easingFnc;

  /**
   * @param {{ origin: p5.Vector }} options 
   */
  constructor({ origin, easingFnc, colorStart, colorEnd, lifetime = 1000, numParticles = 10, speed = 5, speedVariance = 0, scaleStart = 1, scaleEnd = scaleStart, scaleVariance = 0 }) {
    if (origin == null) throw new Error("null origin passed to ParticleSystem constructor");
    this._destroyed = false;
    this._lifetime = lifetime;
    this._timeElapsed = 0;
    this._particles = [];
    this._easingFnc = easingFnc;

    const randomVector = (scale = 1) => {
      return createVector((random(2) - 1) * scale, (random(2) - 1) * scale);
    }

    for (let i = 0; i < numParticles; i++) {
      const positionStart = origin.copy().add(randomVector(0.25));
      const heading = randomVector(1).normalize();
      const calcSpeed = Math.max(speed + (random(2) - 1) * speedVariance, speed * 0.5);
      const particle = new Particle({
        colorStart,
        colorEnd,
        positionStart,
        positionEnd: positionStart.copy().add(heading.mult(calcSpeed * (lifetime / 1000))),
        scaleStart: Math.max(scaleStart + (random(2) - 1) * scaleVariance, 0),
        scaleEnd: Math.max(scaleEnd + (random(2) - 1) * scaleVariance, 0),
        index: i,
      });
      this._particles.push(particle);
    }
  }

  isActive() {
    return !this._destroyed && this._timeElapsed < this._lifetime;
  }

  tick() {
    if (this._destroyed) {
      return;
    }
    if (this._timeElapsed >= this._lifetime) {
      this._destroyed = true;
      return;
    }
    this._timeElapsed += deltaTime;
  }

  draw(BLOCK_SIZE, screenShake) {
    if (this._destroyed || !this._particles) {
      return;
    }
    let normalizedTimeElapsed = Utils.clamp(this._timeElapsed / this._lifetime);
    if (this._easingFnc) {
      normalizedTimeElapsed = this._easingFnc(normalizedTimeElapsed);
    }
    for (let i = 0; i < this._particles.length; i++) {
      this._particles[i].draw(BLOCK_SIZE, screenShake, normalizedTimeElapsed);
    }
  }
}
