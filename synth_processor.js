class SynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const data = outputs[0][0];
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return true;
  }
}

registerProcessor("synth_processor", SynthProcessor);