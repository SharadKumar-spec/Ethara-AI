from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app import models, schemas

# =====================================================================
# Product CRUD
# =====================================================================
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).order_by(models.Product.id.desc()).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return db_product


# =====================================================================
# Customer CRUD
# =====================================================================
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).order_by(models.Customer.id.desc()).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(
        full_name=customer.full_name,
        email=customer.email,
        phone=customer.phone
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer


# =====================================================================
# Order CRUD (with Transactions)
# =====================================================================
def get_order(db: Session, order_id: int):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.id == order_id)
        .first()
    )

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .order_by(models.Order.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_order(db: Session, order_create: schemas.OrderCreate):
    # Verify customer exists
    customer = get_customer(db, order_create.customer_id)
    if not customer:
        raise ValueError("Customer not found")

    # We will build the transaction
    total_amount = 0.0
    order_items = []

    # Process items
    for item in order_create.items:
        # Load product (use .with_for_update() when running on PostgreSQL for concurrency safety)
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )
        if not product:
            raise ValueError(f"Product with ID {item.product_id} not found")
        
        if product.quantity < item.quantity:
            raise ValueError(
                f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                f"Requested: {item.quantity}, Available: {product.quantity}."
            )
        
        # Deduct stock
        product.quantity -= item.quantity
        
        # Calculate item cost
        item_price = product.price
        total_amount += item_price * item.quantity

        db_order_item = models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=item_price
        )
        order_items.append(db_order_item)

    # Create parent Order
    db_order = models.Order(
        customer_id=order_create.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    db.flush()  # Populates db_order.id

    # Assign order_id to children order items
    for db_order_item in order_items:
        db_order_item.order_id = db_order.id
        db.add(db_order_item)

    db.commit()
    
    # Reload order with relations
    return get_order(db, db_order.id)

def delete_order(db: Session, order_id: int):
    # Fetch order along with items
    db_order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .first()
    )
    if not db_order:
        return None

    # Restore inventory stock
    for item in db_order.items:
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )
        if product:
            product.quantity += item.quantity

    db.delete(db_order)
    db.commit()
    return db_order


# =====================================================================
# Dashboard statistics
# =====================================================================
def get_dashboard_stats(db: Session):
    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    total_customers = db.query(func.count(models.Customer.id)).scalar() or 0
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    
    # Low stock is defined as quantity < 10
    low_stock_products = (
        db.query(models.Product)
        .filter(models.Product.quantity < 10)
        .order_by(models.Product.quantity.asc())
        .all()
    )
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }
