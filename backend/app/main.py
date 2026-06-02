from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.config import settings
from app.database import Base, engine
from app.routers import products, customers, orders, dashboard

# Automatically create tables in the database.
# Note: For production, tools like Alembic are preferred, but automatic table creation is standard for bootstrapping.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Inventory & Order Management System",
    version="1.0.0"
)

# CORS configuration
# Allows localhost dev servers, production frontend endpoints, and wildcards where applicable
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(IntegrityError)
def integrity_exception_handler(request: Request, exc: IntegrityError):
    # This catches unique constraint violations (SKU, Email) at the database layer
    error_msg = str(exc.orig) if exc.orig else str(exc)
    detail = "Database integrity violation constraint occurred."
    if "unique" in error_msg.lower() or "duplicate key" in error_msg.lower():
        detail = "Record with this unique identifier (e.g. SKU or Email) already exists."
        
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": detail, "raw": error_msg}
    )

@app.exception_handler(SQLAlchemyError)
def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database query error occurred. Please try again later."}
    )

# Include routers under the api v1 path
api_prefix = settings.API_V1_STR
app.include_router(products.router, prefix=api_prefix)
app.include_router(customers.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)

@app.get("/")
def read_root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs"
    }
