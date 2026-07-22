# RetailCell — AI Model Yaklaşımı

## Genel Bakış

RetailCell AI servisi, Scikit-Learn tabanlı iki ana ML modeli kullanır:

1. **Talep Tahmini** (Regression) — RandomForestRegressor
2. **Stok Risk Sınıflandırma** (Classification) — GradientBoostingClassifier

## Eğitim Verisi

### Sentetik Dataset
- **150+ satır** sentetik perakende envanter verisi
- 7 bölge: İstanbul, Ankara, İzmir, Bursa, Antalya, Adana, Konya
- 6 kategori: PHONE, TABLET, ACCESSORY, SIM_CARD, MODEM, SMART_WATCH

### Feature Engineering

| Feature | Açıklama | Tip |
|---------|----------|-----|
| `category_encoded` | Ürün kategorisi (LabelEncoded) | Kategorik |
| `region_encoded` | Bölge (LabelEncoded) | Kategorik |
| `price` | Ürün fiyatı (TL) | Sayısal |
| `stock_level` | Mevcut stok seviyesi | Sayısal |
| `reorder_level` | Yeniden sipariş eşiği | Sayısal |
| `is_promotion` | Promosyon aktif mi | Binary |
| `day_of_week` | Haftanın günü (0-6) | Sayısal |
| `month` | Ay (1-12) | Sayısal |
| `avg_daily_sales_7d` | 7 günlük ortalama günlük satış | Sayısal |
| `avg_daily_sales_30d` | 30 günlük ortalama günlük satış | Sayısal |
| `days_since_last_restock` | Son yeniden stoklamadan bu yana gün | Sayısal |
| `supplier_lead_time_days` | Tedarikçi teslim süresi (gün) | Sayısal |

## Model 1: Talep Tahmini (Regression)

### Algoritma
**RandomForestRegressor** seçildi çünkü:
- Non-linear ilişkileri yakalayabilir
- Feature importance sağlar
- Overfitting'e karşı dayanıklı
- Confidence interval hesaplanabilir (tree ensemble)

### Hiperparametreler
```python
RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    n_jobs=-1
)
```

### Hedef Değişken
`quantity_sold` — Günlük satılan ürün adedi

### Metrikler
- **R² Score**: Model varyans açıklama oranı
- **MAE**: Ortalama mutlak hata
- **RMSE**: Kök ortalama kare hata

### Confidence Interval
Her ağacın tahminleri kullanılarak %90 güven aralığı (5. ve 95. persentil) hesaplanır.

## Model 2: Risk Sınıflandırma (Classification)

### Algoritma
**GradientBoostingClassifier** seçildi çünkü:
- Gradient boosting yüksek doğruluk sağlar
- Dengesiz sınıfları daha iyi ele alır
- Probability estimation verir

### Hiperparametreler
```python
GradientBoostingClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)
```

### Hedef Değişken
`risk_label` — LOW, MEDIUM, HIGH

### Risk Etiketleme Kuralları
```python
if stock_level <= reorder_level * 0.5:
    risk = "HIGH"
elif stock_level <= reorder_level:
    risk = "MEDIUM"
else:
    risk = "LOW"

# Promosyon + yüksek satış hızı ek risk
if is_promotion and avg_7d > 10 and stock_level < reorder_level * 1.5:
    risk = "HIGH"
```

### Metrikler
- **Accuracy**: Genel doğruluk
- **Precision**: Hassasiyet (weighted)
- **Recall**: Geri çağırma (weighted)
- **F1 Score**: Harmonik ortalama (weighted)

## API Endpoint'leri

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/ai/forecast` | POST | Talep tahmini |
| `/api/v1/ai/risk` | POST | Risk sınıflandırma |
| `/api/v1/ai/accuracy` | GET | Model metrikleri |
| `/api/v1/ai/retrain` | POST | Modeli yeniden eğit |

## Yeniden Eğitim

`POST /api/v1/ai/retrain` endpoint'i ile model canlı ortamda yeniden eğitilebilir. Bu işlem:
1. `dataset.csv` dosyasından veri yükler
2. Her iki modeli yeniden eğitir
3. Metrikleri hesaplar
4. `model.pkl` dosyasını günceller
5. In-memory model'i yeniler
