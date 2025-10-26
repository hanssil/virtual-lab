// File: js/lab-pegas.js (VERSI DENGAN PAUSE/RESUME + AUTH CHECK)

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
  const param1Slider = document.getElementById('param1'); // Massa (m)
  const param2Slider = document.getElementById('param2'); // Konstanta Pegas (k)
  const param3Slider = document.getElementById('param3'); // Amplitudo (A)
  const startButton = document.getElementById('start-button');
  const pauseButton = document.getElementById('pause-button');
  const resumeButton = document.getElementById('resume-button');
  const stopButton = document.getElementById('stop-button'); 
  const resetButton = document.getElementById('reset-button');

  // Elemen visual
  const springElement = document.getElementById('spring');
  const massElement = document.getElementById('mass');
  const massLabel = document.getElementById('mass-label');
  const equilibriumLine = document.getElementById('equilibrium-line');
  const ceilingTop = 40; // Posisi Y langit-langit (sesuai CSS #ceiling top + #spring top)
  const initialSpringHeight = 100; // Tinggi awal pegas (sesuai CSS #spring height)

  // Span nilai input
  const param1ValueSpan = document.getElementById('param1-value');
  const param2ValueSpan = document.getElementById('param2-value');
  const param3ValueSpan = document.getElementById('param3-value');

  // Tampilan Waktu
  const simulationTimeDisplay = document.getElementById('simulation-time');

  // Tampilan Hasil
  const resultY = document.getElementById('result-y'); // Posisi
  const resultV = document.getElementById('result-v'); // Kecepatan
  const resultT = document.getElementById('result-t'); // Periode
  const resultF = document.getElementById('result-f'); // Frekuensi
  const resultE = document.getElementById('result-e'); // Energi Total

  let simulasiJalanID = null;
  let isSimulasiBerjalan = false;
  let isPaused = false;
  let waktuSimulasi = 0; // Waktu simulasi yg berjalan

  // Variabel untuk menyimpan state simulasi
  let savedTime = 0;
  let savedM = 0;
  let savedK = 0;
  let savedA = 0;

  // === 2. FUNGSI UPDATE TAMPILAN & HITUNG ===
  function updateTampilanDanHitung() {
      const m = parseFloat(param1Slider.value);
      const k = parseFloat(param2Slider.value);
      const A = parseFloat(param3Slider.value);

      // Update span nilai input
      param1ValueSpan.textContent = m.toFixed(2);
      param2ValueSpan.textContent = k.toFixed(2);
      param3ValueSpan.textContent = A.toFixed(2);
      massLabel.textContent = m.toFixed(2) + ' kg'; // Update label massa

      // Hitung parameter getaran
      const omega = Math.sqrt(k / m); // Frekuensi sudut (rad/s)
      const T = (2 * Math.PI) / omega; // Periode (s)
      const f = 1 / T; // Frekuensi (Hz)
      const E = 0.5 * k * A * A; // Energi total (Joule)

      // Hitung posisi setimbang (y_eq) relatif dari titik gantung (ceilingTop)
      // Di setimbang, gaya pegas = gaya gravitasi (anggap g=9.8) -> k * y_eq_phys = m * g
      const g = 9.8;
      const y_eq_phys = (m * g) / k; // Jarak fisis dari ujung pegas tanpa beban
      const skalaVisual = 500; // Berapa piksel per meter perpanjangan
      const y_eq_px = ceilingTop + initialSpringHeight + (y_eq_phys * skalaVisual); // Posisi Y setimbang di layar

      // Update tampilan hasil (saat tidak simulasi)
      if (!isSimulasiBerjalan && !isPaused) { // <-- Tambah cek !isPaused
          resultY.textContent = A.toFixed(3); // Posisi awal di amplitudo
          resultV.textContent = (0).toFixed(3); // Kecepatan awal nol
          resultT.textContent = T.toFixed(3);
          resultF.textContent = f.toFixed(3);
          resultE.textContent = E.toFixed(3);
          simulationTimeDisplay.textContent = '0.00 s';

          // Reset visual pegas & massa & garis setimbang
          const initialSpringStretch = y_eq_phys + A; // Perpanjangan awal
          springElement.style.height = initialSpringHeight + (initialSpringStretch * skalaVisual) + 'px';
          massElement.style.top = ceilingTop + parseFloat(springElement.style.height) + 'px';
          equilibriumLine.style.top = y_eq_px + 'px';
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
      runSimulation(savedTime, savedM, savedK, savedA);
  }

  // === 6. FUNGSI STOP ===
  function stopSimulation() {
      clearInterval(simulasiJalanID);
      isSimulasiBerjalan = false;
      isPaused = false;
      waktuSimulasi = 0;
      savedTime = 0;
      showStartButton();
  }

  // === 7. FUNGSI RESET VISUAL ===
  function resetSimulationVisuals() {
      waktuSimulasi = 0;
      simulationTimeDisplay.textContent = '0.00 s';
      updateTampilanDanHitung();
  }

  // === 8. EVENT LISTENER ===
  param1Slider.addEventListener('input', updateTampilanDanHitung);
  param2Slider.addEventListener('input', updateTampilanDanHitung);
  param3Slider.addEventListener('input', updateTampilanDanHitung);
  startButton.addEventListener('click', startSimulation);
  pauseButton.addEventListener('click', pauseSimulation);
  resumeButton.addEventListener('click', resumeSimulation);
  stopButton.addEventListener('click', stopSimulation);
  resetButton.addEventListener('click', resetSimulation);

  // === 9. FUNGSI SIMULASI (REFACTORED) ===
  function startSimulation() {
      clearInterval(simulasiJalanID);
      // Panggil updateTampilanDanHitung untuk mengatur ulang posisi awal berdasarkan parameter
      updateTampilanDanHitung();

      savedM = parseFloat(param1Slider.value);
      savedK = parseFloat(param2Slider.value);
      savedA = parseFloat(param3Slider.value);
      savedTime = 0;
      waktuSimulasi = 0;
      
      if (savedK <= 0 || savedM <= 0) {
          alert("Konstanta pegas dan massa harus positif.");
          return;
      }
      
      isSimulasiBerjalan = true;
      isPaused = false;
      showPauseStopButtons();
      
      runSimulation(savedTime, savedM, savedK, savedA);
  }

  function runSimulation(startTime, m, k, A) {
      const g = 9.8;
      const omega = Math.sqrt(k / m);
      const y_eq_phys = (m * g) / k;
      const skalaVisual = 500;
      const y_eq_px = ceilingTop + initialSpringHeight + (y_eq_phys * skalaVisual);
      
      waktuSimulasi = startTime;
      
      simulasiJalanID = setInterval(() => {
          const y_relatif_phys = A * Math.cos(omega * waktuSimulasi);
          const v_phys = -A * omega * Math.sin(omega * waktuSimulasi);
          const currentY_px = y_eq_px + (y_relatif_phys * skalaVisual);
          const currentSpringStretch = y_eq_phys + y_relatif_phys;
          
          springElement.style.height = initialSpringHeight + (currentSpringStretch * skalaVisual) + 'px';
          massElement.style.top = ceilingTop + parseFloat(springElement.style.height) + 'px';
          simulationTimeDisplay.textContent = waktuSimulasi.toFixed(2) + ' s';
          resultY.textContent = y_relatif_phys.toFixed(3);
          resultV.textContent = v_phys.toFixed(3);
          
          // Simpan state untuk pause/resume
          savedTime = waktuSimulasi;
          
          waktuSimulasi += 0.02;
      }, 20);
  }

  // === 10. FUNGSI RESET ===
  function resetSimulation() {
      stopSimulation();
      updateTampilanDanHitung(); // Cukup panggil ini, dia akan reset visual krn isSimulasiBerjalan = false
  }

  // === 11. INISIALISASI HALAMAN ===
  updateTampilanDanHitung();
}