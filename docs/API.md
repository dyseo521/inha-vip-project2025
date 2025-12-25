# EECAR API Documentation

Base URL: `https://6o4futufni.execute-api.ap-northeast-2.amazonaws.com/prod`

## Authentication

Currently in demo mode - no authentication required.

---

## Endpoints

### 1. AI-Powered Search

Search for parts using natural language queries with AI-powered semantic matching.

**Endpoint:** `POST /api/search`

**Request Body:**
```json
{
  "query": "ESS 에너지 저장 시스템에 사용할 수 있는 60kWh 이상 배터리",
  "filters": {
    "category": "battery",
    "maxPrice": 5000000
  },
  "topK": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "partId": "uuid",
      "score": 0.92,
      "part": {
        "name": "Tesla Model S 배터리 팩",
        "category": "battery",
        "manufacturer": "Tesla",
        "price": 3500000
      },
      "reason": "60kWh 용량으로 ESS 시스템에 적합합니다."
    }
  ],
  "cached": false,
  "count": 5
}
```

---

### 2. Battery SOH Assessment

Search batteries by SOH (State of Health) and cathode type.

**Endpoint:** `POST /api/battery-assessment`

**Request Body:**
```json
{
  "batteryFilters": {
    "soh": { "min": 70, "max": 95 },
    "cathodeType": ["NCM Ni 80%"],
    "recommendedUse": ["reuse"]
  },
  "topK": 5
}
```

---

### 3. Material Property Search

Search parts by material properties (aluminum alloys, etc.).

**Endpoint:** `POST /api/material-search`

**Request Body:**
```json
{
  "materialFilters": {
    "alloyNumber": "6061",
    "tensileStrengthMPa": { "min": 300 },
    "recyclability": { "min": 90 }
  },
  "category": "body-panel",
  "topK": 5
}
```

---

### 4. Get Parts

**Endpoint:** `GET /api/parts?category={category}&limit={limit}`

**Query Parameters:**
- `category` (optional): battery, motor, inverter, body-panel, body-door, body-chassis-frame, body-window
- `limit` (optional): default 20

---

### 5. Get Part by ID

**Endpoint:** `GET /api/parts/{id}`

---

### 6. Register Part

**Endpoint:** `POST /api/parts`

---

### 7. Create Watch Alert

**Endpoint:** `POST /api/watch`

---

### 8. Create Proposal

**Endpoint:** `POST /api/proposals`

---

### 9. Contact Inquiry

**Endpoint:** `POST /api/contact`

**Request Body:**
```json
{
  "partId": "part-uuid",
  "name": "김철수",
  "email": "buyer@company.com",
  "phone": "010-1234-5678",
  "message": "해당 부품에 관심이 있습니다."
}
```

---

### 10. Generate Synthetic Data (Dev Only)

**Endpoint:** `POST /api/synthetic`

**Request Body:**
```json
{
  "category": "battery",
  "count": 5
}
```

---

## Error Responses

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `400` Bad Request
- `404` Not Found
- `500` Internal Server Error

---

## Part Categories

- `battery` - 배터리 팩
- `motor` - 구동 모터
- `inverter` - 인버터
- `body-chassis-frame` - 샤시/프레임
- `body-panel` - 외판/패널
- `body-door` - 도어
- `body-window` - 창/유리
