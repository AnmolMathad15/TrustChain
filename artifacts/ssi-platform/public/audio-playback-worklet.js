class AudioPlaybackWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    
    if (this.buffer.length > 0) {
      const framesToPlay = Math.min(this.buffer.length, channel.length);
      for (let i = 0; i < framesToPlay; i++) {
        channel[i] = this.buffer.shift();
      }
    }
    
    return true;
  }
}

registerProcessor('audio-playback-worklet', AudioPlaybackWorklet);