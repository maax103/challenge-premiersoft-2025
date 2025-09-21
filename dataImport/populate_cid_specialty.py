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
    
    def get_existing_cids(self):
        """Obtém todos os CIDs existentes no banco de dados"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id, code FROM cids")
                cids = cursor.fetchall()
                cid_dict = {cid['code']: cid['id'] for cid in cids}
                logging.info(f"Encontrados {len(cid_dict)} códigos CID no banco")
                return cid_dict
        except Exception as e:
            logging.error(f"Erro ao buscar CIDs existentes: {e}")
            return {}
    
    def populate_unique_specialties(self, unique_specialties):
        """Popula a tabela specialties_unique com especialidades únicas do CSV"""
        try:
            with self.connection.cursor() as cursor:
                specialty_dict = {}
                
                for specialty in unique_specialties:
                    insert_sql = """
                    INSERT INTO specialties_unique (name, created_at, updated_at) 
                    VALUES (%s, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE 
                    updated_at = NOW()
                    """
                    cursor.execute(insert_sql, (specialty,))
                    
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
    
    def load_relationships_from_csv(self):
        """Carrega os relacionamentos do arquivo CSV"""
        csv_file = 'relacionamento_hospitais_especialidades_cid.csv'
        
        if not os.path.exists(csv_file):
            logging.error(f"Arquivo {csv_file} não encontrado")
            return None
        
        try:
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
            specialties = [spec.strip() for spec in str(row['especialidade']).split(';')]
            cids = [cid.strip() for cid in str(row['cid_codigo']).split(';')]
            
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
                cursor.execute("SELECT COUNT(*) as total FROM cid_specialty")
                total = cursor.fetchone()['total']
                
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
        
        if not self.connect():
            return False
        
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SHOW TABLES LIKE 'specialties_unique'")
                if not cursor.fetchone():
                    logging.error("Tabela 'specialties_unique' não encontrada. Execute as migrações Laravel primeiro.")
                    return False
                
                cursor.execute("SHOW TABLES LIKE 'cid_specialty'")
                if not cursor.fetchone():
                    logging.error("Tabela 'cid_specialty' não encontrada. Execute as migrações Laravel primeiro.")
                    return False
            
            cid_dict = self.get_existing_cids()
            
            if not cid_dict:
                logging.error("Nenhum CID encontrado no banco. Execute primeiro a importação de CIDs.")
                return False
            
            df = self.load_relationships_from_csv()
            if df is None:
                return False
            
            all_specialties = set()
            for _, row in df.iterrows():
                specialties = [spec.strip() for spec in str(row['especialidade']).split(';')]
                all_specialties.update(specialties)
            
            logging.info(f"Encontradas {len(all_specialties)} especialidades únicas no CSV")
            
            specialty_dict = self.populate_unique_specialties(all_specialties)
            relationships = self.process_relationships(df, cid_dict, specialty_dict)
            
            if self.insert_relationships(relationships):
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
