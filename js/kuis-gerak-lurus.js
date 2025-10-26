// tunggu user login dulu baru jalanin kuis
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            initKuis();
        }
    });
});

// semua fungsi kuis ada disini
function initKuis() {
    // data soal-soal kuis (bisa diubah sesuai kebutuhan)
    const soalKuis = [
        {
            pertanyaan: "Apa yang dimaksud dengan Gerak Lurus Beraturan (GLB)?",
            pilihan: [
                "Gerak dengan kecepatan berubah",
                "Gerak dengan kecepatan tetap",
                "Gerak dengan percepatan tetap",
                "Gerak melingkar"
            ],
            jawaban: "B",
            penjelasan: "GLB adalah gerak benda pada lintasan lurus dengan kecepatan tetap (konstan)."
        },
        {
            pertanyaan: "Rumus yang benar untuk GLB adalah...",
            pilihan: [
                "$$ s = v \\times t $$",
                "$$ s = v_0 t + \\frac{1}{2} a t^2 $$",
                "$$ v = v_0 + a t $$",
                "$$ v^2 = v_0^2 + 2 a s $$"
            ],
            jawaban: "A",
            penjelasan: "Rumus GLB adalah s = v x t karena kecepatan (v) konstan dan tidak ada percepatan (a=0)."
        },
        {
            pertanyaan: "Pada GLB, nilai percepatan (a) adalah...",
            pilihan: [
                "a > 0 (dipercepat)",
                "a < 0 (diperlambat)",
                "a = 0 (nol)",
                "a = 9.8 m/s²"
            ],
            jawaban: "C",
            penjelasan: "Karena kecepatannya tetap, maka tidak ada perubahan kecepatan. Percepatan adalah perubahan kecepatan, sehingga percepatannya nol (a=0)."
        },
        {
            pertanyaan: "Sebuah mobil bergerak dengan kecepatan tetap 72 km/jam. Berapa jarak yang ditempuh dalam 10 detik?",
            pilihan: [
                "720 meter",
                "200 meter",
                "20 meter",
                "72 meter"
            ],
            jawaban: "B",
            penjelasan: "Pertama, ubah v = 72 km/jam menjadi m/s. (72 * 1000) / 3600 = 20 m/s. Lalu, s = v x t = 20 m/s * 10 s = 200 meter."
        },
        {
            pertanyaan: "Grafik hubungan Jarak (s) terhadap Waktu (t) pada GLB berbentuk...",
            pilihan: [
                "Garis lurus horizontal",
                "Garis lurus miring ke atas (linear)",
                "Garis melengkung (parabola)",
                "Garis lurus vertikal"
            ],
            jawaban: "B",
            penjelasan: "Karena s = v*t, jarak (s) berbanding lurus dengan waktu (t). Ini menghasilkan grafik linear (garis lurus miring) yang dimulai dari nol."
        }
    ];

    // ambil element dari HTML
    const kuisContainer = document.getElementById('kuis-container');
    const hasilContainer = document.getElementById('hasil-container');
    const infoPertanyaan = document.getElementById('info-pertanyaan');
    const infoSkor = document.getElementById('info-skor');
    const pertanyaanTeks = document.getElementById('pertanyaan-teks');
    const pilihanContainer = document.getElementById('pilihan-ganda-container');
    const penjelasanBox = document.getElementById('penjelasan-box');
    const penjelasanTeks = document.getElementById('penjelasan-teks');
    const penjelasanIkon = document.getElementById('penjelasan-ikon');
    const submitButton = document.getElementById('submit-button');
    const nextButton = document.getElementById('next-button');
    const ulangButton = document.getElementById('ulang-button');

    // element hasil kuis
    const hasilIkon = document.getElementById('hasil-ikon');
    const hasilSkorTeks = document.getElementById('hasil-skor-teks');
    const hasilPersenTeks = document.getElementById('hasil-persen-teks');
    const hasilFeedbackBox = document.getElementById('hasil-feedback-box');
    const hasilFeedbackTeks = document.getElementById('hasil-feedback-teks');
    const hasilFeedbackEmoji = document.getElementById('hasil-feedback-emoji');

    // konfigurasi API sederhana
    const API_BASE = window.API_BASE || 'http://localhost:3000';
    const API_URL = `${API_BASE}/api`;

    async function getAuthHeaders() {
        const user = auth.currentUser;
        if (!user) return {};
        try {
            const token = await user.getIdToken();
            return { Authorization: `Bearer ${token}` };
        } catch (e) {
            console.warn('Gagal ambil ID token:', e);
            return {};
        }
    }

    // variabel buat nyimpen state kuis
    let nomorSoalSekarang = 0;
    let skor = 0;
    let jawabanTerpilih = null;
    let kuisSelesai = false;

    // fungsi buat load nilai sebelumnya dari backend API
    async function muatNilaiSebelumnya() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const res = await fetch(`${API_URL}/kuis/gerak-lurus?uid=${encodeURIComponent(user.uid)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Data kuis sebelumnya (API):', data);
                
                const banner = document.createElement('div');
                banner.style.cssText = 'background: #e3f2fd; border-left: 4px solid #2196F3; padding: 12px; margin-bottom: 20px; border-radius: 4px; font-size: 14px;';
                banner.innerHTML = `
                    <strong>Nilai Terakhir:</strong> ${data.lastScore}% 
                    (${data.correctAnswers}/${data.totalQuestions} benar) | 
                    Percobaan: ${data.attempts || 1}x
                `;
                // cek dulu banner belum ada
                if (!kuisContainer.querySelector('div[style*="background: #e3f2fd"]')) {
                    kuisContainer.insertBefore(banner, kuisContainer.firstChild);
                }
            } else if (res.status !== 404) {
                console.warn('Gagal ambil nilai sebelumnya:', res.status);
            }
        } catch (error) {
            console.error('Error load previous score:', error);
        }
    }

    // fungsi buat simpen hasil kuis ke backend API
    async function simpanHasilKuis(skor, totalSoal) {
        try {
            const user = auth.currentUser;
            
            if (!user) {
                console.error('User tidak terautentikasi');
                return;
            }

            console.log('User terdeteksi:', user.email, 'UID:', user.uid);

            const persen = (skor / totalSoal) * 100;
            const payload = {
                uid: user.uid,
                userEmail: user.email,
                lastScore: parseFloat(persen.toFixed(2)),
                totalQuestions: totalSoal,
                correctAnswers: skor
            };

            const res = await fetch(`${API_URL}/kuis/gerak-lurus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('Gagal simpan hasil kuis (API):', res.status, err);
            } else {
                const saved = await res.json();
                console.log('Hasil kuis tersimpan (API):', saved);
            }
        } catch (error) {
            console.error('Error menyimpan hasil kuis:', error.code, error.message);
            console.error('Full error:', error);
        }
    }

    function mulaiKuis() {
        nomorSoalSekarang = 0;
        skor = 0;
        kuisSelesai = false;
        hasilContainer.style.display = 'none';
        kuisContainer.style.display = 'block';
        
        // hapus banner nilai lama kalo ada
        const oldBanner = kuisContainer.querySelector('div[style*="background: #e3f2fd"]');
        if (oldBanner) {
            oldBanner.remove();
        }
        
        // load nilai sebelumnya
        muatNilaiSebelumnya();
        
        muatSoal();
    }

    function muatSoal() {
        // reset state
        jawabanTerpilih = null;
        penjelasanBox.style.display = 'none';
        submitButton.style.display = 'block';
        nextButton.style.display = 'none';
        
        // hapus class benar/salah dari box penjelasan
        penjelasanBox.classList.remove('benar', 'salah');

        // ambil data soal
        const soal = soalKuis[nomorSoalSekarang];
        
        // update info
        infoPertanyaan.textContent = `Pertanyaan ${nomorSoalSekarang + 1} dari ${soalKuis.length}`;
        infoSkor.textContent = `Skor: ${skor} / ${soalKuis.length}`;
        pertanyaanTeks.textContent = soal.pertanyaan;

        // kosongin pilihan ganda
        pilihanContainer.innerHTML = '';
        
        // buat tombol pilihan ganda
        soal.pilihan.forEach(pilihan => {
            const button = document.createElement('button');
            button.className = 'pilihan-ganda';
            button.dataset.pilihan = ['A', 'B', 'C', 'D'][soal.pilihan.indexOf(pilihan)]; 
            
            button.innerHTML = `
                <span class="pilihan-label">${button.dataset.pilihan}</span>
                <span class="pilihan-teks">${pilihan}</span>
            `;

            button.addEventListener('click', () => pilihJawaban(button));
            pilihanContainer.appendChild(button);
        });

        // render mathjax kalo ada rumus
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([pilihanContainer, pertanyaanTeks]);
        }
    }

    function pilihJawaban(button) {
        if (kuisSelesai || submitButton.style.display === 'none') return;

        // hapus selected dari semua tombol
        Array.from(pilihanContainer.children).forEach(btn => {
            btn.classList.remove('selected');
        });

        // tambahin selected ke tombol yang diklik
        button.classList.add('selected');
        jawabanTerpilih = button.dataset.pilihan;
    }

    function submitJawaban() {
        if (jawabanTerpilih === null) {
            alert('Silakan pilih salah satu jawaban!');
            return;
        }

        const soal = soalKuis[nomorSoalSekarang];
        const jawabanBenar = jawabanTerpilih === soal.jawaban;

        // nonaktifin semua tombol pilihan
        Array.from(pilihanContainer.children).forEach(btn => {
            btn.disabled = true;
            // tandain jawaban benar
            if (btn.dataset.pilihan === soal.jawaban) {
                btn.classList.add('correct');
            }
        });

        // tampilin penjelasan
        penjelasanTeks.textContent = soal.penjelasan;
        penjelasanBox.style.display = 'flex';

        if (jawabanBenar) {
            skor++;
            // tandain pilihan user sebagai correct
            document.querySelector(`.pilihan-ganda.selected`).classList.add('correct');
            penjelasanBox.classList.add('benar');
            penjelasanIkon.textContent = '✔';
        } else {
            // tandain pilihan user sebagai incorrect
            document.querySelector(`.pilihan-ganda.selected`).classList.add('incorrect');
            penjelasanIkon.textContent = 'i';
        }

        // render mathjax untuk penjelasan
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([penjelasanTeks]);
        }

        // update skor
        infoSkor.textContent = `Skor: ${skor} / ${soalKuis.length}`;
        
        // ganti tombol
        submitButton.style.display = 'none';
        nextButton.style.display = 'block';

        // cek apa ini soal terakhir
        if (nomorSoalSekarang === soalKuis.length - 1) {
            nextButton.textContent = 'Lihat Hasil Kuis';
            kuisSelesai = true;
        }
    }

    function soalBerikutnya() {
        if (kuisSelesai) {
            tampilkanHasil();
        } else {
            nomorSoalSekarang++;
            muatSoal();
            nextButton.textContent = 'Pertanyaan Selanjutnya';
        }
    }

    function tampilkanHasil() {
        kuisContainer.style.display = 'none';
        hasilContainer.style.display = 'block';

        const persen = (skor / soalKuis.length) * 100;
        
        hasilSkorTeks.textContent = `${skor} / ${soalKuis.length}`;
        hasilPersenTeks.textContent = `Skor Anda: ${persen.toFixed(0)}%`;

        // simpen hasil ke firestore
        simpanHasilKuis(skor, soalKuis.length);

        // hapus class feedback lama
        hasilFeedbackBox.className = 'hasil-feedback-badge';

        if (skor === 5) {
            hasilFeedbackTeks.textContent = 'Luar Biasa!';
            hasilFeedbackEmoji.textContent = '';
            hasilIkon.src = 'logo_kuis.jpg';
            hasilFeedbackBox.classList.add('feedback-luar-biasa');
        } else if (skor === 4) {
            hasilFeedbackTeks.textContent = 'Bagus!';
            hasilFeedbackEmoji.textContent = '';
            hasilIkon.src = 'logo_kuis.jpg';
            hasilFeedbackBox.classList.add('feedback-bagus');
        } else if (skor === 3) {
            hasilFeedbackTeks.textContent = 'Cukup Baik';
            hasilFeedbackEmoji.textContent = '';
            hasilIkon.src = 'logo_materi.jpg';
            hasilFeedbackBox.classList.add('feedback-cukup');
        } else {
            hasilFeedbackTeks.textContent = 'Perlu Belajar Lagi';
            hasilFeedbackEmoji.textContent = '';
            hasilIkon.src = 'logo_materi.jpg';
            hasilFeedbackBox.classList.add('feedback-kurang');
        }
    }

    // event listeners
    submitButton.addEventListener('click', submitJawaban);
    nextButton.addEventListener('click', soalBerikutnya);
    ulangButton.addEventListener('click', mulaiKuis);

    // mulai kuis
    mulaiKuis();
}