#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para importação de dados médicos em lotes para banco MySQL
Autor: Sistema de Importação
Data: Setembro 2025
"""

import pymysql
import pandas as pd
import xml.etree.ElementTree as ET
from openpyxl import load_workbook
import logging
import sys
from datetime import datetime
import os
import gc  
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('import_log.log'),
        logging.StreamHandler()
    ]
)

class DatabaseImporter:
    def __init__(self, host='localhost', port=3306, user='root', password='', database=''):
        """
        Inicializa o importador de banco de dados
        
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
        
    def log_memory_cleanup(self, step_name):
        """Log de limpeza de memória"""
        objects_collected = gc.collect()
        if objects_collected > 0:
            logging.info(f"{step_name}: {objects_collected} objetos coletados pelo GC")
        
    def connect(self):
        """Conecta ao banco de dados MySQL"""
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
            return True
        except Exception as e:
            sys.exit(1)
    
    def disconnect(self):
        """Desconecta do banco de dados"""
        if self.connection:
            self.connection.close()
    
    def execute_query(self, query, params=None):
        """
        Executa uma query no banco de dados
        
        Args:
            query (str): Query SQL
            params (tuple): Parâmetros da query
            
        Returns:
            bool: True se executado com sucesso
        """
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                return True
        except Exception as e:
            self.connection.rollback()
            sys.exit(1)
    
    def execute_batch(self, query, data_list, batch_size=100):
        """
        Executa inserções em lotes
        
        Args:
            query (str): Query SQL de inserção
            data_list (list): Lista de dados para inserir
            batch_size (int): Tamanho do lote
            
        Returns:
            int: Número de registros inseridos
        """
        inserted_count = 0
        
        try:
            with self.connection.cursor() as cursor:
                for i in range(0, len(data_list), batch_size):
                    batch = data_list[i:i + batch_size]
                    cursor.executemany(query, batch)
                    self.connection.commit()
                    inserted_count += len(batch)
                    
                    # Libera a referência do batch para economia de memória
                    del batch
        except Exception as e:
            logging.error(f"Erro no execute_batch: {e}")
            if self.connection:
                self.connection.rollback()
            sys.exit(1)
            
        return inserted_count
    
    def import_estados_csv(self, csv_file_path, batch_size=50):
        """
        Importa dados do arquivo estados.csv
        
        Estrutura CSV: codigo_uf,uf,nome,latitude,longitude,regiao
        Estrutura BD: id,uf,name,latitude,longitude,region,created_at,updated_at
        
        Args:
            csv_file_path (str): Caminho para o arquivo CSV
            batch_size (int): Tamanho do lote para inserção
            
        Returns:
            int: Número de registros importados
        """
        try:
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            
            data_list = []
            current_time = datetime.now()
            
            for _, row in df.iterrows():
                data_tuple = (
                    int(row['codigo_uf']),  
                    row['uf'],              
                    row['nome'],            
                    float(row['latitude']),  
                    float(row['longitude']), 
                    row['regiao'],          
                    current_time,           
                    current_time            
                )
                data_list.append(data_tuple)
            
            # Query de inserção com ON DUPLICATE KEY UPDATE
            insert_query = """
                INSERT INTO states (id, uf, name, latitude, longitude, region, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    uf = VALUES(uf),
                    name = VALUES(name),
                    latitude = VALUES(latitude),
                    longitude = VALUES(longitude),
                    region = VALUES(region),
                    updated_at = VALUES(updated_at)
            """
            
            # Executa a inserção em lotes
            inserted_count = self.execute_batch(insert_query, data_list, batch_size)
            
            return inserted_count
            
        except Exception as e:
            sys.exit(1)
    
    def import_hospitais_csv(self, csv_file_path, batch_size=100):
        """
        Importa dados do arquivo hospitais.csv
        
        Args:
            csv_file_path (str): Caminho para o arquivo CSV
            batch_size (int): Tamanho do lote para inserção
            
        Returns:
            int: Número de registros importados
        """
        try:
            # Lê o arquivo CSV
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            
            # Cria mapeamento de código IBGE para ID da cidade
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id, city_code FROM cities")
                city_mapping = {row['city_code']: row['id'] for row in cursor.fetchall()}
            
            
            # Mapeia os dados (estrutura pode variar - ajustar conforme necessário)
            data_list = []
            current_time = datetime.now()
            skipped_count = 0
            
            for _, row in df.iterrows():
                cidade_ibge = int(row['cidade'])
                city_id = city_mapping.get(cidade_ibge)
                
                if city_id is None:
                    skipped_count += 1
                    continue
                
                data_tuple = (
                    row['codigo'],           
                    row['nome'],            
                    city_id,                # Usa o ID da cidade, não o código IBGE
                    row['bairro'],          
                    int(row['leitos_totais']), 
                    current_time,           
                    current_time            
                )
                data_list.append(data_tuple)
            
            
            # Query de inserção (ajustar nome da tabela e campos conforme necessário)
            
            insert_query = """
                INSERT INTO hospitals (hospital_code, name, city, neighborhood, total_beds, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    city = VALUES(city),
                    neighborhood = VALUES(neighborhood),
                    total_beds = VALUES(total_beds),
                    updated_at = VALUES(updated_at)
            """
            
            inserted_count = self.execute_batch(insert_query, data_list, batch_size)
            
            return inserted_count
            
        except Exception as e:
            sys.exit(1)
    
    def import_hospital_specialties(self, csv_file_path, batch_size=100):
        """
        Importa especialidades dos hospitais para a tabela specialties
        
        Args:
            csv_file_path (str): Caminho para o arquivo CSV dos hospitais
            batch_size (int): Tamanho do lote para inserção
            
        Returns:
            int: Número de especialidades importadas
        """
        try:
            # Lê o arquivo CSV dos hospitais
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            
            # Cria mapeamento de código do hospital para ID do hospital
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id, hospital_code FROM hospitals")
                hospital_mapping = {row['hospital_code']: row['id'] for row in cursor.fetchall()}
            
            
            specialties_data = []
            current_time = datetime.now()
            skipped_hospitals = 0
            
            for _, row in df.iterrows():
                hospital_code = row['codigo']
                hospital_id = hospital_mapping.get(hospital_code)
                
                if hospital_id is None:
                    skipped_hospitals += 1
                    continue
                
                # Processa as especialidades (separadas por ;)
                especialidades_str = str(row['especialidades']).strip()
                if especialidades_str and especialidades_str != 'nan':
                    especialidades_list = [esp.strip() for esp in especialidades_str.split(';') if esp.strip()]
                    
                    for especialidade in especialidades_list:
                        specialty_tuple = (
                            hospital_id,
                            especialidade,
                            current_time,
                            current_time
                        )
                        specialties_data.append(specialty_tuple)
            
            
            if not specialties_data:
                return 0
            
            # Query de inserção para especialidades
            insert_query = """
                INSERT INTO specialties (hospital_id, name, created_at, updated_at)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    updated_at = VALUES(updated_at)
            """
            
            inserted_count = self.execute_batch(insert_query, specialties_data, batch_size)
            
            return inserted_count
            
        except Exception as e:
            sys.exit(1)
    
    def import_xml_data(self, xml_file_path, batch_size=500):
        """
        Importa dados de arquivo XML (pacientes.xml) em modo iterativo para arquivos grandes.
        Versão otimizada com gestão avançada de memória.
        """
        import gc
        
        # Variáveis de controle de recursos
        context = None
        root = None
        city_mapping = None
        cid_mapping = None
        data_list = []
        
        try:
            # Carrega mapeamentos antes do processamento
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id, city_code FROM cities")
                city_mapping = {row['city_code']: row['id'] for row in cursor.fetchall()}
            
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id, code FROM cids")
                cid_mapping = {row['code']: row['id'] for row in cursor.fetchall()}
            
            # Parsing XML iterativo com gestão de memória
            context = ET.iterparse(xml_file_path, events=('start', 'end'))
            context = iter(context)
            event, root = next(context)  # Pega o elemento root
            
            current_time = datetime.now()
            inserted_count = 0
            skipped_count = 0
            
            # Query preparada uma única vez
            insert_query = """
                INSERT INTO patients
                (codigo, cpf, full_name, gender, city, neighborhood, has_insurance, cid_id, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    cpf=VALUES(cpf),
                    full_name=VALUES(full_name),
                    gender=VALUES(gender),
                    city=VALUES(city),
                    neighborhood=VALUES(neighborhood),
                    has_insurance=VALUES(has_insurance),
                    cid_id=VALUES(cid_id),
                    updated_at=VALUES(updated_at)
            """

            for event, elem in context:
                if event == 'end' and elem.tag == 'Paciente':
                    # Extrai os campos do XML de forma otimizada
                    codigo = elem.findtext('Codigo', '').strip()
                    cpf = elem.findtext('CPF', '').strip()
                    nome = elem.findtext('Nome_Completo', '').strip()
                    genero = elem.findtext('Genero', '').strip()
                    cod_municipio = elem.findtext('Cod_municipio', '').strip()
                    bairro = elem.findtext('Bairro', '').strip()
                    convenio = elem.findtext('Convenio', '').strip()
                    cid10_code = elem.findtext('CID-10', '').strip()

                    # Validações básicas
                    if not codigo or not cpf or not nome:
                        skipped_count += 1
                        elem.clear()
                        # Limpa root periodicamente para evitar acúmulo
                        if skipped_count % 1000 == 0:
                            root.clear()
                        continue

                    # Converte convênio
                    has_insurance = 1 if convenio.upper() == 'SIM' else 0
                    
                    # Busca ID da cidade
                    city_id = None
                    if cod_municipio.isdigit():
                        city_code = int(cod_municipio)
                        city_id = city_mapping.get(city_code)
                    
                    # Busca ID do CID-10
                    cid_id = None
                    if cid10_code:
                        cid_id = cid_mapping.get(cid10_code)

                    data_tuple = (
                        codigo, cpf, nome, genero, city_id, bairro,
                        has_insurance, cid_id, current_time, current_time
                    )
                    data_list.append(data_tuple)
                    
                    # Limpeza imediata do elemento XML
                    elem.clear()
                    
                    # Limpeza agressiva do root a cada 100 elementos processados
                    if len(data_list) % 100 == 0:
                        root.clear()
                        # Força garbage collection a cada 1000 elementos
                        if len(data_list) % 1000 == 0:
                            gc.collect()
                    
                    # Processa em lotes
                    if len(data_list) >= batch_size:
                        try:
                            batch_inserted = self.execute_batch(insert_query, data_list, batch_size)
                            inserted_count += batch_inserted
                            
                            print(f"Registros importados: {inserted_count}")
                            
                            # Limpeza agressiva da lista
                            data_list.clear()
                            del data_list[:]  # Força limpeza da lista
                            data_list = []    # Recria lista vazia
                            
                            # Força garbage collection após cada batch
                            gc.collect()
                            self.log_memory_cleanup(f"Batch {inserted_count//batch_size}")
                            
                            # Limpeza periódica do root XML
                            root.clear()
                            
                        except Exception as batch_error:
                            print(f"Erro no batch: {batch_error}")
                            # Limpa dados e continua
                            data_list.clear()
                            data_list = []
                            gc.collect()

            # Processa dados restantes
            if data_list:
                try:
                    batch_inserted = self.execute_batch(insert_query, data_list, len(data_list))
                    inserted_count += batch_inserted
                    print(f"Batch final: {batch_inserted} registros")
                except Exception as final_error:
                    print(f"Erro no batch final: {final_error}")
                finally:
                    # Limpeza dos dados finais
                    data_list.clear()
                    del data_list
                    data_list = []
            
            print(f"Importação concluída: {inserted_count} inseridos, {skipped_count} ignorados")
            return inserted_count
            
        except ET.ParseError as e:
            print(f"Erro de parsing XML: {e}")
            raise
        except Exception as e:
            print(f"Erro durante importação: {e}")
            raise
        finally:
            # Limpeza garantida de todos os recursos
            try:
                # Limpa lista de dados
                if 'data_list' in locals() and data_list:
                    data_list.clear()
                    del data_list
                
                # Limpa mapeamentos da memória
                if city_mapping is not None:
                    city_mapping.clear()
                    del city_mapping
                    
                if cid_mapping is not None:
                    cid_mapping.clear()
                    del cid_mapping
                
                # Limpa XML da memória
                if root is not None:
                    root.clear()
                    for elem in root.iter():
                        elem.clear()
                    del root
                
                if context is not None:
                    del context
                
                # Força garbage collection agressivo final
                for _ in range(3):
                    gc.collect()
                    
                self.log_memory_cleanup("Finalização import_xml_data")
                
            except Exception as cleanup_error:
                print(f"Aviso - erro na limpeza final: {cleanup_error}")
                # Força GC mesmo com erro na limpeza
                try:
                    gc.collect()
                except:
                    pass
                
    def import_medicos_csv(self, csv_file_path, batch_size=100):
        try:
            # Lê o arquivo CSV
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            
            data_list = []
            current_time = datetime.now()
            
            for _, row in df.iterrows():
                data_tuple = (
                    row['codigo'],           
                    row['nome_completo'],    
                    row['especialidade'],    
                    row['cidade'],          
                    current_time,           
                    current_time            
                )
                data_list.append(data_tuple)
            
            # Query de inserção
            insert_query = """
                INSERT INTO doctors (doctor_code, full_name, specialty, city, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    full_name = VALUES(full_name),
                    specialty = VALUES(specialty),
                    city = VALUES(city),
                    updated_at = VALUES(updated_at)
            """
            
            inserted_count = self.execute_batch(insert_query, data_list, batch_size)
            
            return inserted_count
            
        except Exception as e:
            sys.exit(1)
    
    def import_municipios_csv(self, csv_file_path, batch_size=100):
        try:
            # Lê o arquivo CSV
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            
            data_list = []
            current_time = datetime.now()
            
            for _, row in df.iterrows():
                data_tuple = (
                    int(row['codigo_ibge']),     
                    row['nome'],                 
                    float(row['latitude']),      
                    float(row['longitude']),     
                    bool(row['capital']),        
                    int(row['codigo_uf']),       
                    int(row['siafi_id']),        
                    int(row['ddd']),             
                    row['fuso_horario'],         
                    int(row['populacao']),       
                    current_time,                
                    current_time                 
                )
                data_list.append(data_tuple)
            
            # Query de inserção
            insert_query = """
                INSERT INTO cities ( city_code, name, latitude, longitude, is_capital, state_id, siafi_id, area_code, time_zone, population , created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    latitude = VALUES(latitude),
                    longitude = VALUES(longitude),
                    is_capital = VALUES(is_capital),
                    state_id = VALUES(state_id),
                    siafi_id = VALUES(siafi_id),
                    area_code = VALUES(area_code),
                    time_zone = VALUES(time_zone),
                    population = VALUES(population),
                    updated_at = VALUES(updated_at)
            """
            
            inserted_count = self.execute_batch(insert_query, data_list, batch_size)
            
            return inserted_count
            
        except Exception as e:
            sys.exit(1)

    def import_excel_data(self, excel_file_path, sheet_name=None, batch_size=3000):
        try:
            # Lê arquivo Excel
            df = pd.read_excel(excel_file_path, sheet_name=sheet_name)
            
            # Se sheet_name é None, df pode ser um dict; seleciona a primeira planilha
            if isinstance(df, dict):
                sheet_name = list(df.keys())[0]
                df = df[sheet_name]
            
            
            data_list = []
            current_time = datetime.now()
            
            for _, row in df.iterrows():
                # Verifica se a linha tem pelo menos 1 coluna
                if len(row) < 1:
                    continue

                # Pega o conteúdo da primeira coluna
                cell_value = str(row.iloc[0]).strip()

                # Pula linhas vazias ou que começam com "Capítulo" ou "Total"
                if not cell_value or cell_value.startswith('Capítulo') or cell_value.startswith('Total'):
                    continue

                # Verifica se a linha contém um código CID válido (formato: "A00 - Descrição")
                if ' - ' in cell_value:
                    parts = cell_value.split(' - ', 1)  # Divide apenas na primeira ocorrência
                    if len(parts) == 2:
                        cid_code = parts[0].strip()
                        cid_name = parts[1].strip()

                        # Valida se o código tem formato válido (letras + números)
                        if cid_code and cid_name:
                            data_tuple = (
                                cid_code,
                                cid_name,
                                current_time,
                                current_time
                            )
                            data_list.append(data_tuple)
                   
            
            if not data_list:
                sys.exit(1)
            
            # Query de inserção corrigida
            insert_query = """
                INSERT INTO cids (code, name, created_at, updated_at)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    updated_at = VALUES(updated_at)
            """
            
            inserted_count = self.execute_batch(insert_query, data_list, batch_size)
            
            return inserted_count
            
        except FileNotFoundError:
            sys.exit(1)
        except pd.errors.EmptyDataError:
            sys.exit(1)
        except Exception as e:
            sys.exit(1)


def main():
    """Função principal"""
    
    DB_CONFIG = {
        'host': DB_HOST,
        'port': DB_PORT,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'database': DB_NAME
    }
    
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    FILES = {
        'estados': os.path.join(CURRENT_DIR, 'estados.csv'),
        'hospitais': os.path.join(CURRENT_DIR, 'hospitais.csv'),
        'medicos': os.path.join(CURRENT_DIR, 'medicos.csv'),
        'municipios': os.path.join(CURRENT_DIR, 'municipios.csv'),
        'pacientes': os.path.join(CURRENT_DIR, 'pacientes.xml'),
        'cid10': os.path.join(CURRENT_DIR, 'tabela CID-10.xlsx')
    }
    
    importer = DatabaseImporter(**DB_CONFIG)
    
    try:
        # Conecta ao banco
        if not importer.connect():
            sys.exit(1)
        count = 0
        # Importa estados
        if os.path.exists(FILES['estados']):
            #count = importer.import_estados_csv(FILES['estados'])
            logging.info(f"Estados importados: {count}")
        
        # Importa municípios (antes dos hospitais devido à foreign key)
        if os.path.exists(FILES['municipios']):
            #count = importer.import_municipios_csv(FILES['municipios'])
            logging.info(f"Municípios importados: {count}")
        
        if os.path.exists(FILES['hospitais']):
            #count = importer.import_hospitais_csv(FILES['hospitais'])
            logging.info(f"Hospitais importados: {count}")

        if os.path.exists(FILES['medicos']):
            #count = importer.import_medicos_csv(FILES['medicos'])
            logging.info(f"Médicos importados: {count}")
        
        if os.path.exists(FILES['hospitais']):
            #count = importer.import_hospital_specialties(FILES['hospitais'])
            logging.info(f"Especialidades importadas: {count}")
        
        # Importa Excel (CID-10)
        if os.path.exists(FILES['cid10']):
            #count = importer.import_excel_data(FILES['cid10'])
            logging.info(f"Registros Excel importados: {count}")
            
        if os.path.exists(FILES['pacientes']):
            logging.info("Importando dados XML...")
            count = importer.import_xml_data(FILES['pacientes'])
            logging.info(f"Registros XML importados: {count}")
        else:
            logging.warning(f"Arquivo não encontrado: {FILES['pacientes']}")
        
        logging.info("=== IMPORTAÇÃO CONCLUÍDA ===")
        
    except Exception as e:
        logging.error(f"Erro durante a importação: {e}")
        sys.exit(1)
    
    finally:
        # Desconecta do banco
        importer.disconnect()


if __name__ == "__main__":
    main()
