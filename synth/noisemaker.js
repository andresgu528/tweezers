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
    await this.audioContext.audioWorklet.addModule("synth_processor.js");
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