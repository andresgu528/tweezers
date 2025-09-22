const btn = document.getElementById("start_btn");
btn.addEventListener("click", start_synth)

async function start_synth() {
  const audioctx = new AudioContext();
  await audioctx.audioWorklet.addModule("synth_processor.js");
  const synthnode = new AudioWorkletNode(audioctx, "synth_processor");
  synthnode.connect(audioctx.destination);
}