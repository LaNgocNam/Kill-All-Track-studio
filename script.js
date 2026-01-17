const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const tracksDiv = document.getElementById("tracks");

function addTrack() {
  const input = document.getElementById("fileInput");
  if (!input.files.length) return alert("Chọn nhạc trước");

  Array.from(input.files).forEach(file => {
    const reader = new FileReader();

    reader.onload = e => {
      audioCtx.decodeAudioData(e.target.result, buffer => {
        createTrack(buffer, file.name);
      });
    };

    reader.readAsArrayBuffer(file);
  });

  input.value = "";
}

function createTrack(buffer, name) {
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const gainNode = audioCtx.createGain();
  const panNode = audioCtx.createStereoPanner();

  const bass = audioCtx.createBiquadFilter();
  bass.type = "lowshelf";
  bass.frequency.value = 200;

  const mid = audioCtx.createBiquadFilter();
  mid.type = "peaking";
  mid.frequency.value = 1200;

  const treble = audioCtx.createBiquadFilter();
  treble.type = "highshelf";
  treble.frequency.value = 3000;

  source
    .connect(bass)
    .connect(mid)
    .connect(treble)
    .connect(panNode)
    .connect(gainNode)
    .connect(audioCtx.destination);

  const div = document.createElement("div");
  div.className = "track";

  div.innerHTML = `
    <h3>${name}</h3>

    <audio controls></audio>

    <div class="controls">
      <label>Vol
        <input type="range" min="0" max="2" step="0.01" value="1">
      </label>

      <label>Pan
        <input type="range" min="-1" max="1" step="0.01" value="0">
      </label>

      <label>Bass
        <input type="range" min="-30" max="30" value="0">
      </label>

      <label>Mid
        <input type="range" min="-30" max="30" value="0">
      </label>

      <label>Treble
        <input type="range" min="-30" max="30" value="0">
      </label>
    </div>
  `;

  const audio = div.querySelector("audio");
  audio.src = URL.createObjectURL(new Blob([buffer.getChannelData(0)]));

  const sliders = div.querySelectorAll("input");

  sliders[0].oninput = e => gainNode.gain.value = e.target.value;
  sliders[1].oninput = e => panNode.pan.value = e.target.value;
  sliders[2].oninput = e => bass.gain.value = e.target.value;
  sliders[3].oninput = e => mid.gain.value = e.target.value;
  sliders[4].oninput = e => treble.gain.value = e.target.value;

  source.start();

  tracksDiv.appendChild(div);
}
