function requireAuth(req, res, next) {
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({ erro: 'Voce precisa estar logado para fazer isso.' });
  }
  next();
}

module.exports = { requireAuth };
