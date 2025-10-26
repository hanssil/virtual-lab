// tunggu user login dulu
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      jalankanLogika();
    }
  });
});

// fungsi utama buat atur halaman topic list
function jalankanLogika() {
  // ambil parameter fitur dari URL (materi, kuis, atau lab)
  const params = new URLSearchParams(window.location.search);
  const fitur = params.get('fitur');

  // ambil element yang mau diubah
  const pageTitleElement = document.querySelector('.page-title');
  const topicListTitleElement = document.getElementById('topic-list-title');
  const topicListSubtitleElement = document.getElementById('topic-list-subtitle');
  const topicCards = document.querySelectorAll('.topic-card');

  // tentuin judul berdasarkan fitur yang dipilih
  let pageTitle = '';
  let mainTitle = '';
  let subTitle = '';

  if (fitur === 'materi') {
    pageTitle = 'Materi Pembelajaran';
    mainTitle = 'Pilih Topik Materi';
    subTitle = 'Pilih topik fisika yang ingin Anda pelajari';
  } else if (fitur === 'kuis') {
    pageTitle = 'Kuis Interaktif';
    mainTitle = 'Pilih Topik Kuis';
    subTitle = 'Pilih topik fisika untuk memulai kuis';
  } else if (fitur === 'lab') {
    pageTitle = 'Lab Virtual';
    mainTitle = 'Pilih Topik Simulasi';
    subTitle = 'Pilih topik fisika yang ingin Anda simulasikan';
  } else {
    pageTitle = 'Daftar Topik';
    mainTitle = 'Topik Tersedia';
    subTitle = 'Silakan pilih fitur dari halaman utama.';
  }

  // update teks judul di halaman
  if (pageTitleElement) pageTitleElement.textContent = pageTitle;
  if (topicListTitleElement) topicListTitleElement.textContent = mainTitle;
  if (topicListSubtitleElement) topicListSubtitleElement.textContent = subTitle;
  document.title = pageTitle + ' - Virtual Lab Fisika';

  // update link href dan status di setiap kartu topik
  topicCards.forEach((card, index) => {
    let targetUrl = '#';
    const topicTitleElement = card.querySelector('h2');
    const topicSlug = topicTitleElement ? topicTitleElement.textContent.toLowerCase().replace(/\s+/g, '-') : `topic-${index}`;

    if (!fitur) {
        card.style.opacity = '0.6';
        card.style.pointerEvents = 'none';
        const button = card.querySelector('.pilih-topic-button');
        if (button) button.textContent = 'Pilih Fitur Dulu';
        targetUrl = '#';
    } else if (fitur === 'materi') {
      // link ke halaman materi
      if (index === 0) {
        targetUrl = 'materi-glb.html';
      } else if (index === 1) {
        targetUrl = 'materi-parabola.html';
      } else if (index === 2) {
        targetUrl = 'materi-pegas.html'; 
      } else { 
        card.style.opacity = '0.6';
        card.style.pointerEvents = 'none';
        const button = card.querySelector('.pilih-topic-button');
        if (button) button.textContent = 'Segera Hadir';
        targetUrl = '#';
      }
    } else if (fitur === 'kuis') {
      // link ke halaman kuis
      if (index === 0) {
        targetUrl = 'kuis-gerak-lurus.html';
      } else if (index === 1) {
        targetUrl = 'kuis-gerak-parabola.html';
      } else if (index === 2) {
        targetUrl = 'kuis-pegas.html';
      } else { 
        targetUrl = '#'; 
        card.style.opacity = '0.6';
        card.style.pointerEvents = 'none';
        const button = card.querySelector('.pilih-topic-button');
        if (button) button.textContent = 'Segera Hadir';
      }
    } else if (fitur === 'lab') {
      // link ke halaman lab
      if (index === 0) {
        targetUrl = 'lab.html';
      } else if (index === 1) {
        targetUrl = 'lab-parabola.html';
      } else if (index === 2) {
        targetUrl = 'lab-pegas.html';
      } else {
        card.style.opacity = '0.6';
        card.style.pointerEvents = 'none';
        const button = card.querySelector('.pilih-topic-button');
        if (button) button.textContent = 'Segera Hadir';
        targetUrl = '#';
      }
    }

    // atur href pada kartu
    card.href = targetUrl;
  });
}