import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

def show_graph_summary():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    with driver.session() as session:
        print("\n--- MedAI Insight Knowledge Graph Summary ---")
        
        # Count Nodes
        node_counts = session.run("""
            MATCH (n) 
            RETURN labels(n)[0] as label, count(*) as count
        """)
        print("\n[Nodes Found]")
        for record in node_counts:
            print(f"  * {record['label']}: {record['count']}")

        # Count Relationships
        rel_counts = session.run("""
            MATCH ()-[r]->() 
            RETURN type(r) as type, count(*) as count
        """)
        print("\n[Relationships Found]")
        for record in rel_counts:
            print(f"  > {record['type']}: {record['count']}")

        # Sample Connections
        samples = session.run("""
            MATCH (d:Drug)-[:MANUFACTURED_BY]->(c:Company)
            MATCH (d)-[:BELONGS_TO]->(cat:Category)
            RETURN d.name as drug, c.name as company, cat.name as category
            LIMIT 5
        """)
        print("\n[Knowledge Graph Samples (Rule-Based Connections)]")
        for record in samples:
            print(f"  {record['drug']} --(MANUFACTURED_BY)--> {record['company']}")
            print(f"  {record['drug']} --(BELONGS_TO)------> {record['category']}\n")

    driver.close()

if __name__ == "__main__":
    show_graph_summary()
