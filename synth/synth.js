import {NoiseMaker} from "./noisemaker.js";

const btn = document.getElementById("control_btn");
const tout = document.getElementById("synth_tout");
tout.textContent = "Press the button to start!";
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

window.addEventListener("keydown", onKeyPress);
window.addEventListener("keyup", onKeyRelease);
btn.addEventListener("click", btn_change);

function printToOut(text) {
  tout.value = tout.value + "\n" + text;
}

async function start_synth() {
  const devices = await NoiseMaker.enumerateAsync();
  devices.forEach(device => {
    printToOut(`Found output device ${device.label}`)
  });
  sound = new NoiseMaker();
  await sound.setUserFunction(makeNoise);
}

async function btn_change() {
  if (!sound) {
    await start_synth();
    printToOut("Sound synthesizer started.");
    btn.textContent = "Disable";
  } else if (sound.active) {
    await sound.suspend();
    btn.textContent = "Enable";
  } else {
    await sound.resume();
    btn.textContent = "Disable";
  }
}

async function onKeyPress (event) {
  if (!sound) {
    return;
  }
  if (!event.repeat) {
    let semitones = availableKeys.indexOf(event.key);
    if (semitones >= 0) {
      numKeysPressed += 1;
      const frequencyOutput = octaveBaseFrequency * Math.pow(2, semitones/12);
      sound.updateParams([frequencyOutput]);
    }
  }
}

async function onKeyRelease (event) {
  if (!sound) {
    return;
  }
  if (availableKeys.includes(event.key)) {
    numKeysPressed -= 1;
  }
  if (numKeysPressed <= 0) {
    sound.updateParams([0]);
    numKeysPressed = 0;
  }
}





