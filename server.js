const express = require('express');
const Datastore = require('nedb-promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const votosDB = Datastore.create({ filename: path.join(__dirname, 'votos.db'), autoload: true });
const sugestoesDB = Datastore.create({ filename: path.join(__dirname, 'sugestoes.db'), autoload: true });

// Rotas de Votação
app.get('/api/votos', async (req, res) => {
  try {
    const votos = await votosDB.find({});
    res.json(votos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/votos', async (req, res) => {
  try {
    const { opcao } = req.body;
    if (!opcao) return res.status(400).json({ error: 'Opção inválida' });
    const novoVoto = await votosDB.insert({ opcao, data: new Date() });
    res.json(novoVoto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para apagar 1 voto
app.delete('/api/votos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await votosDB.remove({ _id: id }, {});
    res.json({ message: 'Voto removido com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas de Sugestões
app.get('/api/sugestoes', async (req, res) => {
  try {
    const sugestoes = await sugestoesDB.find({});
    res.json(sugestoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sugestoes', async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: 'Texto inválido' });
    const novaSugestao = await sugestoesDB.insert({ texto, data: new Date() });
    res.json(novaSugestao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para apagar 1 sugestão
app.delete('/api/sugestoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sugestoesDB.remove({ _id: id }, {});
    res.json({ message: 'Sugestão removida com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

