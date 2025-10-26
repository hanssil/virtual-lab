// File: js/lab-gerak-lurus.js (VERSI DENGAN PAUSE/RESUME + AUTH CHECK)

// PERBAIKAN: Tambahkan Auth Check
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      // User login, jalankan logika halaman
      runLabLogic();
    }
    // Tidak perlu 'else', main.js akan redirect
  });
});

// Masukkan semua logika lama ke dalam fungsi ini
function runLabLogic() {
  // === 1. TANGKAP ELEMEN ===
  const param1Slider = document.getElementById('param1'); // v₀
  const param2Slider = document.getElementById('param2'); // a
  const param3Slider = document.getElementById('param3'); // t
  const startButton = document.getElementById('start-button');
  const pauseButton = document.getElementById('pause-button');
  const resumeButton = document.getElementById('resume-button');
  const stopButton = document.getElementById('stop-button');
  const resetButton = document.getElementById('reset-button');
  const objectToMove = document.getElementById('object');
  const simulationArea = document.querySelector('.visualization-area');

  const param1ValueSpan = document.getElementById('param1-value');
  const param2ValueSpan = document.getElementById('param2-value');
  const param3ValueSpan = document.getElementById('param3-value');

  const simulationTimeDisplay = document.getElementById('simulation-time');

  const resultV = document.getElementById('result-v');
  const resultS = document.getElementById('result-s');
  const resultVt = document.getElementById('result-vt');
  const resultStotal = document.getElementById('result-stotal');

  let simulasiJalanID = null;
  let isSimulasiBerjalan = false;
  let isPaused = false;

  // Variabel untuk menyimpan state simulasi
  let savedTime = 0;
  let savedPosition = 10;
  let savedV0 = 0;
  let savedA = 0;
  let savedTMax = 0;

  // === 2. FUNGSI UPDATE TAMPILAN & HITUNG AWAL ===
  function updateTampilanDanHitung() {
      const v0 = parseFloat(param1Slider.value);
      const a = parseFloat(param2Slider.value);
      const tMax = parseFloat(param3Slider.value);

      param1ValueSpan.textContent = v0.toFixed(2);
      param2ValueSpan.textContent = a.toFixed(2);
      param3ValueSpan.textContent = tMax.toFixed(2);

      const vt = v0 + a * tMax;
      const stotal = v0 * tMax + 0.5 * a * tMax * tMax;

      if (!isSimulasiBerjalan) {
          resultV.textContent = v0.toFixed(3);
          resultS.textContent = (0).toFixed(3);
          resultVt.textContent = vt.toFixed(3);
          resultStotal.textContent = stotal.toFixed(3);
          simulationTimeDisplay.textContent = '0.00 s';
          objectToMove.style.left = '10px'; // Reset posisi visual
      }
  }

  // === 3. FUNGSI UNTUK KONTROL TOMBOL ===
  function showStartButton() {
      startButton.style.display = 'inline-block';
      pauseButton.style.display = 'none';
      resumeButton.style.display = 'none';
      stopButton.style.display = 'none';
      resetButton.disabled = false;
  }

  function showPauseStopButtons() {
      startButton.style.display = 'none';
      pauseButton.style.display = 'inline-block';
      resumeButton.style.display = 'none';
      stopButton.style.display = 'inline-block';
      resetButton.disabled = true;
  }

  function showResumeStopButtons() {
      startButton.style.display = 'none';
      pauseButton.style.display = 'none';
      resumeButton.style.display = 'inline-block';
      stopButton.style.display = 'inline-block';
      resetButton.disabled = true;
  }

  // === 4. FUNGSI PAUSE ===
  function pauseSimulation() {
      clearInterval(simulasiJalanID);
      isPaused = true;
      isSimulasiBerjalan = false;
      showResumeStopButtons();
  }

  // === 5. FUNGSI RESUME ===
  function resumeSimulation() {
      isPaused = false;
      isSimulasiBerjalan = true;
      showPauseStopButtons();
      
      // Lanjutkan dari waktu yang tersimpan
      runSimulation(savedTime, savedPosition, savedV0, savedA, savedTMax);
  }

  // === 6. FUNGSI STOP ===
  function stopSimulation() {
      clearInterval(simulasiJalanID);
      isSimulasiBerjalan = false;
      isPaused = false;
      savedTime = 0;
      savedPosition = 10;
      showStartButton();
  }

  // === 7. FUNGSI SIMULASI (REFACTORED) ===
  function startSimulation() {
      clearInterval(simulasiJalanID);
      objectToMove.style.left = '10px';
      
      savedV0 = parseFloat(param1Slider.value);
      savedA = parseFloat(param2Slider.value);
      savedTMax = parseFloat(param3Slider.value);
      savedTime = 0;
      savedPosition = 10;
      
      if (savedV0 === 0 && savedA === 0) {
          alert("Objek tidak akan bergerak. Atur kecepatan awal atau percepatan.");
          return;
      }
      if (savedTMax <= 0) {
          alert("Atur waktu simulasi lebih dari 0 detik.");
          return;
      }
      
      isSimulasiBerjalan = true;
      isPaused = false;
      showPauseStopButtons();
      
      runSimulation(savedTime, savedPosition, savedV0, savedA, savedTMax);
  }

  function runSimulation(startTime, startPos, v0, a, tMax) {
      const trackWidth = simulationArea.clientWidth;
      const objectWidth = objectToMove.clientWidth;
      const batasAkhirPx = trackWidth - objectWidth - 10;
      
      let posisiAwalPx = 10;
      let posisi = startPos;
      let waktu = startTime;
      
      simulasiJalanID = setInterval(() => {
          const current_v = v0 + a * waktu;
          const current_s = v0 * waktu + 0.5 * a * waktu * waktu;

          posisi = Math.min(posisiAwalPx + (current_s * 5), batasAkhirPx);
          objectToMove.style.left = posisi + 'px';

          simulationTimeDisplay.textContent = waktu.toFixed(2) + ' s';
          resultV.textContent = current_v.toFixed(3);
          resultS.textContent = current_s.toFixed(3);
          
          // Simpan state untuk pause/resume
          savedTime = waktu;
          savedPosition = posisi;

          waktu += 0.02;

          if (waktu >= tMax || posisi >= batasAkhirPx) {
              stopSimulation();
              const finalTime = Math.min(waktu - 0.02, tMax);
              const final_vt = v0 + a * finalTime;
              const final_stotal = v0 * finalTime + 0.5 * a * finalTime * finalTime;
              simulationTimeDisplay.textContent = finalTime.toFixed(2) + ' s';
              resultV.textContent = final_vt.toFixed(3);
              resultS.textContent = final_stotal.toFixed(3);
              objectToMove.style.left = Math.min(posisi, batasAkhirPx) + 'px';
          }
      }, 20);
  }

  // === 8. FUNGSI RESET ===
  function resetSimulation() {
      stopSimulation();
      updateTampilanDanHitung();
  }

  // === 9. EVENT LISTENER ===
  param1Slider.addEventListener('input', updateTampilanDanHitung);
  param2Slider.addEventListener('input', updateTampilanDanHitung);
  param3Slider.addEventListener('input', updateTampilanDanHitung);
  startButton.addEventListener('click', startSimulation);
  pauseButton.addEventListener('click', pauseSimulation);
  resumeButton.addEventListener('click', resumeSimulation);
  stopButton.addEventListener('click', stopSimulation);
  resetButton.addEventListener('click', resetSimulation);

  // === 10. INISIALISASI HALAMAN ===
  updateTampilanDanHitung();
}