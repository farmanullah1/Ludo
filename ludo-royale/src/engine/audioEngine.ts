export class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private musicNodes: OscillatorNode[] = [];
  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.masterGain.gain.value = 1.0;
    this.musicGain.gain.value = 0.3;
    this.sfxGain.gain.value = 0.8;
  }

  // Helper to ensure context is resumed
  private async ensureContext() {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!enabled && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public async playDiceRoll() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();
    
    const bufferSize = this.ctx.sampleRate * 0.8; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.8);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(1, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    noiseSource.start();
  }

  public async playTokenMove() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public async playCapture() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public async playTokenEnter() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    const freqs = [261.63, 329.63, 392.00]; // C4, E4, G4
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.15);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.setValueAtTime(1, this.ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + i * 0.15);
      osc.stop(this.ctx.currentTime + i * 0.15 + 0.3);
    });
  }

  public async playTokenFinish() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.setValueAtTime(1, this.ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.2 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + i * 0.2);
      osc.stop(this.ctx.currentTime + i * 0.2 + 0.4);
    });
  }

  public async playTick() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public async startMusic() {
    if (this.isMusicPlaying) return;
    await this.ensureContext();
    this.isMusicPlaying = true;

    // Simple ambient pad generator loop
    const chords = [
      [261.63, 329.63, 392.00], // C
      [349.23, 440.00, 523.25], // F
      [392.00, 493.88, 587.33], // G
      [261.63, 329.63, 392.00], // C
    ];
    let chordIndex = 0;

    const playChord = () => {
      if (!this.isMusicPlaying) return;
      
      const freqs = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        // detune slightly for pad effect
        osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 1);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 4);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 4);
      });
    };

    playChord();
    this.musicInterval = setInterval(playChord, 4000);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}
