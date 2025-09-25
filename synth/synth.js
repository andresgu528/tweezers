import {NoiseMaker} from "./noisemaker.js";

const btn = document.getElementById("start_btn");
let sound_on = false;
const tout = document.getElementById("synth_tout");
tout.textContent = "...";
btn.addEventListener("click", start_synth);
let numKeysPressed = 0;

const octaveBaseFrequency = 110;
const availableKeys = "zsxcfvgbnjmk,l.";

let sound;

const makeNoise = {
  arg: "time",
  paramNames: ["frequencyOutput"],
  paramValues: [0],
  func: `
    let output = Math.sin(2*Math.PI*frequencyOutput*time);
    //return output * 0.4;
    if (output > 0) {
      return 0.2;
    } else {
      return -0.2;
    }
  `
}

async function start_synth() {
  sound_on = true;
  btn.disabled = true;
  btn.textContent = "Keyboard activated";
  const devices = await NoiseMaker.enumerateAsync();
  devices.forEach(device => {
    printToOut(`Found output device: ${device.label}, id: ${device.deviceId}`)
  });
  sound = new NoiseMaker();
  await sound.setUserFunction(makeNoise);
  printToOut("Keyboard activated.");
  window.addEventListener("keydown", onKeyPress);
  window.addEventListener("keyup", onKeyRelease);

  function onKeyPress (event) {
    if (!event.repeat) {
      let semitones = availableKeys.indexOf(event.key);
      if (semitones >= 0) {
        numKeysPressed += 1;
        const frequencyOutput = octaveBaseFrequency * Math.pow(2, semitones/12);
        sound.updateParams([frequencyOutput]);
      }
    }
  }

  function onKeyRelease (event) {
    if (availableKeys.includes(event.key)) {
      numKeysPressed -= 1;
    }
    if (numKeysPressed <= 0) {
      sound.updateParams([0]);
      numKeysPressed = 0;
    }
  }
}

function printToOut(text) {
  tout.value = tout.value + "\n" + text;
}

