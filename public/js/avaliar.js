/* Logica da pagina Avaliar Obra */

function obterIdObraAvaliar() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get('id');
}

function pintarEstrelas(nota) {
  document.querySelectorAll('.nota-estrela').forEach((estrela) => {
    const valor = Number(estrela.dataset.nota);
    estrela.classList.toggle('selecionada', valor <= nota);
  });
}

async function carregarResumoObra(obraId) {
  const container = document.getElementById('resumo-obra');
  try {
    const { obra, minhaAvaliacao } = await Api.detalhesObra(obraId);

    container.innerHTML = `
      <div class="avaliar-obra-resumo">
        <img src="${capaOuPlaceholder(obra.imagem_url, obra.tipo)}" alt="${obra.titulo}" />
        <div>
          <span class="card-obra-tipo">${rotuloTipo(obra.tipo)}</span>
          <h3 style="margin: 4px 0;">${obra.titulo}</h3>
          <span class="card-obra-meta">${obra.ano || ''}</span>
        </div>
      </div>
    `;

    if (minhaAvaliacao) {
      document.getElementById('nota').value = minhaAvaliacao.nota;
      document.getElementById('comentario').value = minhaAvaliacao.comentario || '';
      pintarEstrelas(minhaAvaliacao.nota);
    }
  } catch (erro) {
    container.innerHTML = `<div class="estado-vazio"><p>${erro.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const obraId = obterIdObraAvaliar();
  const mensagem = document.getElementById('mensagem');

  if (!obraId) {
    document.getElementById('resumo-obra').innerHTML = '<div class="estado-vazio"><p>Obra invalida.</p></div>';
    return;
  }

  carregarResumoObra(obraId);

  document.querySelectorAll('.nota-estrela').forEach((estrela) => {
    estrela.addEventListener('click', () => {
      const valor = Number(estrela.dataset.nota);
      document.getElementById('nota').value = valor;
      pintarEstrelas(valor);
    });
  });

  document.getElementById('form-avaliar').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarMensagem(mensagem);

    const nota = Number(document.getElementById('nota').value);
    const comentario = document.getElementById('comentario').value.trim();

    if (!nota || nota < 1 || nota > 5) {
      mostrarMensagem(mensagem, 'Selecione uma nota de 1 a 5 estrelas.', 'erro');
      return;
    }

    const botao = document.getElementById('btn-salvar-avaliacao');
    botao.disabled = true;
    botao.textContent = 'Salvando...';

    try {
      await Api.salvarAvaliacao(obraId, nota, comentario);
      mostrarMensagem(mensagem, 'Avaliacao salva com sucesso! Redirecionando...', 'sucesso');
      setTimeout(() => {
        window.location.href = `detalhes.html?id=${obraId}`;
      }, 700);
    } catch (erro) {
      mostrarMensagem(mensagem, erro.message, 'erro');
      botao.disabled = false;
      botao.textContent = 'Salvar avaliacao';
    }
  });
});
