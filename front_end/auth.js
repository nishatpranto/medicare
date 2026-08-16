let selectedRole = 'patient';

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-toggle button').forEach(b => b.classList.remove('active'));
  document.getElementById(`role-${role}`).classList.add('active');
}

async function handleRegister(e) { 
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const phone = document.getElementById('reg-phone').value;
  const password = document.getElementById('reg-password').value;
  const errorBox = document.getElementById('error-box');
 
  try {
    const data = await apiFetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, role: selectedRole })
    });
    setSession(data.token, data.user);
    window.location.href = selectedRole === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
  } catch (err) {
    console.log(err)
    errorBox.textContent = err.message;
    errorBox.style.display = 'block';
  }
}

async function handleLogin(e) {
  e.preventDefault(); 
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorBox = document.getElementById('error-box');
  try {
    const data = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }); 
    setSession(data.token, data.user);
    console.log(data)
    window.location.href = data.user.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
  } catch (err) {
    console.log(err)
    errorBox.textContent = err.message;
    errorBox.style.display = 'block';
  }
}