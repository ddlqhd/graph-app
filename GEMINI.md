# Project: GraphSQL - Graph Data Visualization Platform

## Project Overview

GraphSQL is a full-stack graph data visualization and analysis platform. It provides a comprehensive solution for visualizing and interacting with graph data, built with a modern technology stack. The platform is designed to demonstrate various graph data scenarios, including company organizational charts, knowledge graphs, and social relationship networks.

## Main Technologies

*   **Frontend:** Developed with Vue 3, utilizing Element Plus for UI components, AntV G6 for powerful graph visualization, Pinia for state management, Vue Router for navigation, Vite for fast builds, and Axios for HTTP requests.
*   **Backend:** Built on Node.js with the Express.js framework, it serves as the API layer and interacts with the graph database using the Neo4j Driver.
*   **Database:** Employs Neo4j (Community Edition) as the primary graph database for storing and querying graph data.
*   **Deployment:** Leverages Docker and Docker Compose for containerization and simplified deployment.

## Architecture

The project follows a typical three-tier architecture:

1.  **Frontend:** A single-page application (SPA) built with Vue 3, responsible for rendering the user interface and interacting with the backend API.
2.  **Backend:** A Node.js/Express API server that handles business logic, data retrieval from Neo4j, and serves data to the frontend.
3.  **Database:** A Neo4j graph database instance that stores the graph data.

## Building and Running

The recommended way to build and run the project is using Docker Compose.

### Using Docker Compose (Recommended)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/graphsql.git
    cd graphsql
    ```
2.  **Start all services:**
    ```bash
    docker-compose up -d
    ```
3.  **Access the application:**
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:3000`
    *   Neo4j Browser: `http://localhost:7474`

### Manual Installation

If you prefer to run services manually:

1.  **Start Neo4j Database:**
    ```bash
    docker run -d \
      --name graphsql-neo4j \
      -p 7474:7474 -p 7687:7687 \
      -e NEO4J_AUTH=neo4j/password123 \
      neo4j:5.13
    ```
2.  **Initialize Example Data (in `database` directory):**
    ```bash
    cd database
    npm install
    npm run init
    ```
3.  **Start Backend Service (in `backend` directory):**
    ```bash
    cd backend
    npm install
    npm run dev
    ```
4.  **Start Frontend Application (in `frontend` directory):**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
5.  **Access the application:**
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:3000`
    *   Neo4j Browser: `http://localhost:7474`

## Development Conventions

*   **Language:** TypeScript is used for type checking, primarily in the frontend.
*   **Code Style:** Adherence to ESLint and Prettier for consistent code formatting and style.
*   **Testing:** Unit and integration tests are expected to be written for new features and bug fixes.
*   **Documentation:** Relevant documentation (API, development guides) should be updated with any code changes.

## Key Features

*   **Multiple Layout Algorithms:** Supports various graph layout algorithms (force-directed, hierarchical, grid, etc.).
*   **Rich Interaction:** Provides interactive features like zooming, dragging, click-to-expand nodes, and search functionality.
*   **Responsive Design:** Adapts to different screen sizes for a consistent user experience.
*   **Intelligent Search:** Allows searching and filtering of nodes and relationships.
*   **Data Panel:** Displays real-time graph statistics and information.
*   **Theme Switching:** Supports both light and dark themes.

## Documentation

The project includes the following documentation:

*   [API Documentation](./docs/API.md)
*   [Development Guide](./docs/DEVELOPMENT.md)
*   [Deployment Guide](./docs/DEPLOYMENT.md)
*   [Product Design Report](./product_design.md)
