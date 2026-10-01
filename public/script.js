async function carregarDados() {
  try {
    // Carregar Sugestões
    const resSugestoes = await fetch('/api/sugestoes');
    if (resSugestoes.ok) {
      const sugestoes = await resSugestoes.json();
      const listaSugestoes = document.getElementById('lista-sugestoes');
      if (listaSugestoes) {
        listaSugestoes.innerHTML = '';
        sugestoes.forEach(s => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.alignItems = 'center';
          li.style.marginBottom = '8px';
          li.innerHTML = `
            <span>${s.texto || s.opcao || ''}</span>
            <button onclick="apagarSugestao('${s._id}')" style="background: red; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">❌</button>
          `;
          listaSugestoes.appendChild(li);
        });
      }
    }

    // Carregar Votos
    const resVotos = await fetch('/api/votos');
    if (resVotos.ok) {
      const votos = await resVotos.json();
      const listaVotos = document.getElementById('lista-votos');
      if (listaVotos) {
        listaVotos.innerHTML = '';
        votos.forEach(v => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.alignItems = 'center';
          li.style.marginBottom = '8px';
          li.innerHTML = `
            <span>${v.opcao || v.texto || ''}</span>
            <button onclick="apagarVoto('${v._id}')" style="background: red; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">❌</button>
          `;
          listaVotos.appendChild(li);
        });
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

async function apagarVoto(id) {
  if (confirm('Tem certeza que deseja apagar este voto?')) {
    await fetch(`/api/votos/${id}`, { method: 'DELETE' });
    carregarDados();
  }
}

async function apagarSugestao(id) {
  if (confirm('Tem certeza que deseja apagar esta sugestão?')) {
    await fetch(`/api/sugestoes/${id}`, { method: 'DELETE' });
    carregarDados();
  }
}

document.addEventListener('DOMContentLoaded', carregarDados);

