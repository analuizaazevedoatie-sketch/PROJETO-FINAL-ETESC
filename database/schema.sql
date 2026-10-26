-- ==========================================================
-- SoulDiary - Schema PostgreSQL
-- ==========================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_obra') THEN
    CREATE TYPE tipo_obra AS ENUM ('filme', 'serie', 'livro', 'musica');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS usuario (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  senha_hash    VARCHAR(255) NOT NULL,
  criado_em     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS obra (
  id             SERIAL PRIMARY KEY,
  titulo         VARCHAR(255) NOT NULL,
  tipo           tipo_obra NOT NULL,
  ano            INTEGER,
  autor_diretor  VARCHAR(255),
  descricao      TEXT,
  imagem_url     VARCHAR(500),
  criado_em      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS avaliacao (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  obra_id       INTEGER NOT NULL REFERENCES obra(id) ON DELETE CASCADE,
  nota          INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario    TEXT,
  criado_em     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, obra_id)
);

CREATE TABLE IF NOT EXISTS lista (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  nome          VARCHAR(100) NOT NULL DEFAULT 'Biblioteca',
  criado_em     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lista_obra (
  lista_id      INTEGER NOT NULL REFERENCES lista(id) ON DELETE CASCADE,
  obra_id       INTEGER NOT NULL REFERENCES obra(id) ON DELETE CASCADE,
  adicionado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (lista_id, obra_id)
);

CREATE INDEX IF NOT EXISTS idx_obra_titulo ON obra (LOWER(titulo));
CREATE INDEX IF NOT EXISTS idx_obra_tipo ON obra (tipo);
CREATE INDEX IF NOT EXISTS idx_avaliacao_obra ON avaliacao (obra_id);
CREATE INDEX IF NOT EXISTS idx_lista_usuario ON lista (usuario_id);
