# Sistema de Importação de Dados Médicos

Este script Python importa dados médicos de arquivos CSV, XML e Excel para um banco de dados MySQL em lotes.

## Requisitos

- Python 3.6+
- MySQL 5.7+ ou MariaDB 10.2+
- Arquivos de dados no formato correto

## Instalação

1. Clone ou baixe este projeto
2. Instale as dependências:
```bash
pip install pymysql pandas openpyxl lxml
```

## Configuração

1. **Configure o banco de dados**: Edite o arquivo `config.py` com suas configurações MySQL:
   - `DB_HOST`: Host do MySQL (padrão: localhost)
   - `DB_PORT`: Porta do MySQL (padrão: 3306)
   - `DB_USER`: Usuário do MySQL
   - `DB_PASSWORD`: Senha do MySQL
   - `DB_NAME`: Nome do banco de dados

2. **Estrutura das tabelas**: O script assume as seguintes estruturas de tabelas:

### Tabela Estados
```sql
CREATE TABLE estados (
    id SMALLINT UNSIGNED NOT NULL PRIMARY KEY,
    uf VARCHAR(2) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    region VARCHAR(32) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabela Hospitais
```sql
CREATE TABLE hospitais (
    codigo VARCHAR(255) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(50),
    bairro VARCHAR(100),
    especialidades TEXT,
    leitos_totais INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabela Médicos
```sql
CREATE TABLE medicos (
    codigo VARCHAR(255) NOT NULL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    especialidade VARCHAR(100),
    cidade VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabela Municípios
```sql
CREATE TABLE municipios (
    codigo_ibge INT NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    capital BOOLEAN,
    codigo_uf INT,
    siafi_id INT,
    ddd INT,
    fuso_horario VARCHAR(50),
    populacao INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Estrutura dos Arquivos

### estados.csv
```csv
codigo_uf,uf,nome,latitude,longitude,regiao
11,RO,Rondônia,-10.83,-63.34,Norte
```

### hospitais.csv
```csv
codigo,nome,cidade,bairro,especialidades,leitos_totais
uuid,Nome do Hospital,codigo_cidade,Bairro,Especialidade1;Especialidade2,100
```

### medicos.csv
```csv
codigo,nome_completo,especialidade,cidade
uuid,Nome Completo,Especialidade,codigo_cidade
```

### municipios.csv
```csv
codigo_ibge,nome,latitude,longitude,capital,codigo_uf,siafi_id,ddd,fuso_horario,populacao
1234567,Nome Cidade,-12.34,-56.78,0,11,1234,11,America/Sao_Paulo,50000
```

## Uso

1. **Prepare os arquivos**: Coloque os arquivos de dados no mesmo diretório do script:
   - `estados.csv`
   - `hospitais.csv`
   - `medicos.csv`
   - `municipios.csv`
   - `pacientes.xml`
   - `tabela CID-10.xlsx`

2. **Execute o script**:
```bash
python main.py
```

## Características

- **Importação em lotes**: Processa dados em lotes configuráveis para melhor performance
- **Tratamento de duplicatas**: Usa `ON DUPLICATE KEY UPDATE` para atualizar registros existentes
- **Log detalhado**: Registra todas as operações em arquivo e console
- **Tratamento de erros**: Rollback automático em caso de erro
- **Múltiplos formatos**: Suporta CSV, XML e Excel
- **Configurável**: Fácil personalização via arquivo de configuração

## Logs

O sistema gera logs em:
- Console (output direto)
- Arquivo `import_log.log`

## Troubleshooting

### Erro de conexão MySQL
- Verifique se o MySQL está rodando na porta 3306
- Confirme usuário e senha no arquivo `config.py`
- Teste conexão manual: `mysql -u username -p -h localhost`

### Erro de encoding
- Certifique-se que os arquivos CSV estão em UTF-8
- Para Windows: salve com "UTF-8 BOM" no Excel

### Performance
- Ajuste `BATCH_SIZE` no config.py conforme seu hardware
- Para arquivos grandes (>100k registros), considere batch_size = 1000

### Estrutura de tabelas
- Execute os scripts SQL fornecidos antes da importação
- Ajuste os nomes das tabelas no `config.py` se necessário

## Exemplo de Execução

```bash
$ python main.py
2025-09-20 10:30:15,123 - INFO - Conectado ao MySQL - localhost:3306
2025-09-20 10:30:15,124 - INFO - === INICIANDO IMPORTAÇÃO DE DADOS ===
2025-09-20 10:30:15,125 - INFO - Importando estados...
2025-09-20 10:30:15,150 - INFO - Lidos 27 registros do arquivo estados.csv
2025-09-20 10:30:15,155 - INFO - Inseridos 27 registros (Total: 27/27)
2025-09-20 10:30:15,156 - INFO - Importação de estados concluída: 27 registros processados
2025-09-20 10:30:15,157 - INFO - Estados importados: 27
...
2025-09-20 10:35:20,789 - INFO - === IMPORTAÇÃO CONCLUÍDA ===
2025-09-20 10:35:20,790 - INFO - Desconectado do MySQL
```