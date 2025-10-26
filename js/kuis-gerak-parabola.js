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
    // data soal-soal kuis
    const soalKuis = [
        {
            pertanyaan: "Gerak parabola merupakan perpaduan antara dua gerak, yaitu...",
            pilihan: [
                "GLB pada sumbu X dan GLBB pada sumbu Y",
                "GLBB pada sumbu X dan GLB pada sumbu Y",
                "GLB pada kedua sumbu",
                "GLBB pada kedua sumbu"
            ],
            jawaban: "A",
            penjelasan: "Gerak parabola adalah perpaduan GLB (kecepatan horizontal tetap) pada sumbu X dan GLBB (pengaruh gravitasi) pada sumbu vertikal Y."
        },
        {
            pertanyaan: "Manakah rumus untuk menghitung Jarak Mendatar Maksimum (R)?",
            pilihan: [
                "$$ R = \\frac{v_0^2 \\sin^2 \\theta}{2g} $$",
                "$$ R = \\frac{2 v_0 \\sin \\theta}{g} $$",
                "$$ R = \\frac{v_0^2 \\sin(2\\theta)}{g} $$",
                "$$ R = v_0 \\cos \\theta $$"
            ],
            jawaban: "C",
            penjelasan: "Rumus jarak mendatar maksimum (Range) adalah $ R = \\frac{v_0^2 \\sin(2\\theta)}{g} $."
        },
        {
            pertanyaan: "Manakah rumus untuk menghitung Tinggi Maksimum (h)?",
            pilihan: [
                "$$ h = \\frac{v_0^2 \\sin^2 \\theta}{2g} $$",
                "$$ h = \\frac{v_0^2 \\sin(2\\theta)}{g} $$",
                "$$ h = v_0 \\sin \\theta $$",
                "$$ h = \\frac{(v_0 \\cos \\theta)^2}{2g} $$"
            ],
            jawaban: "A",
            penjelasan: "Rumus tinggi maksimum adalah $ h = \\frac{(v_0 \\sin \\theta)^2}{2g} $ atau $ h = \\frac{v_0^2 \\sin^2 \\theta}{2g} $."
        },
        {
            pertanyaan: "Sebuah bola ditendang dengan kecepatan 20 m/s pada sudut 45°. Berapa jarak mendatarnya? (g = 10 m/s²)",
            pilihan: [
                "10 m",
                "20 m",
                "40 m",
                "80 m"
            ],
            jawaban: "C",
            penjelasan: "Jawab: $ R = \\frac{v_0^2 \\sin(2\\theta)}{g} = \\frac{(20^2) \\sin(2 \\times 45^\\circ)}{10} = \\frac{400 \\times \\sin(90^\\circ)}{10} = \\frac{400 \\times 1}{10} = 40 $ m."
        },
        {
            pertanyaan: "Agar sebuah proyektil mencapai jarak mendatar terjauh (R maksimum), berapakah sudut elevasi (θ) yang ideal?",
            pilihan: [
                "30°",
                "45°",
                "60°",
                "90°"
            ],
            jawaban: "B",
            penjelasan: "Jarak maksimum dicapai saat nilai $ \\sin(2\\theta) $ maksimum (yaitu 1). Ini terjadi ketika $ 2\\theta = 90^\\circ $, sehingga $ \\theta = 45^\\circ $."
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
    const hasilIkon = document.getElementById('hasil-ikon');
    const hasilSkorTeks = document.getElementById('hasil-skor-teks');
    const hasilPersenTeks = document.getElementById('hasil-persen-teks');
    const hasilFeedbackBox = document.getElementById('hasil-feedback-box');
    const hasilFeedbackTeks = document.getElementById('hasil-feedback-teks');
    const hasilFeedbackEmoji = document.getElementById('hasil-feedback-emoji');

    // konfigurasi API sederhana
    const API_BASE = (typeof window.API_BASE !== 'undefined' && window.API_BASE !== null) ? window.API_BASE : 'http://localhost:3000';
    const API_URL = API_BASE === '' ? '/api' : `${API_BASE}/api`;

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
            
            const res = await fetch(`${API_URL}/kuis/parabola?uid=${encodeURIComponent(user.uid)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Data kuis parabola sebelumnya (API):', data);
                
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

    async function simpanHasilKuis() {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('User tidak terautentikasi');
                return;
            }

            const persen = (skor / soalKuis.length) * 100;
            const payload = {
                uid: user.uid,
                userEmail: user.email,
                lastScore: parseFloat(persen.toFixed(2)),
                totalQuestions: soalKuis.length,
                correctAnswers: skor
            };

            const res = await fetch(`${API_URL}/kuis/parabola`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('Gagal simpan hasil kuis parabola (API):', res.status, err);
            } else {
                const saved = await res.json();
                console.log('Hasil kuis parabola tersimpan (API):', saved);
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

        muatNilaiSebelumnya();
        muatSoal();
    }

    function muatSoal() {
        jawabanTerpilih = null;
        penjelasanBox.style.display = 'none';
        submitButton.style.display = 'block';
        nextButton.style.display = 'none';
        penjelasanBox.classList.remove('benar', 'salah');

        const soal = soalKuis[nomorSoalSekarang];
        infoPertanyaan.textContent = `Pertanyaan ${nomorSoalSekarang + 1} dari ${soalKuis.length}`;
        infoSkor.textContent = `Skor: ${skor} / ${soalKuis.length}`;
        pertanyaanTeks.textContent = soal.pertanyaan;
        pilihanContainer.innerHTML = '';

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

        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([pilihanContainer, pertanyaanTeks]);
        }
    }

    function pilihJawaban(button) {
        if (kuisSelesai || submitButton.style.display === 'none') return;
        Array.from(pilihanContainer.children).forEach(btn => {
            btn.classList.remove('selected');
        });
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
        Array.from(pilihanContainer.children).forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.pilihan === soal.jawaban) {
                btn.classList.add('correct');
            }
        });

        penjelasanTeks.textContent = soal.penjelasan;
        penjelasanBox.style.display = 'flex';

        if (jawabanBenar) {
            skor++;
            document.querySelector(`.pilihan-ganda.selected`).classList.add('correct');
            penjelasanBox.classList.add('benar');
            penjelasanIkon.textContent = '✔';
        } else {
            document.querySelector(`.pilihan-ganda.selected`).classList.add('incorrect');
            penjelasanIkon.textContent = 'i';
        }

        // render mathjax untuk penjelasan
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([penjelasanTeks]);
        }

        infoSkor.textContent = `Skor: ${skor} / ${soalKuis.length}`;
        submitButton.style.display = 'none';
        nextButton.style.display = 'block';

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
        hasilFeedbackBox.className = 'hasil-feedback-badge';

        // simpen hasil ke firestore
        simpanHasilKuis();

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
