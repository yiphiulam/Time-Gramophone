// Nostalgic Synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playNote(frequency: number, duration: number = 0.4, distorted: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Retro-synth triangle/square wave for 70s-80s arcade feel
    osc.type = distorted ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    if (distorted) {
      // Create retro radio distortion effect
      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = 'peaking';
      biquadFilter.frequency.setValueAtTime(1000, ctx.currentTime);
      biquadFilter.Q.setValueAtTime(10, ctx.currentTime);
      osc.connect(biquadFilter);
      biquadFilter.connect(gainNode);
    } else {
      osc.connect(gainNode);
    }

    gainNode.connect(ctx.destination);

    // Audio envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(distorted ? 0.08 : 0.25, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio Context error (usual if browser gesture not registered yet):', e);
  }
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Two-tone cheerful chime
    const playTone = (freq: number, startDelay: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startDelay + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + 0.2);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + 0.2);
    };

    playTone(523.25, 0, 0.15); // C5
    playTone(659.25, 0.08, 0.15); // E5
  } catch (e) {}
}

export function playStaticNoise(duration: number = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill the buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.Q.value = 1;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration);
  } catch (e) {}
}
