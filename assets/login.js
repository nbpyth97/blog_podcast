import { supabase } from './supabase-client.js';

const form = document.getElementById('login-form');
const msg = document.getElementById('form-msg');

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) window.location.href = 'escrever.html';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.innerHTML = '';
  const email = form.email.value.trim();
  const password = form.password.value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    msg.innerHTML = '<p class="msg error">Credenciais inválidas.</p>';
    return;
  }
  window.location.href = 'escrever.html';
});
