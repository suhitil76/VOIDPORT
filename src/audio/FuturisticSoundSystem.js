/**
 * VOIDPORT — Futuristic Sound Design & Ambient Synth Soundtrack
 * Procedural Web Audio API synthesis: zero external dependencies, 100% reliable,
 * seamless infinite ambient score + interactive sci-fi sound effects.
 */

export class FuturisticSoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlaying = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.bgAudio = null;
    this.ambientIntensity = 1.0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    // Keep volume low and pleasant so narrator voice is prominent and clear
    this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.startBackgroundMusic();
    this.isPlaying = true;
  }

  toggleMute() {
    if (!this.ctx) {
      this.init();
      return false;
    }
    this.isMuted = !this.isMuted;
    if (this.bgAudio) {
      if (this.isMuted) {
        this.bgAudio.pause();
      } else {
        this.bgAudio.play().catch(() => {});
      }
    }
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : 0.7,
        this.ctx.currentTime,
        0.1
      );
    }
    return this.isMuted;
  }

  /**
   * User-provided Background Cyberpunk / Electronic Score
   * Loops seamlessly, routed through Web Audio GainNode for clean volume ducking
   */
  startBackgroundMusic() {
    try {
      this.bgAudio = new Audio('/voidport_bg_music.mp3');
      this.bgAudio.loop = true;
      this.bgAudio.preload = 'auto';

      if (this.ctx) {
        const source = this.ctx.createMediaElementSource(this.bgAudio);
        source.connect(this.musicGain);
      } else {
        this.bgAudio.volume = 0.18;
      }

      this.bgAudio.play().catch(e => {
        console.warn('Audio play auto-resumed on user action', e);
      });
    } catch (e) {
      console.warn('HTML5 Audio fallback', e);
    }
  }

  setClimaxMode() {
    this.ambientIntensity = 1.6;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(0.28, this.ctx.currentTime + 2.0);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INTERACTIVE SOUND EFFECTS
  // ═══════════════════════════════════════════════════════════════

  playClick() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playPuzzleStep(frequency = 440) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  playPuzzleSuccess() {
    if (!this.ctx || this.isMuted) return;
    // Chime triad: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      const t = this.ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.85);
    });
  }

  playBuildingUnlock() {
    if (!this.ctx || this.isMuted) return;
    // Resonant deep power hum rising into high harmonic
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.85);
  }

  playBeamEruption() {
    if (!this.ctx || this.isMuted) return;
    // Massive bass rumble + high energy pulse
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(65, this.ctx.currentTime + 2.5);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 3.1);
  }

  playFirework() {
    if (!this.ctx || this.isMuted) return;
    // Noise burst explosion simulation
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600 + Math.random() * 400, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start();
  }
}

export const soundSystem = new FuturisticSoundSystem();
