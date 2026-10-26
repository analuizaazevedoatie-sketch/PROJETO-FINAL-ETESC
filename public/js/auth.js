/* Logica das paginas de login e cadastro */

document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  const mensagem = document.getElementById('mensagem');

  if (formLogin) {
    formLogin.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      ocultarMensagem(mensagem);

      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value;

      if (!email || !senha) {
        mostrarMensagem(mensagem, 'Preencha email e senha.', 'erro');
        return;
      }

      const botao = document.getElementById('btn-entrar');
      botao.disabled = true;
      botao.textContent = 'Entrando...';

      try {
        await Api.login({ email, senha });
        mostrarMensagem(mensagem, 'Login realizado com sucesso! Redirecionando...', 'sucesso');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
        botao.disabled = false;
        botao.textContent = 'Entrar';
      }
    });
  }

  if (formCadastro) {
    formCadastro.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      ocultarMensagem(mensagem);

      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value;
      const confirmarSenha = document.getElementById('confirmarSenha').value;

      if (!nome || !email || !senha || !confirmarSenha) {
        mostrarMensagem(mensagem, 'Preencha todos os campos.', 'erro');
        return;
      }
      if (senha !== confirmarSenha) {
        mostrarMensagem(mensagem, 'As senhas nao coincidem.', 'erro');
        return;
      }
      if (senha.length < 6) {
        mostrarMensagem(mensagem, 'A senha deve ter pelo menos 6 caracteres.', 'erro');
        return;
      }

      const botao = document.getElementById('btn-cadastrar');
      botao.disabled = true;
      botao.textContent = 'Criando conta...';

      try {
        await Api.cadastro({ nome, email, senha, confirmarSenha });
        mostrarMensagem(mensagem, 'Conta criada com sucesso! Redirecionando...', 'sucesso');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
        botao.disabled = false;
        botao.textContent = 'Criar conta';
      }
    });
  }
});
