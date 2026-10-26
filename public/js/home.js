/* Logica da pagina Home */

const NOMES_SECAO = {
  filme: 'Filmes em destaque',
  serie: 'Series em destaque',
  livro: 'Livros em destaque',
  musica: 'Musicas em destaque',
};

function cardObraHTML(obra) {
  return `
    <div class="card-obra" onclick="window.location.href='detalhes.html?id=${obra.id}'">
      <div class="card-obra-capa">
        <img src="${capaOuPlaceholder(obra.imagem_url, obra.tipo)}" alt="${obra.titulo}" />
      </div>
      <div class="card-obra-corpo">
        <span class="card-obra-tipo">${rotuloTipo(obra.tipo)}</span>
        <span class="card-obra-titulo">${obra.titulo}</span>
        <span class="card-obra-meta">${obra.ano || ''}${obra.autor_diretor ? ' &middot; ' + obra.autor_diretor : ''}</span>
      </div>
    </div>
  `;
}

async function carregarHome() {
  const container = document.getElementById('conteudo-home');
  try {
    const { secoes } = await Api.destaques();
    const tiposComConteudo = Object.keys(secoes).filter((tipo) => secoes[tipo] && secoes[tipo].length > 0);

    if (tiposComConteudo.length === 0) {
      container.innerHTML = `
        <div class="estado-vazio">
          <h3>Ainda nao ha obras cadastradas</h3>
          <p>Assim que houver obras no banco, elas aparecerao aqui.</p>
          <a href="pesquisa.html" class="btn btn-primario">Ir para Pesquisa</a>
        </div>
      `;
      return;
    }

    container.innerHTML = tiposComConteudo
      .map(
        (tipo) => `
        <section class="secao">
          <div class="secao-cabecalho">
            <h2>${NOMES_SECAO[tipo]}</h2>
            <a href="pesquisa.html?tipo=${tipo}">Ver mais</a>
          </div>
          <div class="grid-cards">
            ${secoes[tipo].map(cardObraHTML).join('')}
          </div>
        </section>
      `
      )
      .join('');
  } catch (erro) {
    container.innerHTML = `<div class="estado-vazio"><p>Nao foi possivel carregar a home: ${erro.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarHome();

  const formBusca = document.getElementById('form-busca-home');
  formBusca.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const termo = document.getElementById('busca-home').value.trim();
    window.location.href = `pesquisa.html?q=${encodeURIComponent(termo)}`;
  });
});
