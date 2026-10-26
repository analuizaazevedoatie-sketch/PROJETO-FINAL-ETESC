/* Logica da pagina Minhas Avaliacoes */

function formatarData(dataIso) {
  const data = new Date(dataIso);
  return data.toLocaleDateString('pt-BR');
}

function estrelasSimples(nota) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= nota ? '&#9733;' : '&#9734;';
  }
  return html;
}

function itemAvaliacaoHTML(item) {
  return `
    <div class="item-avaliacao" onclick="window.location.href='detalhes.html?id=${item.obra_id}'">
      <div class="item-avaliacao-capa">
        <img src="${capaOuPlaceholder(item.imagem_url, item.tipo)}" alt="${item.titulo}" />
      </div>
      <div class="item-avaliacao-corpo">
        <span class="card-obra-tipo">${rotuloTipo(item.tipo)}</span>
        <h3 style="margin: 4px 0;">${item.titulo}</h3>
        <span class="estrelas">${estrelasSimples(item.nota)}</span>
        <p>${item.comentario ? item.comentario : '<em>Sem comentario.</em>'}</p>
        <span class="data-avaliacao">Avaliado em ${formatarData(item.criado_em)}</span>
      </div>
    </div>
  `;
}

async function carregarAvaliacoes() {
  const container = document.getElementById('conteudo-avaliacoes');
  try {
    const { avaliacoes } = await Api.minhasAvaliacoes();

    if (!avaliacoes || avaliacoes.length === 0) {
      container.innerHTML = `
        <div class="estado-vazio">
          <h3>Voce ainda nao avaliou nenhuma obra</h3>
          <p>Explore o catalogo e avalie o que ja assistiu, leu ou ouviu.</p>
          <a href="pesquisa.html" class="btn btn-primario">Explorar obras</a>
        </div>
      `;
      return;
    }

    container.innerHTML = avaliacoes.map(itemAvaliacaoHTML).join('');
  } catch (erro) {
    container.innerHTML = `<div class="estado-vazio"><p>${erro.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', carregarAvaliacoes);
