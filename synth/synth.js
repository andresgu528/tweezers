import {NoiseMaker} from "./noisemaker.js";

const btn = document.getElementById("start_btn");
let sound_on = false;
const tout = document.getElementById("synth_tout");
btn.addEventListener("click", start_synth);

let makeNoise = {
  arg: "time",
  paramNames: ["frequencyOutput"],
  paramValues: [0],
  func: "return Math.sin(2*Math.PI*frequencyOutput*time)"
}

async function start_synth() {
  sound_on = true;
  btn.disabled = true;
  btn.textContent = "Keyboard activated";
  const devices = await NoiseMaker.enumerateAsync();
  devices.forEach(device => printToOut(`Found output device: ${device.label}, id: ${device.deviceId}`));
  const sound = new NoiseMaker();
  await sound.setUserFunction(makeNoise);
  printToOut("Keyboard activated.");
  window.addEventListener("keydown", onKeyPress);
  window.addEventListener("keyup", onKeyRelease);

  function onKeyPress (event) {
    let key = event.key;
    if (key == "a") {
      sound.updateParams([440]);
    }
  }

  function onKeyRelease (event) {
    let key = event.key;
    if (key == "a") {
      sound.updateParams([0]);
    }
  }
}

function printToOut(text) {
  tout.value = tout.value + "\n" + text;
}

