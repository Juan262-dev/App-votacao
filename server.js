const express = require('express');
const Datastore = require('nedb-promises'); // Usando a versão moderna com Promises
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Criar bancos de dados locais automatizados
const dbVotos = Datastore.create({ filename: 'votos.db', autoload: true });
const dbSugestoes = Datastore.create({ filename: 'sugestoes.db', autoload: true });

// E-mails autorizados a VOTAR
const EMAILS_AUTORIZADOS = [
  'admin@email.com',
  'membro1@email.com',
  'amor@email.com',
  'Evelly@email.com',
  'membro2@email.com',
  'juan@email.com'
];

// E-mails de ADMINISTRADORES (só estes vêem as sugestões)
const EMAILS_ADMIN = [
  'admin@email.com',
  'evelly@email.com',
  'juan@email.com'
];

// Opções de voto
const OPCOES = [
  { id: '1', nome: 'Eduarda' },
  { id: '2', nome: 'Evelly' },
  { id: '3', nome: 'Juan' }
];

app.get('/api/opcoes', (req, res) => {
  res.json(OPCOES);
});

// Registrar Voto
app.post('/api/votar', async (req, res) => {
  try {
    const { email, opcaoId } = req.body;

    if (!email || !opcaoId) {
      return res.status(400).json({ mensagem: 'Preencha o e-mail e escolha uma opção!' });
    }

    const emailFormatado = email.toLowerCase().trim();

    if (!EMAILS_AUTORIZADOS.includes(emailFormatado)) {
      return res.status(403).json({ mensagem: 'E-mail não autorizado a votar!' });
    }

    const jaVotou = await dbVotos.findOne({ email: emailFormatado });
    if (jaVotou) {
      return res.status(400).json({ mensagem: 'Este e-mail já realizou um voto!' });
    }

    await dbVotos.insert({ email: emailFormatado, opcaoId, data: new Date() });
    res.json({ mensagem: 'Voto registrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao salvar o voto.' });
  }
});

// Obter Placar Parcial
app.get('/api/resultados', async (req, res) => {
  try {
    const votos = await dbVotos.find({});
    const contagem = {};
    OPCOES.forEach(o => contagem[o.id] = 0);

    votos.forEach(v => {
      if (contagem[v.opcaoId] !== undefined) {
        contagem[v.opcaoId]++;
      }
    });

    const resultadoFinal = OPCOES.map(o => ({
      nome: o.nome,
      votos: contagem[o.id]
    }));

    res.json(resultadoFinal);
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao buscar resultados.' });
  }
});

// Enviar Sugestão
app.post('/api/sugestoes', async (req, res) => {
  try {
    const { autor, texto } = req.body;

    if (!texto || texto.trim() === '') {
      return res.status(400).json({ mensagem: 'Escreva alguma sugestão!' });
    }

    const novaSugestao = {
      autor: autor && autor.trim() !== '' ? autor.trim() : 'Anônimo',
      texto: texto.trim(),
      data: new Date()
    };

    await dbSugestoes.insert(novaSugestao);
    res.json({ mensagem: 'Sugestão enviada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao salvar sugestão.' });
  }
});

// Ver sugestões (RESTRITO A ADMINS)
app.post('/api/sugestoes/admin', async (req, res) => {
  try {
    const { emailAdmin } = req.body;

    if (!emailAdmin) {
      return res.status(400).json({ mensagem: 'Informe o e-mail de Admin!' });
    }

    const emailFormatado = emailAdmin.toLowerCase().trim();

    if (!EMAILS_ADMIN.includes(emailFormatado)) {
      return res.status(403).json({ mensagem: 'Acesso negado! Você não é um Administrador.' });
    }

    const sugestoes = await dbSugestoes.find({}).sort({ data: -1 });
    res.json({ sucesso: true, sugestoes });
  } catch (err) {
    res.status(500).json({ mensagem: 'Erro ao buscar sugestões.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando liso na porta ${PORT}`);
});

