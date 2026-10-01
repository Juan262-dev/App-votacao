function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(`tab-${tabName}`).classList.add('active');
  event.target.classList.add('active');
}

// Carregar opções ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/opcoes')
    .then(res => res.json())
    .then(opcoes => {
      const cont = document.getElementById('opcoesContainer');
      if (cont) {
        cont.innerHTML = opcoes.map(o => `
          <div class="opcao-item">
            <input type="radio" name="opcao" value="${o.id}" id="o_${o.id}">
            <label for="o_${o.id}">${o.nome}</label>
          </div>
        `).join('');
      }
    });

  // Atualiza o placar e as sugestões sozinho a cada 3 segundos (3000ms)
  setInterval(() => {
    carregarResultados();
    carregarSugestoesAdmin(true); // Atualiza no fundo se já estiver logado
  }, 3000);
});

// Enviar Voto
document.getElementById('voteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('emailVoto').value.trim();
  const op = document.querySelector('input[name="opcao"]:checked');
  const msg = document.getElementById('msgVoto');

  if (!op) {
    msg.textContent = 'Escolha uma opção, abestado!';
    msg.className = 'mensagem erro';
    return;
  }

  try {
    const res = await fetch('/api/votar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, opcaoId: op.value })
    });
    
    const data = await res.json();
    msg.textContent = data.mensagem;
    msg.className = `mensagem ${res.ok ? 'sucesso' : 'erro'}`;

    if (res.ok) {
      document.getElementById('voteForm').reset();
      carregarResultados(); // Atualiza na hora que vota
    }
  } catch (err) {
    msg.textContent = 'Erro de conexão com o servidor!';
    msg.className = 'mensagem erro';
  }
});

// Buscar Resultados do Placar
async function carregarResultados() {
  try {
    const res = await fetch('/api/resultados');
    const dados = await res.json();
    const container = document.getElementById('resultadosContainer');
    if (container) {
      container.innerHTML = dados.map(r => `
        <div class="resultado-item">
          <span>${r.nome}</span><strong>${r.votos} voto(s)</strong>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Erro ao buscar placar:', err);
  }
}

// Enviar Sugestão
async function enviarSugestao() {
  const autor = document.getElementById('autorSugestao').value;
  const texto = document.getElementById('textaSugestao').value;
  const msg = document.getElementById('msgSugestao');

  try {
    const res = await fetch('/api/sugestoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor, texto })
    });
    const data = await res.json();
    msg.textContent = data.mensagem;
    msg.className = `mensagem ${res.ok ? 'sucesso' : 'erro'}`;

    if (res.ok) {
      document.getElementById('textaSugestao').value = '';
    }
  } catch (err) {
    msg.textContent = 'Erro ao enviar sugestão!';
    msg.className = 'mensagem erro';
  }
}

// Carregar Sugestões no Painel do Admin
async function carregarSugestoesAdmin(silencioso = false) {
  const emailAdmin = document.getElementById('emailAdmin').value;
  const msg = document.getElementById('msgAdmin');
  const lista = document.getElementById('listaSugestoes');

  if (!emailAdmin) return; // Se não digitou e-mail, não faz nada

  try {
    const res = await fetch('/api/sugestoes/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailAdmin })
    });

    const data = await res.json();

    if (!res.ok) {
      if (!silencioso) {
        msg.textContent = data.mensagem;
        msg.className = 'mensagem erro';
        lista.innerHTML = '';
      }
      return;
    }

    if (!silencioso) {
      msg.textContent = 'Acesso concedido!';
      msg.className = 'mensagem sucesso';
    }

    lista.innerHTML = data.sugestoes.map(s => `
      <div class="card-sugestao">
        <strong>${s.autor}:</strong>
        <p>${s.texto}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Erro ao buscar sugestões:', err);
  }
}

