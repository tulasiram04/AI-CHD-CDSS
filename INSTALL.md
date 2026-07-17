# Developer Installation & Setup Guide: AI-CHD-CDSS

Follow these instructions to set up the developer environment locally for building and testing the AI-CHD-CDSS components.

---

## 1. Prerequisites

Ensure you have the following runtimes installed on your local workstation:
- **Python**: v3.12 or v3.13
- **Node.js**: v20 or higher (including npm)
- **Git**
- **Docker & Docker Compose** (for testing containerization)

---

## 2. Backend Setup & Virtual Environment

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd bio-tech-project
   ```
2. **Create Python Virtual Environment**:
   ```bash
   python -m venv .venv
   ```
3. **Activate Virtual Environment**:
   - *Windows (PowerShell)*:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - *Linux/macOS*:
     ```bash
     source .venv/bin/activate
     ```
4. **Install Python Package Requirements**:
   ```bash
   pip install --upgrade pip
   # Installs dependencies including XGBoost, Optuna, FastAPI, and pytest
   pip install -r requirements.txt
   ```

---

## 3. Database Initializing & Alembic Migrations

1. **Configure Environment Variables**:
   Copy `.env.development` to `.env` to load standard developer configurations:
   ```bash
   cp .env.development .env
   ```
2. **Apply Database Migrations**:
   The backend uses SQLAlchemy and Alembic. Apply the database schemas:
   ```bash
   alembic upgrade head
   ```

---

## 4. Frontend Setup

1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   ```
2. **Install Node dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment variables**:
   Create a local development environment configuration:
   ```bash
   # In frontend/ directory, point NEXT_PUBLIC_API_URL to local FastAPI
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   ```
4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to access the interface.

---

## 5. Running Verification Tests

Run the complete validation suites to certify installation success:

- **Backend Pytest suite**:
  ```bash
  python -m pytest
  ```
- **Frontend unit tests**:
  ```bash
  cd frontend
  node --test tests/frontend.test.js
  ```
