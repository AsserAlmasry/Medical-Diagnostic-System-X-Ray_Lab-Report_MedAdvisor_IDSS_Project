import pandas as pd
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

# Credentials
URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

def ingest_data():
    csv_path = "../medicines_data/medicines_data_updated.csv"
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Take a subset for stable ingestion
    df = df.head(5000)
    
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    
    with driver.session() as session:
        print("Clearing existing data...")
        session.run("MATCH (n) DETACH DELETE n")
        
        print("Creating constraints...")
        try:
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (d:Drug) REQUIRE d.name IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (c:Company) REQUIRE c.name IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (cat:Category) REQUIRE cat.name IS UNIQUE")
        except:
            pass

        print("Ingesting nodes and relationships...")
        for _, row in df.iterrows():
            # Create Drug, Company, Category and connect them
            query = """
            MERGE (d:Drug {name: $drug_name})
            SET d.price = $price, d.form = $form
            
            MERGE (c:Company {name: $company})
            SET c.region = $region
            
            MERGE (cat:Category {name: $category})
            
            MERGE (d)-[:MANUFACTURED_BY]->(c)
            MERGE (d)-[:BELONGS_TO]->(cat)
            """
            session.run(query, 
                        drug_name=row['Drugname'], 
                        price=row['Price'], 
                        form=row['Form'], 
                        company=row['Company'], 
                        region=row['Region'], 
                        category=row['Category'])
            
    driver.close()
    print("Ingestion complete.")

if __name__ == "__main__":
    ingest_data()
