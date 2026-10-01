// Alternar abas
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  if (tab === 'votacao') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('tab-votacao').classList.add('active');
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('tab-sugestoes').classList.add('active');
  }
}

// Carregar Sugestões no Painel do Admin com Botão de Apagar
async function carregarSugestoesAdmin() {
  const emailInput = document.getElementById('emailAdmin');
  const msgAdmin = document.getElementById('msgAdmin');
  const container = document.getElementById('listaSugestoes');

  if (!emailInput || !emailInput.value.trim()) {
    if (msgAdmin) msgAdmin.innerText = 'Digite o e-mail de administrador.';
    return;
  }

  try {
    const res = await fetch('/api/sugestoes');
    if (res.ok) {
      const sugestoes = await res.json();
      if (msgAdmin) msgAdmin.innerText = 'Lista atualizada!';
      if (container) {
        container.innerHTML = '';
        if (sugestoes.length === 0) {
          container.innerHTML = '<p style="color:#aaa; text-align:center; padding:10px;">Nenhuma sugestão encontrada.</p>';
          return;
        }
        sugestoes.forEach(s => {
          const card = document.createElement('div');
          card.style.cssText = 'background:#222; padding:12px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; color:#fff; border:1px solid #333;';
          card.innerHTML = `
            <div style="word-break: break-word; padding-right: 10px;">
              <strong style="color:#4CAF50;">${s.autor || s.nome || 'Anónimo'}:</strong>
              <p style="margin:5px 0 0 0; color:#ddd;">${s.texto || ''}</p>
            </div>
            <button onclick="apagarSugestao('${s._id}')" style="background:#ff4444; color:white; border:none; border-radius:6px; padding:8px 12px; cursor:pointer; font-weight:bold; shrink:0;">❌</button>
          `;
          container.appendChild(card);
        });
      }
    }
  } catch (err) {
    if (msgAdmin) msgAdmin.innerText = 'Erro ao carregar sugestões.';
    console.error(err);
  }
}

// Função para apagar 1 sugestão
async function apagarSugestao(id) {
  if (confirm('Tem certeza que quer apagar esta sugestão?')) {
    try {
      const res = await fetch(`/api/sugestoes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        carregarSugestoesAdmin();
      }
    } catch (err) {
      alert('Erro ao apagar sugestão.');
    }
  }
}

// Enviar Sugestão
async function enviarSugestao() {
  const autor = document.getElementById('autorSugestao').value;
  const texto = document.getElementById('textaSugestao').value;
  const msg = document.getElementById('msgSugestao');

  if (!texto.trim()) {
    if (msg) msg.innerText = 'Escreva uma sugestão antes de enviar.';
    return;
  }

  try {
    const res = await fetch('/api/sugestoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor, texto })
    });
    if (res.ok) {
      if (msg) msg.innerText = 'Sugestão enviada com sucesso!';
      document.getElementById('textaSugestao').value = '';
    }
  } catch (err) {
    if (msg) msg.innerText = 'Erro ao enviar sugestão.';
  }
}

