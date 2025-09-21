#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para popular a tabela cid_specialty no banco de dados
Autor: Sistema de Importação
Data: Setembro 2025
"""

import pymysql
import pandas as pd
import logging
import sys
from datetime import datetime
import os
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, BATCH_SIZE

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('cid_specialty_log.log'),
        logging.StreamHandler()
    ]
)

class CidSpecialtyPopulator:
    def __init__(self, host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD, database=DB_NAME):
        """
        Inicializa o populador da tabela cid_specialty
        
        Args:
            host (str): Host do MySQL
            port (int): Porta do MySQL
            user (str): Usuário do MySQL
            password (str): Senha do MySQL
            database (str): Nome do banco de dados
        """
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
        
    def connect(self):
        """Estabelece conexão com o banco de dados"""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            logging.info(f"Conectado ao banco de dados: {self.database}")
            return True
        except Exception as e:
            logging.error(f"Erro ao conectar ao banco: {e}")
            return False
    
    def disconnect(self):
        """Fecha a conexão com o banco de dados"""
        if self.connection:
            self.connection.close()
            logging.info("Conexão fechada com sucesso")
    
    def create_cid_specialty_table(self):
        """Cria a tabela cid_specialty e specialties_unique se não existirem"""
        try:
            with self.connection.cursor() as cursor:
                # Criar tabela de especialidades únicas se não existir
                create_unique_specialties_sql = """
                CREATE TABLE IF NOT EXISTS specialties_unique (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_name (name)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """
                cursor.execute(create_unique_specialties_sql)
                logging.info("Tabela specialties_unique criada/verificada com sucesso")
                
                # Criar tabela cid_specialty
                create_table_sql = """
                CREATE TABLE IF NOT EXISTS cid_specialty (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    cid_id BIGINT UNSIGNED NOT NULL,
                    specialty_id BIGINT UNSIGNED NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_cid_specialty (cid_id, specialty_id),
                    INDEX idx_cid_id (cid_id),
                    INDEX idx_specialty_id (specialty_id),
                    FOREIGN KEY (cid_id) REFERENCES cids(id) ON DELETE CASCADE,
                    FOREIGN KEY (specialty_id) REFERENCES specialties_unique(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """
                cursor.execute(create_table_sql)
                self.connection.commit()
                logging.info("Tabela cid_specialty criada/verificada com sucesso")
                return True
        except Exception as e:
            logging.error(f"Erro ao criar tabelas: {e}")
            return False
    
    def get_existing_cids(self):
        """Obtém todos os CIDs existentes no banco de dados"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id, code FROM cids")
                cids = cursor.fetchall()
                # Criar dicionário code -> id
                cid_dict = {cid['code']: cid['id'] for cid in cids}
                logging.info(f"Encontrados {len(cid_dict)} códigos CID no banco")
                return cid_dict
        except Exception as e:
            logging.error(f"Erro ao buscar CIDs existentes: {e}")
            return {}
    
    def get_existing_specialties(self):
        """Obtém todas as especialidades existentes no banco de dados"""
        try:
            with self.connection.cursor() as cursor:
                # Como a tabela specialties tem hospital_id, vamos buscar especialidades únicas por nome
                cursor.execute("SELECT DISTINCT name FROM specialties")
                specialties = cursor.fetchall()
                # Criar conjunto de nomes únicos
                specialty_set = {spec['name'] for spec in specialties}
                logging.info(f"Encontradas {len(specialty_set)} especialidades únicas no banco")
                return specialty_set
        except Exception as e:
            logging.error(f"Erro ao buscar especialidades existentes: {e}")
            return set()
    
    def get_unique_specialties_dict(self):
        """Obtém todas as especialidades da tabela specialties_unique"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id, name FROM specialties_unique")
                specialties = cursor.fetchall()
                # Criar dicionário name -> id
                specialty_dict = {spec['name']: spec['id'] for spec in specialties}
                logging.info(f"Encontradas {len(specialty_dict)} especialidades únicas na tabela specialties_unique")
                return specialty_dict
        except Exception as e:
            logging.error(f"Erro ao buscar especialidades únicas: {e}")
            return {}
    def populate_unique_specialties(self, unique_specialties):
        """Popula a tabela specialties_unique com especialidades únicas do CSV"""
        try:
            with self.connection.cursor() as cursor:
                specialty_dict = {}
                
                for specialty in unique_specialties:
                    # Tentar inserir ou obter ID se já existir
                    insert_sql = """
                    INSERT INTO specialties_unique (name, created_at, updated_at) 
                    VALUES (%s, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE 
                    updated_at = NOW()
                    """
                    cursor.execute(insert_sql, (specialty,))
                    
                    # Obter o ID da especialidade
                    cursor.execute("SELECT id FROM specialties_unique WHERE name = %s", (specialty,))
                    result = cursor.fetchone()
                    if result:
                        specialty_dict[specialty] = result['id']
                
                self.connection.commit()
                logging.info(f"Populadas {len(specialty_dict)} especialidades na tabela specialties_unique")
                return specialty_dict
                
        except Exception as e:
            logging.error(f"Erro ao popular especialidades únicas: {e}")
            self.connection.rollback()
            return {}

    def create_missing_specialties(self, unique_specialties, existing_specialties):
        """Cria especialidades que não existem na tabela specialties_unique"""
        missing_specialties = set(unique_specialties) - set(existing_specialties.keys())
        
        if not missing_specialties:
            logging.info("Todas as especialidades já existem na tabela specialties_unique")
            return existing_specialties
        
        try:
            with self.connection.cursor() as cursor:
                for specialty in missing_specialties:
                    insert_sql = """
                    INSERT INTO specialties_unique (name, created_at, updated_at) 
                    VALUES (%s, NOW(), NOW())
                    """
                    cursor.execute(insert_sql, (specialty,))
                    specialty_id = cursor.lastrowid
                    existing_specialties[specialty] = specialty_id
                    logging.info(f"Especialidade criada: {specialty} (ID: {specialty_id})")
                
                self.connection.commit()
                logging.info(f"Criadas {len(missing_specialties)} novas especialidades na tabela specialties_unique")
                
        except Exception as e:
            logging.error(f"Erro ao criar especialidades: {e}")
            self.connection.rollback()
        
        return existing_specialties
    
    def load_relationships_from_csv(self):
        """Carrega os relacionamentos do arquivo CSV"""
        csv_file = 'relacionamento_hospitais_especialidades_cid.csv'
        
        if not os.path.exists(csv_file):
            logging.error(f"Arquivo {csv_file} não encontrado")
            return None
        
        try:
            # Ler apenas as colunas necessárias
            df = pd.read_csv(csv_file, usecols=['especialidade', 'cid_codigo'])
            logging.info(f"Carregados {len(df)} registros do arquivo CSV")
            return df
        except Exception as e:
            logging.error(f"Erro ao carregar arquivo CSV: {e}")
            return None
    
    def process_relationships(self, df, cid_dict, specialty_dict):
        """Processa os relacionamentos e retorna lista única de relacionamentos"""
        relationships = set()
        
        for _, row in df.iterrows():
            # Especialidades podem estar separadas por ';'
            specialties = [spec.strip() for spec in str(row['especialidade']).split(';')]
            # CIDs podem estar separados por ';'
            cids = [cid.strip() for cid in str(row['cid_codigo']).split(';')]
            
            # Criar relacionamento para cada combinação especialidade-CID
            for specialty in specialties:
                for cid in cids:
                    if specialty in specialty_dict and cid in cid_dict:
                        relationships.add((cid_dict[cid], specialty_dict[specialty]))
        
        logging.info(f"Processados {len(relationships)} relacionamentos únicos")
        return list(relationships)
    
    def insert_relationships(self, relationships):
        """Insere os relacionamentos na tabela cid_specialty"""
        if not relationships:
            logging.warning("Nenhum relacionamento para inserir")
            return False
        
        try:
            # Primeiro, limpar registros existentes se necessário
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as count FROM cid_specialty")
                existing_count = cursor.fetchone()['count']
                
                if existing_count > 0:
                    logging.info(f"Encontrados {existing_count} registros existentes na tabela cid_specialty")
                    # Opcionalmente, você pode escolher limpar a tabela ou fazer UPSERT
                    # cursor.execute("DELETE FROM cid_specialty")
                    # logging.info("Tabela cid_specialty limpa")
            
            # Inserir novos relacionamentos em lotes
            insert_sql = """
            INSERT IGNORE INTO cid_specialty (cid_id, specialty_id, created_at, updated_at) 
            VALUES (%s, %s, NOW(), NOW())
            """
            
            with self.connection.cursor() as cursor:
                batch_count = 0
                total_inserted = 0
                
                for i in range(0, len(relationships), BATCH_SIZE):
                    batch = relationships[i:i + BATCH_SIZE]
                    cursor.executemany(insert_sql, batch)
                    batch_inserted = cursor.rowcount
                    total_inserted += batch_inserted
                    batch_count += 1
                    
                    logging.info(f"Lote {batch_count}: {batch_inserted} relacionamentos inseridos")
                
                self.connection.commit()
                logging.info(f"Total de {total_inserted} relacionamentos inseridos com sucesso")
                return True
                
        except Exception as e:
            logging.error(f"Erro ao inserir relacionamentos: {e}")
            self.connection.rollback()
            return False
    
    def get_statistics(self):
        """Obtém estatísticas da tabela cid_specialty"""
        try:
            with self.connection.cursor() as cursor:
                # Total de relacionamentos
                cursor.execute("SELECT COUNT(*) as total FROM cid_specialty")
                total = cursor.fetchone()['total']
                
                # Relacionamentos por especialidade
                cursor.execute("""
                    SELECT s.name, COUNT(*) as count 
                    FROM cid_specialty cs 
                    JOIN specialties_unique s ON cs.specialty_id = s.id 
                    GROUP BY s.name 
                    ORDER BY count DESC 
                    LIMIT 10
                """)
                top_specialties = cursor.fetchall()
                
                logging.info(f"Estatísticas da tabela cid_specialty:")
                logging.info(f"- Total de relacionamentos: {total}")
                logging.info(f"- Top 10 especialidades com mais CIDs:")
                for spec in top_specialties:
                    logging.info(f"  * {spec['name']}: {spec['count']} CIDs")
                
                return True
        except Exception as e:
            logging.error(f"Erro ao obter estatísticas: {e}")
            return False
    
    def run(self):
        """Executa o processo completo de população da tabela"""
        logging.info("Iniciando processo de população da tabela cid_specialty")
        
        # Conectar ao banco
        if not self.connect():
            return False
        
        try:
            # Criar tabela se não existir
            if not self.create_cid_specialty_table():
                return False
            
            # Obter CIDs e especialidades existentes
            cid_dict = self.get_existing_cids()
            specialty_dict = self.get_unique_specialties_dict()
            
            if not cid_dict:
                logging.error("Nenhum CID encontrado no banco. Execute primeiro a importação de CIDs.")
                return False
            
            # Carregar relacionamentos do CSV
            df = self.load_relationships_from_csv()
            if df is None:
                return False
            
            # Obter especialidades únicas do CSV
            all_specialties = set()
            for _, row in df.iterrows():
                specialties = [spec.strip() for spec in str(row['especialidade']).split(';')]
                all_specialties.update(specialties)
            
            logging.info(f"Encontradas {len(all_specialties)} especialidades únicas no CSV")
            
            # Popular tabela specialties_unique com especialidades do CSV
            specialty_dict = self.populate_unique_specialties(all_specialties)
            
            # Processar relacionamentos
            relationships = self.process_relationships(df, cid_dict, specialty_dict)
            
            # Inserir relacionamentos
            if self.insert_relationships(relationships):
                # Mostrar estatísticas
                self.get_statistics()
                logging.info("Processo de população da tabela cid_specialty concluído com sucesso!")
                return True
            else:
                return False
                
        except Exception as e:
            logging.error(f"Erro durante o processo: {e}")
            return False
        finally:
            self.disconnect()

def main():
    """Função principal"""
    try:
        populator = CidSpecialtyPopulator()
        success = populator.run()
        
        if success:
            print("✅ Tabela cid_specialty populada com sucesso!")
            sys.exit(0)
        else:
            print("❌ Erro ao popular tabela cid_specialty. Verifique os logs.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️ Processo interrompido pelo usuário")
        sys.exit(1)
    except Exception as e:
        logging.error(f"Erro inesperado: {e}")
        print(f"❌ Erro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()