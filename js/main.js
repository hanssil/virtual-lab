// cek status login user
auth.onAuthStateChanged((user) => {
  if (user) {
    // kalo udah login, tampilin emailnya
    console.log('User logged in:', user.email);
    
    const userEmailSpan = document.getElementById('userEmail');
    if (userEmailSpan) {
      userEmailSpan.textContent = user.email;
    }
  } else {
    // belum login, redirect ke halaman login
    console.log('User not logged in, redirecting to login...');
    const currentPage = window.location.pathname.split('/').pop();
    // cuma redirect kalo bukan di halaman login/signup
    if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
      window.location.href = 'login.html';
    }
  }
});

// fungsi logout pake modal konfirmasi
const logoutButton = document.getElementById('logoutButton');
const logoutModal = document.getElementById('logoutModal');
const cancelLogoutBtn = document.getElementById('cancelLogout');
const confirmLogoutBtn = document.getElementById('confirmLogout');

if (logoutButton && logoutModal) {
  // pas klik tombol logout, munculin modal
  logoutButton.addEventListener('click', function() {
    logoutModal.style.display = 'flex';
  });

  // tombol batal diklik, tutup modal
  cancelLogoutBtn.addEventListener('click', function() {
    logoutModal.style.display = 'none';
  });

  // klik di luar modal, tutup juga
  logoutModal.addEventListener('click', function(e) {
    if (e.target === logoutModal) {
      logoutModal.style.display = 'none';
    }
  });

  // tombol konfirmasi logout
  confirmLogoutBtn.addEventListener('click', function() {
    logoutModal.style.display = 'none';
    
    // proses logout
    auth.signOut()
      .then(() => {
        console.log('User logged out successfully');
        
        // hapus data session
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('isLoggedIn');
        
        // balik ke halaman login
        window.location.href = 'login.html';
      })
      .catch((error) => {
        console.error('Error logging out:', error);
        alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
      });
  });
}

console.log("Main JavaScript loaded.");