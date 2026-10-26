/* Monta a navbar em todas as paginas e reage ao estado de login */

function paginaAtual() {
  const partes = window.location.pathname.split('/');
  return partes[partes.length - 1] || 'index.html';
}

function linkNavbar(href, texto) {
  const ativo = paginaAtual() === href ? ' ativo' : '';
  return `<a href="${href}" class="${ativo.trim()}">${texto}</a>`;
}

async function montarNavbar() {
  const container = document.getElementById('navbar');
  if (!container) return;

  let autenticado = false;
  try {
    const resposta = await Api.me();
    autenticado = resposta.autenticado;
  } catch (e) {
    autenticado = false;
  }

  const linksAutenticados = autenticado
    ? `
      ${linkNavbar('biblioteca.html', 'Biblioteca')}
      ${linkNavbar('avaliacoes.html', 'Avaliacoes')}
      ${linkNavbar('perfil.html', 'Perfil')}
      <button class="link-sair" id="btn-logout">Logout</button>
    `
    : `
      <a href="login.html">Entrar</a>
    `;

  container.innerHTML = `
    <div class="navbar">
      <div class="navbar-inner">
        <a href="index.html" class="navbar-logo">SoulDiary</a>
        <nav class="navbar-links">
          ${linkNavbar('index.html', 'Home')}
          ${linkNavbar('pesquisa.html', 'Pesquisar')}
          ${linksAutenticados}
        </nav>
      </div>
    </div>
  `;

  const botaoLogout = document.getElementById('btn-logout');
  if (botaoLogout) {
    botaoLogout.addEventListener('click', async () => {
      try {
        await Api.logout();
      } catch (e) {
        /* segue mesmo se der erro */
      }
      window.location.href = 'login.html';
    });
  }

  // Protege paginas que exigem login
  const paginasProtegidas = ['biblioteca.html', 'avaliacoes.html', 'perfil.html', 'avaliar.html'];
  if (paginasProtegidas.includes(paginaAtual()) && !autenticado) {
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', montarNavbar);
