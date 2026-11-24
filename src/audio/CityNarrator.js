/**
 * VOIDPORT — Futuristic AI Voice & Subtitle Narration System
 * 
 * Features:
 * - Web SpeechSynthesis API with speech rate ~0.84, calm pitch, robotic modulation
 * - Sentence-level precision subtitle synchronization
 * - Independent Voice mute / Audio toggle controls
 * - Audio queue to prevent overlapping voices
 * - Clean subtitle DOM presentation with fade transitions
 */

export class CityNarrator {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.isMuted = false;
    this.currentUtterance = null;
    this.speechQueue = [];
    this.isSpeaking = false;

    // Subtitle DOM Elements
    this.subtitleContainer = null;
    this.subtitleText = null;

    this.initDOM();
    this.initVoices();
  }

  initDOM() {
    // Check if subtitle container already exists
    let container = document.getElementById('narrator-subtitle-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'narrator-subtitle-container';
      container.innerHTML = `
        <div id="narrator-badge">SYSTEM AI // VOCAL LOG</div>
        <div id="narrator-text"></div>
      `;
      document.body.appendChild(container);
    }
    this.subtitleContainer = container;
    this.subtitleText = document.getElementById('narrator-text');
  }

  initVoices() {
    if (!this.synth) return;
    const populate = () => {
      this.voices = this.synth.getVoices();
      // Select best futuristic confident sci-fi voice (commanding, authoritative, crisp)
      this.selectedVoice = this.voices.find(v => 
        v.name.includes('David') ||
        v.name.includes('George') ||
        v.name.includes('Google UK English Male') || 
        v.name.includes('Google US English') ||
        v.name.includes('Natural') || 
        v.name.includes('Guy') ||
        (v.lang && v.lang.startsWith('en'))
      ) || this.voices[0];
    };

    populate();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populate;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.synth) {
      this.synth.cancel();
      this.hideSubtitle();
    }
    return this.isMuted;
  }

  /**
   * Speak an individual sentence with matching on-screen subtitle.
   * Resolves when the line finishes speaking.
   */
  speakLine(text, customRate = 0.90) {
    return new Promise((resolve) => {
      this.showSubtitle(text);

      if (this.isMuted || !this.synth) {
        const displayDuration = Math.max(2200, text.length * 60);
        setTimeout(() => {
          resolve();
        }, displayDuration);
        return;
      }

      this.synth.cancel(); // Prevent voice overlap

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = customRate;  // 0.90 confident, crisp sci-fi tempo
      utterance.pitch = 0.98;       // Grounded, authoritative pitch
      utterance.volume = 1.0;       // Max clarity above background soundtrack

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * Speak a sequence of sentences one by one with subtitle sync.
   * Can be aborted via callback.
   */
  async speakSequence(lines, pauseBetween = 450, shouldAbortFn = null) {
    for (let i = 0; i < lines.length; i++) {
      if (shouldAbortFn && shouldAbortFn()) break;
      await this.speakLine(lines[i]);
      if (shouldAbortFn && shouldAbortFn()) break;
      if (i < lines.length - 1) {
        await new Promise(r => setTimeout(r, pauseBetween));
      }
    }
    this.hideSubtitle();
  }

  showSubtitle(text) {
    if (!this.subtitleContainer || !this.subtitleText) return;
    this.subtitleText.textContent = text;
    this.subtitleContainer.classList.add('visible');
  }

  hideSubtitle() {
    if (!this.subtitleContainer) return;
    this.subtitleContainer.classList.remove('visible');
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.hideSubtitle();
  }
}

export const narrator = new CityNarrator();
