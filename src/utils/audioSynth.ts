// Web Audio API ambient worship engine & backup chord synthesizer
// Guarantees authentic worship melody & atmospheric chords if remote audio encounters network/CORS issues

class WorshipAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrackId: string | null = null;
  private gainNode: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private intervalId: any = null;
  private step = 0;
  private tempo = 68; // slow worship tempo (BPM)

  private trackHarmonies: Record<string, { root: number; chords: number[][]; scale: number[] }> = {
    'cw-1': {
      root: 261.63, // C4 (Living Hope / Redemptive Glory)
      chords: [
        [261.63, 329.63, 392.00, 523.25], // C maj
        [220.00, 261.63, 329.63, 440.00], // A min
        [174.61, 220.00, 261.63, 349.23], // F maj
        [196.00, 246.94, 293.66, 392.00], // G maj
      ],
      scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]
    },
    'cw-2': {
      root: 293.66, // D (Apostolic Creed Anthem)
      chords: [
        [293.66, 369.99, 440.00, 587.33], // D maj
        [246.94, 293.66, 369.99, 493.88], // B min
        [196.00, 246.94, 293.66, 392.00], // G maj
        [220.00, 277.18, 329.63, 440.00], // A maj
      ],
      scale: [293.66, 329.63, 369.99, 440.00, 493.88, 587.33]
    },
    'cw-3': {
      root: 349.23, // F (Ancient of Days / Majesty)
      chords: [
        [349.23, 440.00, 523.25, 698.46], // F maj
        [293.66, 349.23, 440.00, 587.33], // D min
        [233.08, 293.66, 349.23, 466.16], // Bb maj
        [261.63, 329.63, 392.00, 523.25], // C maj
      ],
      scale: [349.23, 392.00, 440.00, 523.25, 587.33, 698.46]
    },
    'cw-4': {
      root: 196.00, // G (The Architecture of Grace)
      chords: [
        [196.00, 246.94, 293.66, 392.00], // G maj
        [164.81, 196.00, 246.94, 329.63], // E min
        [220.00, 261.63, 329.63, 440.00], // C maj
        [146.83, 185.00, 220.00, 293.66], // D maj
      ],
      scale: [196.00, 220.00, 246.94, 293.66, 329.63, 392.00]
    },
    'cw-5': {
      root: 220.00, // A (Holy, Holy, Lord God Almighty)
      chords: [
        [220.00, 261.63, 329.63, 440.00], // A min
        [174.61, 220.00, 261.63, 349.23], // F maj
        [261.63, 329.63, 392.00, 523.25], // C maj
        [196.00, 246.94, 293.66, 392.00], // G maj
      ],
      scale: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00]
    }
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(trackId: string, volume = 0.8) {
    this.initContext();
    if (!this.ctx) return;

    this.stop();
    this.isPlaying = true;
    this.currentTrackId = trackId;

    const harmony = this.trackHarmonies[trackId] || this.trackHarmonies['cw-1'];

    // Master Volume
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.45, this.ctx.currentTime);

    // Reverb / Filter Simulation
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    this.gainNode.connect(filter);
    filter.connect(this.ctx.destination);

    this.step = 0;

    const playChordAndMelody = () => {
      if (!this.ctx || !this.isPlaying || !this.gainNode) return;
      const now = this.ctx.currentTime;
      const chordIndex = Math.floor(this.step / 2) % harmony.chords.length;
      const currentChord = harmony.chords[chordIndex];

      // Clean old notes
      this.activeOscillators.forEach(osc => {
        try {
          osc.stop(now + 0.1);
        } catch {
          // ignore
        }
      });
      this.activeOscillators = [];

      // Warm Pad Oscillators
      currentChord.forEach((freq, i) => {
        if (!this.ctx || !this.gainNode) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle envelope
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.12 / (i + 1), now + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + 4.0);
        this.activeOscillators.push(osc);
      });

      // Melodic gentle bell / piano note
      const melodyNote = harmony.scale[(this.step * 2 + (this.step % 3)) % harmony.scale.length];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(melodyNote * (this.step % 2 === 0 ? 1 : 1.5), now);

      leadGain.gain.setValueAtTime(0.001, now);
      leadGain.gain.linearRampToValueAtTime(0.09, now + 0.08);
      leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      leadOsc.connect(leadGain);
      leadGain.connect(this.gainNode);

      leadOsc.start(now);
      leadOsc.stop(now + 2.0);
      this.activeOscillators.push(leadOsc);

      this.step++;
    };

    playChordAndMelody();
    const intervalMs = (60 / this.tempo) * 2000;
    this.intervalId = setInterval(playChordAndMelody, intervalMs);
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(volume * 0.45, this.ctx.currentTime);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.activeOscillators.forEach(osc => {
        try {
          osc.stop(now + 0.05);
        } catch {
          // ignore
        }
      });
    }
    this.activeOscillators = [];
  }

  public isCurrentlyPlaying() {
    return this.isPlaying;
  }
}

export const worshipSynth = new WorshipAudioEngine();
