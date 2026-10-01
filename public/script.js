async function carregarDados() {
  // Carregar Votos
  const resVotos = await fetch('/api/votos');
  const votos = await resVotos.json();
  
  const listaVotos = document.getElementById('lista-votos');
  if (listaVotos) {
    listaVotos.innerHTML = '';
    votos.forEach(voto => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${voto.opcao}</span>
        <button onclick="apagarVoto('${voto._id}')" style="background:#red; color:white; border:none; border-radius:4px; padding:2px 6px; cursor:pointer; margin-left:10px;">❌</button>
      `;
      listaVotos.appendChild(li);
    });
  }

  // Carregar Sugestões
  const resSugestoes = await fetch('/api/sugestoes');
  const sugestoes = await resSugestoes.json();
  
  const listaSugestoes = document.getElementById('lista-sugestoes');
  if (listaSugestoes) {
    listaSugestoes.innerHTML = '';
    sugestoes.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${s.texto}</span>
        <button onclick="apagarSugestao('${s._id}')" style="background:red; color:white; border:none; border-radius:4px; padding:2px 6px; cursor:pointer; margin-left:10px;">❌</button>
      `;
      listaSugestoes.appendChild(li);
    });
  }
}

async function apagarVoto(id) {
  if (confirm('Tem certeza que quer apagar este voto?')) {
    await fetch(`/api/votos/${id}`, { method: 'DELETE' });
    carregarDados();
  }
}

async function apagarSugestao(id) {
  if (confirm('Tem certeza que quer apagar esta sugestão?')) {
    await fetch(`/api/sugestoes/${id}`, { method: 'DELETE' });
    carregarDados();
  }
}

// Chamar ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDados);

