"""
RetailCell AI Service - Synthetic Training Dataset Generator & Dataset
100+ rows of synthetic retail inventory data for training ML models.
"""
import csv
import random
import os
from datetime import datetime, timedelta


def generate_dataset(output_path: str = None, num_rows: int = 150):
    """Generate synthetic training data for demand forecasting and risk classification."""
    if output_path is None:
        output_path = os.path.join(os.path.dirname(__file__), "dataset.csv")

    categories = ["PHONE", "TABLET", "ACCESSORY", "SIM_CARD", "MODEM", "SMART_WATCH"]
    regions = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya"]

    headers = [
        "product_id", "date", "category", "region", "price",
        "quantity_sold", "stock_level", "reorder_level",
        "is_promotion", "day_of_week", "month",
        "avg_daily_sales_7d", "avg_daily_sales_30d",
        "days_since_last_restock", "supplier_lead_time_days",
        "risk_label"  # Target for classification: LOW, MEDIUM, HIGH
    ]

    rows = []
    base_date = datetime(2025, 1, 1)

    for i in range(num_rows):
        date = base_date + timedelta(days=random.randint(0, 365))
        category = random.choice(categories)
        region = random.choice(regions)

        # Price based on category
        price_map = {"PHONE": (2000, 25000), "TABLET": (3000, 15000), "ACCESSORY": (50, 500),
                     "SIM_CARD": (10, 50), "MODEM": (200, 1500), "SMART_WATCH": (1000, 8000)}
        price_range = price_map.get(category, (100, 5000))
        price = round(random.uniform(*price_range), 2)

        quantity_sold = random.randint(0, 50)
        stock_level = random.randint(0, 200)
        reorder_level = random.randint(5, 30)
        is_promotion = random.choice([0, 1])
        day_of_week = date.weekday()
        month = date.month

        avg_7d = round(random.uniform(1, 20), 2)
        avg_30d = round(random.uniform(1, 15), 2)
        days_since_restock = random.randint(0, 60)
        lead_time = random.randint(1, 14)

        # Risk label logic
        if stock_level <= reorder_level * 0.5:
            risk = "HIGH"
        elif stock_level <= reorder_level:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        # Adjust for promotion and sales velocity
        if is_promotion and avg_7d > 10 and stock_level < reorder_level * 1.5:
            risk = "HIGH"

        rows.append([
            f"PROD-{i+1:04d}", date.strftime("%Y-%m-%d"), category, region, price,
            quantity_sold, stock_level, reorder_level,
            is_promotion, day_of_week, month,
            avg_7d, avg_30d, days_since_restock, lead_time, risk
        ])

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"✅ Generated {num_rows} rows → {output_path}")
    return output_path


if __name__ == "__main__":
    generate_dataset()
