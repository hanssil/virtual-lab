// validasi form login
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  
  // reset pesan error
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';
  
  // cek email dan password ga kosong
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
  
  // kalo validasi oke, proses login
  prosesLogin(email, password);
});

// fungsi login pake firebase
function prosesLogin(email, password) {
  const errorMessage = document.getElementById('errorMessage');
  
  // tampilin loading
  errorMessage.style.display = 'block';
  errorMessage.style.backgroundColor = '#e3f2fd';
  errorMessage.style.color = '#1976d2';
  errorMessage.style.borderColor = '#bbdefb';
  errorMessage.textContent = 'Sedang login...';
  
  // login ke firebase
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Login berhasil:', user.email);
      
      // simpen data login
      sessionStorage.setItem('userEmail', user.email);
      sessionStorage.setItem('userId', user.uid);
      sessionStorage.setItem('isLoggedIn', 'true');
      
      // ke halaman dashboard
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error('Error login:', error.code, error.message);
      
      let pesanError = 'Terjadi kesalahan saat login';
      
      // pesan error sesuai jenis error dari firebase
      switch(error.code) {
        case 'auth/user-not-found':
          pesanError = 'Email tidak terdaftar. Silakan daftar terlebih dahulu';
          break;
        case 'auth/wrong-password':
          pesanError = 'Password salah. Silakan coba lagi';
          break;
        case 'auth/invalid-email':
          pesanError = 'Format email tidak valid';
          break;
        case 'auth/user-disabled':
          pesanError = 'Akun ini telah dinonaktifkan';
          break;
        case 'auth/too-many-requests':
          pesanError = 'Terlalu banyak percobaan login. Coba lagi nanti';
          break;
        case 'auth/network-request-failed':
          pesanError = 'Koneksi internet bermasalah. Periksa koneksi Anda';
          break;
        case 'auth/invalid-credential':
          pesanError = 'Email atau password salah';
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
  const form = document.getElementById('loginForm');
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
