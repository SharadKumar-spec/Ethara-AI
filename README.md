# StockFlow: Inventory & Order Management System

StockFlow is a production-grade, containerized inventory and order management dashboard built with FastAPI, React + Material UI, and PostgreSQL. It features transactional order processing, dynamic stock depletion checks, low-stock notifications, and a responsive dark-themed dashboard.

---

## 🛠 Tech Stack

*   **Frontend**: React (Vite) + Material UI (MUI v5)
*   **Backend**: FastAPI (Python 3.12)
*   **Database**: PostgreSQL
*   **ORM**: SQLAlchemy v2
*   **Validation**: Pydantic v2
*   **Containerization**: Docker & Docker Compose

---

## 📂 Project Structure

```
/
├── backend/
│   ├── app/
│   │   ├── main.py         # Entrypoint, CORS, Exception Handlers
│   │   ├── config.py       # Pydantic environment configuration
│   │   ├── database.py     # SQLAlchemy Connection Setup
│   │   ├── models.py       # Database Schema Models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py      # Pydantic schemas (Request/Response validation)
│   │   ├── crud.py         # Business operations (Transactional Order Checkout)
│   │   └── routers/        # Resource API controllers (endpoints)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable layout and modal components
│   │   ├── pages/          # Dashboard, Products, Customers, Orders
│   │   ├── App.jsx         # MUI Theme and client routes
│   │   ├── api.js          # Axios API wrapper client
│   │   └── main.jsx        # Mounting entry point
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🚀 Running Locally (Docker Compose)

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

1.  **Clone / Navigate** to the project directory:
    ```bash
    cd "Oder ManagmentSystem"
    ```
2.  **Spin up the containers**:
    ```bash
    docker compose up --build
    ```
3.  **Access the interfaces**:
    *   **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
    *   **Backend API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
    *   **PostgreSQL Port**: `5432`

---

## 🧪 Testing the APIs (Manual Validation)

You can run these basic HTTP operations to verify correct database transactions, stock deduction, and error validation:

### 1. Register a Customer
```bash
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"full_name": "John Doe", "email": "john@example.com", "phone": "123-456-7890"}'
```

### 2. Add a Product
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Gaming Keyboard", "sku": "KEY-RGB-01", "price": 89.99, "quantity": 10}'
```

### 3. Place an Order (Success Case)
This request will decrease the product quantity from `10` to `7` and compute the total price automatically:
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "items": [{"product_id": 1, "quantity": 3}]}'
```

### 4. Place an Order (Insufficient Stock Error Case)
This request asks for 15 units when only 7 are left. It should return a `400 Bad Request` and roll back transactionally without making changes:
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "items": [{"product_id": 1, "quantity": 15}]}'
```

---

## 🌐 Production Deployment Guide

Follow these steps to deploy StockFlow to production servers:

### 1. Database Setup: Neon (Postgres)
1. Go to [Neon.tech](https://neon.tech/) and sign up.
2. Create a new project, naming your database (e.g., `stockflow_db`).
3. Copy the connection string under **Connection Details**. Choose **SQLAlchemy** or raw connection. It will look like:
   `postgresql://alex:password@ep-cool-snowflake-12345.us-east-2.aws.neon.tech/stockflow_db?sslmode=require`

### 2. Backend Setup: Render (FastAPI)
1. Sign up on [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your repository containing this project.
4. Set the following fields:
   * **Root Directory**: `backend`
   * **Runtime**: `Python`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Go to **Environment** tab and add:
   * `DATABASE_URL` = (Your Neon connection string copied in step 1)
6. Render will build and deploy the backend. Copy your deployed Render URL (e.g., `https://stockflow-api.onrender.com`).

### 3. Frontend Setup: Vercel (React)
1. Create a project at [Vercel.com](https://vercel.com/).
2. Select **Import Project** and link your Git repository.
3. Set the following fields:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Vite` (Vercel automatically detects this)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Add the following environment variable:
   * `VITE_API_URL` = `https://stockflow-api.onrender.com/api` (Ensure `/api` suffix is present and matches your Render backend)
5. Click **Deploy**. Vercel will bundle the static React files and deploy them globally.
