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
            pertanyaan: "Hukum yang menyatakan bahwa gaya pegas berbanding lurus dengan pertambahan panjangnya ($ F = k \\times \\Delta x $) adalah...",
            pilihan: [
                "Hukum Newton",
                "Hukum Hooke",
                "Hukum Pascal",
                "Hukum Archimedes"
            ],
            jawaban: "B",
            penjelasan: "Hukum Hooke ($ F = k \\times \\Delta x $) menyatakan hubungan antara gaya (F), konstanta pegas (k), dan pertambahan panjang (Δx)."
        },
        {
            pertanyaan: "Manakah rumus untuk menghitung Periode (T) getaran pada pegas?",
            pilihan: [
                "$$ T = 2\\pi \\sqrt{\\frac{k}{m}} $$",
                "$$ T = 2\\pi \\sqrt{\\frac{m}{k}} $$",
                "$$ T = \\frac{1}{2\\pi} \\sqrt{\\frac{k}{m}} $$",
                "$$ T = k \times m $$"
            ],
            jawaban: "B",
            penjelasan: "Rumus periode getaran pegas adalah $ T = 2\\pi \\sqrt{\\frac{m}{k}} $, di mana m = massa dan k = konstanta pegas."
        },
        {
            pertanyaan: "Manakah rumus untuk menghitung Energi Potensial Pegas ($ E_p $)?",
            pilihan: [
                "$$ E_p = mgh $$",
                "$$ E_p = \\frac{1}{2} m v^2 $$",
                "$$ E_p = \\frac{1}{2} k x^2 $$",
                "$$ E_p = F \\times x $$"
            ],
            jawaban: "C",
            penjelasan: "Energi potensial yang tersimpan pada pegas dihitung dengan rumus $ E_p = \\frac{1}{2} k x^2 $, di mana k = konstanta pegas dan x = simpangan."
        },
        {
            pertanyaan: "Sebuah pegas dengan konstanta 200 N/m ditarik sejauh 5 cm. Berapa gaya yang bekerja pada pegas?",
            pilihan: [
                "1 N",
                "10 N",
                "100 N",
                "1000 N"
            ],
            jawaban: "B",
            penjelasan: "Ubah $ \\Delta x = 5 $ cm = 0.05 m. Maka $ F = k \\times \\Delta x = 200 \\times 0.05 = 10 $ N."
        },
        {
            pertanyaan: "Jika massa beban (m) pada pegas ditambah menjadi 4 kali semula, apa yang terjadi pada periode (T) getarannya?",
            pilihan: [
                "Periode menjadi 2 kali semula",
                "Periode menjadi 4 kali semula",
                "Periode menjadi setengah kali semula",
                "Periode tetap"
            ],
            jawaban: "A",
            penjelasan: "Karena $ T = 2\\pi \\sqrt{\\frac{m}{k}} $, periode (T) berbanding lurus dengan akar massa ($ \\sqrt{m} $). Jika m menjadi 4m, maka T baru adalah $ \\sqrt{4m} = 2 \\times \\sqrt{m} $. Jadi, periode menjadi 2 kali semula."
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
            
            const res = await fetch(`${API_URL}/kuis/pegas?uid=${encodeURIComponent(user.uid)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Data kuis pegas sebelumnya (API):', data);
                
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

            const res = await fetch(`${API_URL}/kuis/pegas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders()),
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('Gagal simpan hasil kuis pegas (API):', res.status, err);
            } else {
                const saved = await res.json();
                console.log('Hasil kuis pegas tersimpan (API):', saved);
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