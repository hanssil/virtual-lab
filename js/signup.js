// validasi form signup
document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  
  // reset pesan error
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';
  
  // email dan password ga boleh kosong
  if (email === '' || password === '') {
    showError('Email dan password harus diisi');
    return;
  }
  
  // cek format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Format email tidak valid');
    return;
  }
  
  // password minimal 6 karakter
  if (password.length < 6) {
    showError('Password minimal 6 karakter');
    return;
  }
  
  // password harus ada huruf dan angka
  const adaHuruf = /[a-zA-Z]/.test(password);
  const adaAngka = /[0-9]/.test(password);
  
  if (!adaHuruf || !adaAngka) {
    showError('Password harus mengandung huruf dan angka');
    return;
  }
  
  // kalo validasi oke, proses registrasi
  prosesSignup(email, password);
});

// fungsi signup pake firebase
function prosesSignup(email, password) {
  const errorMessage = document.getElementById('errorMessage');
  
  // tampilin loading
  errorMessage.style.display = 'block';
  errorMessage.style.backgroundColor = '#e3f2fd';
  errorMessage.style.color = '#1976d2';
  errorMessage.style.borderColor = '#bbdefb';
  errorMessage.textContent = 'Sedang mendaftarkan akun...';
  
  // registrasi ke firebase
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Registrasi berhasil:', user.email);
      
      // tampilin pesan sukses
      errorMessage.style.backgroundColor = '#e8f5e9';
      errorMessage.style.color = '#2e7d32';
      errorMessage.style.borderColor = '#c8e6c9';
      errorMessage.textContent = 'Registrasi berhasil! Mengalihkan ke halaman login...';
      
      // redirect ke login setelah 2 detik
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    })
    .catch((error) => {
      console.error('Error signup:', error.code, error.message);
      
      let pesanError = 'Terjadi kesalahan saat mendaftar';
      
      // pesan error sesuai jenis error dari firebase
      switch(error.code) {
        case 'auth/email-already-in-use':
          pesanError = 'Email sudah terdaftar. Silakan login atau gunakan email lain';
          break;
        case 'auth/invalid-email':
          pesanError = 'Format email tidak valid';
          break;
        case 'auth/weak-password':
          pesanError = 'Password terlalu lemah. Minimal 6 karakter';
          break;
        case 'auth/operation-not-allowed':
          pesanError = 'Registrasi dengan email belum diaktifkan. Hubungi admin';
          break;
        case 'auth/network-request-failed':
          pesanError = 'Koneksi internet bermasalah. Periksa koneksi Anda';
          break;
        default:
          pesanError = `Error: ${error.message}`;
      }
      
      showError(pesanError);
    });
}

// fungsi buat nampilin pesan error
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  errorMessage.style.backgroundColor = '#fee';
  errorMessage.style.color = '#c33';
  errorMessage.style.borderColor = '#fcc';
  
  // efek getar di form
  const form = document.getElementById('signupForm');
  form.classList.add('shake');
  setTimeout(() => {
    form.classList.remove('shake');
  }, 500);
}

// ilangin pesan error pas user mulai ngetik
document.getElementById('email').addEventListener('input', function() {
  document.getElementById('errorMessage').style.display = 'none';
});

document.getElementById('password').addEventListener('input', function() {
  document.getElementById('errorMessage').style.display = 'none';
});

// cek kalo user udah login, langsung ke dashboard
window.addEventListener('load', function() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User sudah login:', user.email);
      window.location.href = 'index.html';
    }
  });
});
