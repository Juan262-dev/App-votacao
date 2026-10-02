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
      if (msgAdmin) msgAdmin.innerText = 'Acesso concedido!';
      if (container) {
        container.innerHTML = '';
        
        // Botão para Zerar Votação (Exclusivo Admin)
        const btnZerarVotos = document.createElement('button');
        btnZerarVotos.innerText = '⚠️ Zerar Todos os Votos da Votação';
        btnZerarVotos.style.cssText = 'background:#d9534f; color:white; border:none; border-radius:6px; padding:10px; width:100%; margin-bottom:15px; cursor:pointer; font-weight:bold;';
        btnZerarVotos.onclick = zerarVotacaoAdmin;
        container.appendChild(btnZerarVotos);

        if (sugestoes.length === 0) {
          const emptyMsg = document.createElement('p');
          emptyMsg.style.cssText = 'color:#aaa; text-align:center; padding:10px;';
          emptyMsg.innerText = 'Nenhuma sugestão encontrada.';
          container.appendChild(emptyMsg);
          return;
        }

        sugestoes.forEach(s => {
          const card = document.createElement('div');
          card.style.cssText = 'background:#222; padding:12px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; color:#fff; border:1px solid #333;';
          
          const textoDiv = document.createElement('div');
          textoDiv.style.cssText = 'word-break: break-word; padding-right: 10px;';
          textoDiv.innerHTML = `<strong style="color:#4CAF50;">${s.autor || s.nome || 'Anónimo'}:</strong><p style="margin:4px 0 0 0; color:#ddd;">${s.texto || ''}</p>`;
          
          const btnApagar = document.createElement('button');
          btnApagar.innerText = '❌ Apagar';
          btnApagar.style.cssText = 'background:#ff4444; color:white; border:none; border-radius:6px; padding:8px 12px; cursor:pointer; font-weight:bold; flex-shrink:0;';
          btnApagar.onclick = function() { apagarSugestao(s._id); };

          card.appendChild(textoDiv);
          card.appendChild(btnApagar);
          container.appendChild(card);
        });
      }
    }
  } catch (err) {
    if (msgAdmin) msgAdmin.innerText = 'Erro ao carregar dados do admin.';
    console.error(err);
  }
}

// Apagar 1 sugestão específica
async function apagarSugestao(id) {
  if (confirm('Tem certeza que deseja apagar esta sugestão?')) {
    try {
      const res = await fetch(`/api/sugestoes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        carregarSugestoesAdmin();
      } else {
        alert('Erro ao apagar a sugestão.');
      }
    } catch (err) {
      alert('Erro de conexão ao apagar sugestão.');
    }
  }
}

// Zerar todos os votos (Admin)
async function zerarVotacaoAdmin() {
  if (confirm('ATENÇÃO: Tem certeza que deseja ZERAR todos os votos da votação? Esta ação não pode ser desfeita!')) {
    try {
      const res = await fetch('/api/votos/zerar', { method: 'DELETE' });
      if (res.ok) {
        alert('Votação zerada com sucesso!');
        if (typeof carregarResultados === 'function') carregarResultados();
      } else {
        alert('Erro ao zerar votação.');
      }
    } catch (err) {
      alert('Erro de conexão ao zerar votação.');
    }
  }
}

// Enviar Sugestão (Usuários comuns)
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

