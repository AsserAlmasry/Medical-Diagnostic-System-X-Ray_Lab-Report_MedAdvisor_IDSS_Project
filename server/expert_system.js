const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function getSymbolicAdvice(drugName, conditions, isPharmacist) {
  const session = driver.session({ database: 'neo4j' });
  const symbolicData = {
    exact_match: null,
    substitutes: [],
    metadata: {
      model: "SCRE (Symbolic Clinical Reasoning Engine)",
      type: "Neuro-Symbolic Expert System",
      knowledge_base: "Neo4j Global Knowledge Graph"
    }
  };

  try {
    // Rule 1: Find Exact Drug and its Category
    const exactResult = await session.executeRead(tx =>
      tx.run(
        `MATCH (d:Drug)-[:BELONGS_TO]->(cat:Category)
         MATCH (d)-[:MANUFACTURED_BY]->(comp:Company)
         WHERE d.name = $name
         RETURN d, cat, comp`,
        { name: drugName.toUpperCase() }
      )
    );

    if (exactResult.records.length > 0) {
      const record = exactResult.records[0];
      symbolicData.exact_match = {
        name: record.get('d').properties.name,
        price: record.get('d').properties.price,
        form: record.get('d').properties.form,
        category: record.get('cat').properties.name,
        company: record.get('comp').properties.name
      };

      // Rule 2: Find Substitutes in same category from Egypt (Middle East)
      const subResult = await session.executeRead(tx =>
        tx.run(
          `MATCH (cat:Category {name: $catName})<-[:BELONGS_TO]-(sub:Drug)
           WHERE sub.name <> $name
           MATCH (sub)-[:MANUFACTURED_BY]->(comp:Company)
           WHERE comp.region = 'Middle East'
           RETURN sub, comp
           LIMIT 5`,
          { catName: symbolicData.exact_match.category, name: symbolicData.exact_match.name }
        )
      );

      symbolicData.substitutes = subResult.records.map(r => ({
        name: r.get('sub').properties.name,
        company: r.get('comp').properties.name,
        form: r.get('sub').properties.form
      }));
    } else {
      // Rule 3: Fuzzy search
      const fuzzyResult = await session.executeRead(tx =>
        tx.run(
          `MATCH (d:Drug)-[:BELONGS_TO]->(cat:Category)
           MATCH (d)-[:MANUFACTURED_BY]->(comp:Company)
           WHERE d.name CONTAINS $name
           RETURN d, cat, comp
           LIMIT 5`,
          { name: drugName.toUpperCase() }
        )
      );

      symbolicData.substitutes = fuzzyResult.records.map(r => ({
        name: r.get('d').properties.name,
        company: r.get('comp').properties.name,
        category: r.get('cat').properties.name
      }));
    }
  } catch (error) {
    console.error("Neo4j Error:", error);
  } finally {
    await session.close();
  }

  return symbolicData;
}

module.exports = { getSymbolicAdvice };
