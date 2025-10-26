// File: js/lab-gerak-parabola.js (VERSI DENGAN PAUSE/RESUME + AUTH CHECK)

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
  const param2Slider = document.getElementById('param2'); // θ
  const param3Slider = document.getElementById('param3'); // g
  const startButton = document.getElementById('start-button');
  const pauseButton = document.getElementById('pause-button');
  const resumeButton = document.getElementById('resume-button');
  const stopButton = document.getElementById('stop-button');
  const resetButton = document.getElementById('reset-button');
  const objectToMove = document.getElementById('object'); // Proyektil
  const cannon = document.getElementById('cannon');
  const simulationArea = document.querySelector('.visualization-area');

  const param1ValueSpan = document.getElementById('param1-value');
  const param2ValueSpan = document.getElementById('param2-value');
  const param3ValueSpan = document.getElementById('param3-value');

  const simulationTimeDisplay = document.getElementById('simulation-time');

  const resultX = document.getElementById('result-x');
  const resultY = document.getElementById('result-y');
  const resultR = document.getElementById('result-r');
  const resultH = document.getElementById('result-h');
  const resultT = document.getElementById('result-t');

  let simulasiJalanID = null;
  let isSimulasiBerjalan = false;
  let isPaused = false;

  const DEG_TO_RAD = Math.PI / 180;
  const POSISI_AWAL_X_PX = 40;
  const POSISI_AWAL_Y_PX = 25;

  // Variabel untuk menyimpan state simulasi
  let savedTime = 0;
  let savedPosX = 0;
  let savedPosY = 0;
  let savedV0 = 0;
  let savedAngleRad = 0;
  let savedG = 0;

  // === 2. FUNGSI UPDATE TAMPILAN & HITUNG AWAL ===
  function updateTampilanDanHitung() {
      const v0 = parseFloat(param1Slider.value);
      const angleDeg = parseFloat(param2Slider.value);
      const g = parseFloat(param3Slider.value);
      const angleRad = angleDeg * DEG_TO_RAD;

      param1ValueSpan.textContent = v0.toFixed(2);
      param2ValueSpan.textContent = angleDeg.toFixed(2);
      param3ValueSpan.textContent = g.toFixed(2);

      cannon.style.transform = `rotate(-${angleDeg}deg)`;

      // Hitung hasil teoritis (jika g > 0)
      let timeTotal = 0, range = 0, heightMax = 0;
      if (g > 0) {
          timeTotal = (2 * v0 * Math.sin(angleRad)) / g;
          range = (v0 * v0 * Math.sin(2 * angleRad)) / g;
          heightMax = (v0 * v0 * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * g);
      }

      if (!isSimulasiBerjalan) {
          resultX.textContent = (0).toFixed(3);
          resultY.textContent = (0).toFixed(3);
          resultR.textContent = range.toFixed(3);
          resultH.textContent = heightMax.toFixed(3);
          resultT.textContent = timeTotal.toFixed(3);
          simulationTimeDisplay.textContent = '0.00 s';
          // Reset posisi visual bola
          objectToMove.style.left = POSISI_AWAL_X_PX + 'px';
          objectToMove.style.bottom = POSISI_AWAL_Y_PX + 'px';
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
      runSimulation(savedTime, savedV0, savedAngleRad, savedG);
  }

  // === 6. FUNGSI STOP ===
  function stopSimulation() {
      clearInterval(simulasiJalanID);
      isSimulasiBerjalan = false;
      isPaused = false;
      savedTime = 0;
      savedPosX = 0;
      savedPosY = 0;
      showStartButton();
  }

  // === 7. FUNGSI SIMULASI (REFACTORED) ===
  function startSimulation() {
      clearInterval(simulasiJalanID);
      objectToMove.style.left = POSISI_AWAL_X_PX + 'px';
      objectToMove.style.bottom = POSISI_AWAL_Y_PX + 'px';
      
      savedV0 = parseFloat(param1Slider.value);
      const angleDeg = parseFloat(param2Slider.value);
      savedAngleRad = angleDeg * DEG_TO_RAD;
      savedG = parseFloat(param3Slider.value);
      savedTime = 0;
      savedPosX = 0;
      savedPosY = 0;
      
      if (savedV0 <= 0) {
          alert("Atur kecepatan awal > 0.");
          return;
      }
      if (savedG <= 0) {
          alert("Gravitasi harus > 0.");
          return;
      }
      
      isSimulasiBerjalan = true;
      isPaused = false;
      showPauseStopButtons();
      
      runSimulation(savedTime, savedV0, savedAngleRad, savedG);
  }

  function runSimulation(startTime, v0, angleRad, g) {
      const v0x = v0 * Math.cos(angleRad);
      const v0y = v0 * Math.sin(angleRad);
      
      let waktu = startTime;
      let posX = 0;
      let posY = 0;
      
      const skala = 10;
      const areaWidth = simulationArea.clientWidth;
      
      simulasiJalanID = setInterval(() => {
          posX = v0x * waktu;
          posY = v0y * waktu - 0.5 * g * waktu * waktu;

          let posX_px = POSISI_AWAL_X_PX + (posX * skala);
          let posY_px = POSISI_AWAL_Y_PX + (posY * skala);

          objectToMove.style.left = posX_px + 'px';
          objectToMove.style.bottom = posY_px + 'px';

          simulationTimeDisplay.textContent = waktu.toFixed(2) + ' s';
          resultX.textContent = posX.toFixed(3);
          resultY.textContent = posY.toFixed(3);
          
          // Simpan state untuk pause/resume
          savedTime = waktu;
          savedPosX = posX;
          savedPosY = posY;

          waktu += 0.02;

          if ((posY_px < POSISI_AWAL_Y_PX && waktu > 0.02) || posX_px > areaWidth) {
              stopSimulation();
              if (posY_px < POSISI_AWAL_Y_PX) {
                  objectToMove.style.bottom = POSISI_AWAL_Y_PX + 'px';
                  const timeToGround = (2 * v0y) / g;
                  simulationTimeDisplay.textContent = timeToGround.toFixed(2) + ' s';
                  resultX.textContent = (v0x * timeToGround).toFixed(3);
                  resultY.textContent = (0).toFixed(3);
              } else {
                  simulationTimeDisplay.textContent = (waktu - 0.02).toFixed(2) + ' s';
              }
              updateTampilanDanHitung();
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