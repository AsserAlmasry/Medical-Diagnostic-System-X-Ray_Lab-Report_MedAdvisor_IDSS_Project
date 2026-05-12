# MedAI Insight v2.2 Architecture

This diagram illustrates the flow of data through the Intelligent Decision Support System (IDSS).

```mermaid
graph TD
    User([User Interface]) --> |Images/Queries| API[API Gateway - Node.js]
    
    subgraph "IDSS Cognitive Layers"
        API --> |X-Ray Scan| CV[Layer 1: Perception - YOLO12]
        API --> |Lab Report| OCR[Layer 2: Extraction - EasyOCR]
        API --> |Medicine Query| SCRE[Layer 3: Symbolic Reasoning - SCRE Expert System]
        
        SCRE <--> |Query/Rules| KB[(Neo4j Knowledge Graph)]
        KB -.-> |Local Alternatives| SCRE
    end
    
    CV --> |Detections| Reasoning[Agentic Reasoning Layer - Llama 3.3 70B]
    OCR --> |Lab Values| Reasoning
    SCRE --> |Symbolic Evidence| Reasoning
    
    Reasoning --> |Contextual Interpretation| Result[Final Diagnostic Advice]
    Result --> User
    
    style User fill:#00f2ff,stroke:#00f2ff,color:#000
    style KB fill:#ff5e00,stroke:#ff5e00,color:#fff
    style Reasoning fill:#7d00ff,stroke:#7d00ff,color:#fff
    style SCRE fill:#00ff88,stroke:#00ff88,color:#000
```

### System Components:

1.  **Perception Layer (YOLO12)**: Handles spatial analysis of medical imaging.
2.  **Extraction Layer (EasyOCR)**: Performs text conversion for unstructured lab data.
3.  **Symbolic Layer (SCRE)**: A rule-based expert system that enforces medical logic and performs exact-match searches in the Neo4j Knowledge Base.
4.  **Knowledge Base (Neo4j)**: A graph-based representation of the Egyptian pharmaceutical market, linking drugs, manufacturers, and categories.
5.  **Neural Reasoning Layer (Llama 3.3)**: Synthesizes findings from all layers to provide high-empathy, clinical-grade advice.
