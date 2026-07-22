# RetailCell — Event Catalog

Bu döküman, mikroservisler arasında Redis Streams üzerinden iletilen tüm event'leri ve payload şemalarını tanımlar.

## Event Topics

| Topic | Producer | Consumer(s) |
|-------|----------|-------------|
| `stream:inventory` | Inventory Service | AI Service, Gamification Service |
| `stream:supply` | Inventory Service | Gamification Service |
| `stream:ai` | AI Service | Inventory Service |
| `stream:gamification` | Gamification Service | — |

---

## Inventory Events

### `inventory.updated`
Bir ürünün stok seviyesi değiştiğinde yayınlanır.

```json
{
  "event_type": "inventory.updated",
  "timestamp": "2025-07-22T10:30:00Z",
  "service": "inventory-service",
  "payload": {
    "product_id": "uuid",
    "stock_quantity": 45,
    "status": "LOW_STOCK"
  }
}
```

---

## Supply Events

### `supply.created`
Yeni tedarik talebi oluşturulduğunda yayınlanır.

```json
{
  "event_type": "supply.created",
  "timestamp": "2025-07-22T10:30:00Z",
  "service": "inventory-service",
  "payload": {
    "request_id": "uuid",
    "priority": "P1",
    "region": "İstanbul"
  }
}
```

### `supply.shipped`
Tedarik talebi kargoya verildiğinde yayınlanır.

```json
{
  "event_type": "supply.shipped",
  "timestamp": "2025-07-22T14:00:00Z",
  "service": "inventory-service",
  "payload": {
    "request_id": "uuid",
    "requester_id": "uuid"
  }
}
```

### `supply.delivered`
Tedarik talebi teslim edildiğinde yayınlanır.

```json
{
  "event_type": "supply.delivered",
  "timestamp": "2025-07-22T16:00:00Z",
  "service": "inventory-service",
  "payload": {
    "request_id": "uuid",
    "requester_id": "uuid"
  }
}
```

---

## AI Events

### `ai.risk_updated`
AI modeli stok risk seviyesini güncellediğinde yayınlanır.

```json
{
  "event_type": "ai.risk_updated",
  "timestamp": "2025-07-22T11:00:00Z",
  "service": "ai-service",
  "payload": {
    "product_id": "uuid",
    "risk_level": "HIGH",
    "risk_score": 0.87,
    "predicted_demand": 35.5
  }
}
```

---

## Event Flow Diagram

```
Inventory Service                AI Service              Gamification Service
      │                              │                          │
      ├─inventory.updated──────────►│                          │
      │                              ├─ai.risk_updated────────►│
      ├─supply.created──────────────►│                          │
      ├─supply.shipped──────────────────────────────────────►│
      ├─supply.delivered─────────────────────────────────────►│
      │                              │                          │
```
