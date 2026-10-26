require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/auth.routes');
const obraRoutes = require('./routes/obra.routes');
const bibliotecaRoutes = require('./routes/biblioteca.routes');
const avaliacaoRoutes = require('./routes/avaliacao.routes');
const perfilRoutes = require('./routes/perfil.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'souldiary_segredo_padrao',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 horas
    },
  })
);

// API
app.use('/api/auth', authRoutes);
app.use('/api/obras', obraRoutes);
app.use('/api/biblioteca', bibliotecaRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/perfil', perfilRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ erro: 'Rota de API nao encontrada.' });
  }
  next();
});

// Frontend estatico
app.use(express.static(PUBLIC_DIR));

// Qualquer rota de pagina nao encontrada cai na 404.html
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

app.listen(PORT, () => {
  console.log(`SoulDiary rodando em http://localhost:${PORT}`);
});
