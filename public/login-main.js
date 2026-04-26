(function () {
  function tokenIsValid(t) {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  const token = localStorage.getItem('docuia_token');
  if (token) {
    if (tokenIsValid(token)) {
      window.location.href = '/';
    } else {
      localStorage.removeItem('docuia_token');
      localStorage.removeItem('docuia_user');
    }
  }

  const titles = {
    login: ['Bienvenida de <em>vuelta</em>, Prof.', 'Tu espacio de trabajo tiene informes esperándote.'],
    signup: ['Dedica tu tiempo a <em>enseñar</em>, no a redactar.', 'Más de 160,000 docentes en el sistema fiscal ecuatoriano podrían beneficiarse de DocuIA.'],
    recover: ['Todo el mundo <em>olvida</em>.', 'Te enviamos un enlace seguro. En 2 minutos estás de vuelta.'],
  };

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    document.getElementById('visual-title').innerHTML = titles[id][0];
    document.getElementById('visual-desc').textContent = titles[id][1];
    document.querySelectorAll('.msg').forEach(m => {
      m.className = 'msg';
      m.textContent = '';
    });
  }

  function togglePw(id, el) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
      input.type = 'text';
      el.textContent = 'ocultar';
    } else {
      input.type = 'password';
      el.textContent = 'mostrar';
    }
  }

  function showMsg(elId, text, type) {
    const el = document.getElementById(elId);
    el.className = 'msg ' + type;
    el.textContent = text;
  }

  function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (loading) {
      btn.disabled = true;
      btn.dataset.text = btn.textContent;
      btn.innerHTML = '<span class="spinner"></span> Procesando...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.text;
    }
  }

  async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pw = document.getElementById('login-pw').value;
    if (!email || !pw) {
      showMsg('login-msg', 'Complete todos los campos.', 'error');
      return;
    }

    setLoading('login-btn', true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password: pw }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('docuia_token', data.access_token);
        localStorage.setItem('docuia_user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        showMsg('login-msg', data.error || 'Credenciales incorrectas.', 'error');
      }
    } catch {
      showMsg('login-msg', 'Error de conexión. Intente nuevamente.', 'error');
    }
    setLoading('login-btn', false);
  }

  async function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const role = document.getElementById('signup-role').value;
    const institucion = document.getElementById('signup-institucion').value.trim();
    const cargo = document.getElementById('signup-cargo').value.trim();
    const pw = document.getElementById('signup-pw').value;
    const terms = document.getElementById('signup-terms').checked;

    if (!name || !email || !pw || !institucion) {
      showMsg('signup-msg', 'Complete todos los campos obligatorios.', 'error');
      return;
    }
    if (pw.length < 6) {
      showMsg('signup-msg', 'La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (!terms) {
      showMsg('signup-msg', 'Debe aceptar los términos y condiciones.', 'error');
      return;
    }

    setLoading('signup-btn', true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email,
          password: pw,
          name,
          role,
          institucion,
          cargo: cargo || role,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.session?.access_token) {
          localStorage.setItem('docuia_token', data.session.access_token);
          localStorage.setItem('docuia_user', JSON.stringify(data.user));
          window.location.href = '/';
        } else {
          showMsg('signup-msg', 'Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.', 'success');
          setTimeout(() => showScreen('login'), 3000);
        }
      } else {
        showMsg('signup-msg', data.error || 'Error al crear la cuenta.', 'error');
      }
    } catch {
      showMsg('signup-msg', 'Error de conexión. Intente nuevamente.', 'error');
    }
    setLoading('signup-btn', false);
  }

  async function handleRecover() {
    const email = document.getElementById('recover-email').value.trim();
    if (!email) {
      showMsg('recover-msg', 'Ingrese su correo.', 'error');
      return;
    }

    setLoading('recover-btn', true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recover', email }),
      });
      showMsg('recover-msg', 'Enviado. Revisa tu correo. Si no lo ves, busca en spam.', 'success');
    } catch {
      showMsg('recover-msg', 'Error de conexión.', 'error');
    }
    setLoading('recover-btn', false);
  }

  function bindNav(el, fn) {
    if (!el) return;
    el.addEventListener('click', e => {
      e.preventDefault();
      fn();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindNav(document.getElementById('nav-login-to-signup'), () => showScreen('signup'));
    bindNav(document.getElementById('nav-login-to-recover'), () => showScreen('recover'));
    bindNav(document.getElementById('nav-signup-to-login'), () => showScreen('login'));
    bindNav(document.getElementById('nav-recover-to-login'), () => showScreen('login'));
    bindNav(document.getElementById('nav-sso-signup'), () => showScreen('signup'));

    document.getElementById('nav-sso-home')?.addEventListener('click', () => {
      window.location.href = '/';
    });

    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('signup-btn')?.addEventListener('click', handleSignup);
    document.getElementById('recover-btn')?.addEventListener('click', handleRecover);

    const tLogin = document.getElementById('toggle-login-pw');
    if (tLogin) tLogin.addEventListener('click', () => togglePw('login-pw', tLogin));

    const tSignup = document.getElementById('toggle-signup-pw');
    if (tSignup) tSignup.addEventListener('click', () => togglePw('signup-pw', tSignup));

    document.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const screen = inp.closest('.screen');
        if (!screen) return;
        if (screen.id === 'screen-login') handleLogin();
        else if (screen.id === 'screen-signup') handleSignup();
        else if (screen.id === 'screen-recover') handleRecover();
      });
    });
  });
})();
