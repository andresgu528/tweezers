export class NoiseMaker {
  constructor(sampleRate=44100) {
    this.sampleRate = sampleRate;
    this.audioContext = new AudioContext({sampleRate});
    this.userFunction = null;
    this.audioWorkletNode = null;
  }
  static async enumerateAsync() {
    let devices = (await navigator.mediaDevices.enumerateDevices())
      .filter(device => (device.kind == "audiooutput"));
    return devices;
  }
  async setUserFunction(userFunction) {
    this.userFunction = userFunction;
    await this.audioContext.audioWorklet.addModule(synthProcessorURL);
    this.audioWorkletNode = new AudioWorkletNode(
        this.audioContext,
        "synth_processor",
        {
          processorOptions: {
            sampleRate: this.sampleRate,
            userFunction: userFunction,
            tdelta: 1 / this.sampleRate,
          }
        }
    );
    this.audioWorkletNode.connect(this.audioContext.destination);
  }
  updateParams(params) {
    this.audioWorkletNode.port.postMessage(params);
  }
};

let synthProcessorCode = `
  class SynthProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super();
      this.count = 0;
      this.sampleRate = options.processorOptions.sampleRate;
      this.paramNames = options.processorOptions.userFunction.paramNames;
      this.paramValues = options.processorOptions.userFunction.paramValues;
      this.userFunction = new Function(
        options.processorOptions.userFunction.arg,
        ...this.paramNames,
        options.processorOptions.userFunction.func
      );
      this.tdelta = options.processorOptions.tdelta;
      
      this.port.onmessage = (event) => {
        this.paramValues = event.data;
      };
      this.time = 0;
    }

    process(inputs, outputs, params) {
      const data = outputs[0][0];
      for (let i = 0; i < data.length; i++) {
        data[i] = this.userFunction(this.time, ...this.paramValues);
        this.time += this.tdelta;
      }
      this.count += 1;
      if (this.count > this.sampleRate/data.length/2) {
        this.count = 0;
      }
      return true;
    }
  }

  registerProcessor("synth_processor", SynthProcessor);
`
let synthProcessorModule = new Blob(
  [synthProcessorCode],
  {type: "text/javascript"}
);
let synthProcessorURL = URL.createObjectURL(synthProcessorModule);