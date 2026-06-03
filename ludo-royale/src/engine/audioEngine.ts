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
    
    const duration = 0.8;
    const bufferSize = this.ctx.sampleRate * duration; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + duration);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.6, this.ctx.currentTime);
    
    // Rattling amplitude fluctuations
    const rattleSpeed = 22; // Hz
    for (let t = 0; t < duration; t += 0.02) {
      const volumeScale = (1 - t / duration) * (0.4 + 0.6 * Math.abs(Math.sin(t * rattleSpeed * Math.PI)));
      gainNode.gain.linearRampToValueAtTime(volumeScale * 0.7, this.ctx.currentTime + t);
    }
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    noiseSource.start();
  }

  public async playTokenMove() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();
    
    // Tactile wood click/pop
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle'; // softer harmonics
    
    // Quick pitch sweep drop (high to low)
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    // Click transient (10ms sharp strike)
    const click = this.ctx.createOscillator();
    click.type = 'sine';
    click.frequency.setValueAtTime(1800, this.ctx.currentTime);
    
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

    osc.connect(gain);
    click.connect(clickGain);
    
    gain.connect(this.sfxGain);
    clickGain.connect(this.sfxGain);

    osc.start();
    click.start();
    
    osc.stop(this.ctx.currentTime + 0.1);
    click.stop(this.ctx.currentTime + 0.015);
  }

  public async playCapture() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    const duration = 0.4;

    // 1. Bass thud
    const sub = this.ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(140, this.ctx.currentTime);
    sub.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + duration);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    // 2. White noise crash
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    sub.connect(subGain);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    subGain.connect(this.sfxGain);
    noiseGain.connect(this.sfxGain);

    sub.start();
    noise.start();

    sub.stop(this.ctx.currentTime + duration);
    noise.stop(this.ctx.currentTime + duration);
  }

  public async playTokenEnter() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    // Pentatonic scale chime arpeggio (C, D, E, G, A, C5)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      // Overtones for bell timbre
      const overtone = this.ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 3, this.ctx.currentTime + idx * 0.08);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + idx * 0.08);
      overtone.start(this.ctx.currentTime + idx * 0.08);

      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
      overtone.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
    });
  }

  public async playTokenFinish() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    // Celebratory C Major chord (C4, E4, G4, C5, E5, G5) with bass backing
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

      const sub = this.ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(freq / 2, this.ctx.currentTime + idx * 0.06);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.6);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + idx * 0.06);
      sub.start(this.ctx.currentTime + idx * 0.06);

      osc.stop(this.ctx.currentTime + idx * 0.06 + 0.6);
      sub.stop(this.ctx.currentTime + idx * 0.06 + 0.6);
    });
  }

  public async playTick() {
    if (!this.sfxEnabled) return;
    await this.ensureContext();

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  public async startMusic() {
    if (this.isMusicPlaying) return;
    await this.ensureContext();
    this.isMusicPlaying = true;

    // Cinematic deep ambient pad chorder (warm, dark minor-7th / major-7th chord swells)
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [146.83, 174.61, 220.00, 261.63], // Dmin7 (D3, F3, A3, C4)
      [164.81, 196.00, 246.94, 293.66], // Emin7 (E3, G3, B3, D4)
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
    ];
    let chordIndex = 0;

    const playChord = () => {
      if (!this.isMusicPlaying) return;
      
      const freqs = chords[chordIndex] || [130.81, 164.81, 196.00, 246.94];
      chordIndex = (chordIndex + 1) % chords.length;

      freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle'; // warm timber
        osc.frequency.setValueAtTime(freq + (Math.random() * 1.5 - 0.75), this.ctx.currentTime);

        const lpf = this.ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(320, this.ctx.currentTime); // filter highs for warm dark sound

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.5); // slow swell
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 3.8); // slow decay

        osc.connect(lpf);
        lpf.connect(gain);
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
