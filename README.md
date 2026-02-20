### RIFT EYE – Real-Time Illicit Financial Tracking

Advanced Graph-Based Fraud Ring and Suspicious Transaction Detection System

### Live Demo:
Frontend Dashboard:
https://rift-hackathon-puce.vercel.app

### Project Overview:

RIFT EYE is an intelligent financial fraud detection engine designed to uncover:
•⁠  ⁠Suspicious accounts
•⁠  ⁠Fraud rings
•⁠  ⁠Smurfing patterns
•⁠  ⁠Circular money laundering cycles
•⁠  ⁠Shell account chains

The system models transaction data as a directed graph, applies graph-theoretic algorithms, and computes a dynamic suspicion score for each account.It is built to efficiently handle high-volume transaction datasets while maintaining structured and compliant outputs.

### Key Features:

•⁠  ⁠Graph-based fraud modeling
•⁠  ⁠Cycle detection for laundering rings
•⁠  ⁠Bipartite-style detection for smurfing patterns
•⁠  ⁠Chain detection for shell layering
•⁠  ⁠Dynamic suspicion scoring
•⁠  ⁠Strict JSON output (competition compliant)
•⁠  ⁠Interactive frontend visualization
•⁠  ⁠Downloadable analysis report

### System Architecture:
                ┌──────────────────────┐
                │   Transaction Data   │
                └────────────┬─────────┘
                             │
                             ▼
                    Graph Construction
                             │
                             ▼
               ┌────────────────────────┐
               │  Fraud Detection Engine|
               ├────────────────────────┤
               │  • Cycle Detection     │
               │  • Smurf Detection     │
               │  • Chain Detection     │
               └────────────┬───────────┘
                            |
                            ▼
                  Suspicion Score Engine
                            │
                            ▼
                   JSON Output Formatter
                            │
                            ▼
                    Frontend Dashboard

### Tech Stack:

## Backend
•⁠  ⁠Node.js
•⁠  ⁠Express.js
•⁠  ⁠Graph-based data structures
•⁠  ⁠Custom fraud detection algorithms

## Frontend
•⁠  ⁠React.js
•⁠  ⁠D3.js (Graph Visualization)
•⁠  ⁠TailwindCSS

## Data Handling

•⁠  ⁠JSON-based transaction ingestion
•⁠  ⁠Optimized adjacency list representation

## Algorithmic Approach

RIFT EYE treats transactions as a directed graph:
•⁠  ⁠Nodes represent accounts
•⁠  ⁠Edges represent transactions

1.⁠ ⁠Cycle Detection (Fraud Rings)
Used to detect circular money movement patterns.
Approach:
•⁠  ⁠Strongly Connected Components filtering
•⁠  ⁠Modified Johnson-style cycle pruning
•⁠  ⁠Time Complexity:
O((V + E)(C + 1))
Where:
V = number of vertices
E = number of edges
C = number of cycles
The implementation is optimized to prune trivial and duplicate sub-cycles.

2.⁠ ⁠Smurfing Detection (Bipartite-like Pattern)
Detects multiple low-value accounts sending funds to a single aggregator.
Approach:
•⁠  ⁠In-degree concentration analysis
•⁠  ⁠Threshold-based clustering
•⁠  ⁠Time Complexity:
O(V + E)

3.⁠ ⁠Shell Chain Detection (Layering)
Detects linear fund transfers across intermediary accounts.
Approach:
•⁠  ⁠DFS traversal with depth threshold
•⁠  ⁠Path pruning
•⁠  ⁠Time Complexity:
O(V + E)

### Suspicion Score Methodology:

Each account receives a normalized suspicion score between 0 and 100.
## Score Components
# Factor	                       Weight
•⁠  ⁠Participation in Fraud Ring	   +40
•⁠  ⁠Smurf Aggregation	             +25
•⁠  ⁠Shell Chain Depth	             +20
•⁠  ⁠High Transaction Frequency	     +10
•⁠  ⁠Abnormal Flow Patterns	         +5

# Formula
Score = Σ (Pattern Weights)
Score = min(100, Calculated Score)

Additional Notes:
•⁠  ⁠Scores are rounded to one decimal precision.
•⁠  ⁠Normal accounts typically remain near 0–10.
•⁠  ⁠High-risk entities exceed 60.

### Installation and Setup:

1.⁠ ⁠Clone Repository

2.⁠ ⁠Install Dependencies
npm install

3.⁠ ⁠Run Backend
npm start
Server runs on:
http://localhost:5050

4.⁠ ⁠Run Frontend
cd client
npm install
npm start

### Usage Instructions:

1.⁠ ⁠Upload transaction dataset in CSV format.
2.⁠ ⁠Click "Analyze Transactions".
3.⁠ ⁠Review:
•⁠  ⁠Suspicious Accounts
•⁠  ⁠Fraud Rings
•⁠  ⁠Risk Scores
4.⁠ ⁠Download the analysis JSON report.
5.⁠ ⁠Explore the graph visualization interactively.

### Output Format:

The system outputs strictly formatted JSON:
{
  "suspicious_accounts": [...],
  "fraud_rings": [...],
  "summary": {
    "total_accounts_analyzed": 0,
    "suspicious_accounts_flagged": 0,
    "fraud_rings_detected": 0,
    "processing_time_seconds": 0.000
  }
}
The output is fully compliant with the competition evaluation schema.

### Performance Characteristics:

•⁠  ⁠Handles large graphs efficiently
•⁠  ⁠Optimized adjacency list memory usage
•⁠  ⁠Cycle pruning prevents exponential explosion
•⁠  ⁠Processing time scales near-linearly for sparse graphs

### Known Limitations:

•⁠  ⁠Extremely dense graphs may increase cycle detection cost
•⁠  ⁠Threshold-based scoring may require tuning for different datasets
•⁠  ⁠Does not include machine learning-based anomaly detection
•⁠  ⁠No real-time streaming ingestion (batch processing only)
•⁠  ⁠Does not use additional contextual metadata (e.g., KYC, geographic data).
•⁠  ⁠Fixed thresholds may require tuning for different datasets.

### Future Improvements:

•⁠  ⁠Machine learning-based anomaly scoring
•⁠  ⁠Real-time Kafka streaming integration
•⁠  ⁠Risk explanation module
•⁠  ⁠Advanced false-positive filtering
•⁠  ⁠Adaptive dynamic weight learning

### Team Members:

Yash Saini – System Design
Mohit Mudgil – Full Stack Developer
Sofi – Full Stack Developer
Tanika – UI/UX Designer
