require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function rodar() {
  try {
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Criando tabelas...');
    await pool.query(schemaSql);
    console.log('Tabelas prontas.');

    const jaTemObras = await pool.query('SELECT COUNT(*) AS total FROM obra');
    if (Number(jaTemObras.rows[0].total) === 0) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('Inserindo dados de exemplo...');
      await pool.query(seedSql);
      console.log('Dados de exemplo inseridos.');
    } else {
      console.log('Ja existem obras no banco, dados de exemplo nao foram reinseridos.');
    }

    console.log('Banco de dados configurado com sucesso.');
    process.exit(0);
  } catch (erro) {
    console.error('Erro ao configurar o banco de dados:', erro.message);
    process.exit(1);
  }
}

rodar();
