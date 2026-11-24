/**
 * AudioManager
 * 3D positional and procedural audio engine using Web Audio API.
 * Adheres strictly to browser autoplay policies by activating on first user interaction.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isMuted = false;

    // Sound node references
    this.ambientGain = null;
    this.rainNode = null;
    this.transformerNode = null;
    this.reactorHumNode = null;

    this.bindUserGesture();
  }

  bindUserGesture() {
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.createRainSound();
      this.createTransformerDrone();
      this.isInitialized = true;
      console.log('[VOIDPORT Audio] Spatial audio engine initialized.');
    } catch (e) {
      console.warn('[VOIDPORT Audio] Web Audio not supported or blocked:', e);
    }
  }

  createRainSound() {
    // Generate organic rain sound using filtered white noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate rain drops hitting wet pavement
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 850;
    filter.Q.value = 1.2;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    whiteNoise.start(0);
  }

  createTransformerDrone() {
    // Dormant 50Hz industrial power transformer hum
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    osc.start(0);
  }

  playTerminalSwitch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Heavy mechanical switch click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playAwakeningSurge() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Ascending power grid sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(45, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 3.5);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 4.0);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 4.2);

    // Fade up active reactor hum
    if (this.droneGain) {
      this.droneGain.gain.linearRampToValueAtTime(0.25, now + 3.0);
    }
  }
}
