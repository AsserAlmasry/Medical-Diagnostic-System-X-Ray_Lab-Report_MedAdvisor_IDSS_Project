import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

class SymbolicClinicalReasoningEngine:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI")
        self.user = os.getenv("NEO4J_USERNAME")
        self.password = os.getenv("NEO4J_PASSWORD")
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))

    def get_advice(self, drug_name, conditions, is_pharmacist):
        with self.driver.session() as session:
            # Rule 1: Find Exact Drug
            exact_query = """
            MATCH (d:Drug {name: $name})-[:BELONGS_TO]->(cat:Category)
            MATCH (d)-[:MANUFACTURED_BY]->(comp:Company)
            RETURN d, cat, comp
            """
            result = session.run(exact_query, name=drug_name.upper())
            record = result.single()

            symbolic_data = {
                "exact_match": None,
                "substitutes": []
            }

            if record:
                symbolic_data["exact_match"] = {
                    "name": record["d"]["name"],
                    "price": record["d"]["price"],
                    "form": record["d"]["form"],
                    "category": record["cat"]["name"],
                    "company": record["comp"]["name"]
                }
                
                # Rule 2: Find Substitutes in same category
                sub_query = """
                MATCH (cat:Category {name: $cat_name})<-[:BELONGS_TO]-(sub:Drug)
                WHERE sub.name <> $name
                MATCH (sub)-[:MANUFACTURED_BY]->(comp:Company)
                WHERE comp.region = 'Middle East'
                RETURN sub, comp
                LIMIT 5
                """
                sub_results = session.run(sub_query, cat_name=record["cat"]["name"], name=record["d"]["name"])
                for sub_rec in sub_results:
                    symbolic_data["substitutes"].append({
                        "name": sub_rec["sub"]["name"],
                        "company": sub_rec["comp"]["name"],
                        "form": sub_rec["sub"]["form"]
                    })
            else:
                # Rule 3: Fuzzy search if no exact match
                fuzzy_query = """
                MATCH (d:Drug)
                WHERE d.name CONTAINS $name
                MATCH (d)-[:BELONGS_TO]->(cat:Category)
                MATCH (d)-[:MANUFACTURED_BY]->(comp:Company)
                RETURN d, cat, comp
                LIMIT 3
                """
                fuzzy_results = session.run(fuzzy_query, name=drug_name.upper())
                for f_rec in fuzzy_results:
                    symbolic_data["substitutes"].append({
                        "name": f_rec["d"]["name"],
                        "company": f_rec["comp"]["name"],
                        "category": f_rec["cat"]["name"]
                    })

            return symbolic_data

    def close(self):
        self.driver.close()
