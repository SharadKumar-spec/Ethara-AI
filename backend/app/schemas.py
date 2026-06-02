from pydantic import BaseModel, Field, EmailStr, ConfigDict, model_validator, field_validator
from typing import List, Optional
from datetime import datetime

# =====================================================================
# Product Schemas
# =====================================================================
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    sku: str = Field(..., min_length=3, max_length=50)
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    quantity: int = Field(..., ge=0, description="Quantity cannot be negative")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    sku: Optional[str] = Field(None, min_length=3, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================================
# Customer Schemas
# =====================================================================
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================================
# Order Schemas
# =====================================================================
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Order quantity must be at least 1")

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order must contain at least one item")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product_name: str = "Unknown Product"
    product_sku: str = "N/A"

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_product_info(cls, values):
        # If values is a SQLAlchemy model instance, we copy values out or set attributes
        if hasattr(values, "product") and values.product:
            setattr(values, "product_name", values.product.name)
            setattr(values, "product_sku", values.product.sku)
        else:
            setattr(values, "product_name", "Unknown Product")
            setattr(values, "product_sku", "N/A")
        return values

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str = "Unknown Customer"
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_customer_info(cls, values):
        if hasattr(values, "customer") and values.customer:
            setattr(values, "customer_name", values.customer.full_name)
        else:
            setattr(values, "customer_name", "Unknown Customer")
        return values


# =====================================================================
# Dashboard Schemas
# =====================================================================
class DashboardStatsResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
