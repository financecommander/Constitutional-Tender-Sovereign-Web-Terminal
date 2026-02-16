# 🚀 Poly-Agent Migration Quick Start Guide

## TL;DR - What You Need to Know

**VERDICT:** ✅ **MIGRATE** (95% confidence)

**Why It's Simple:**
- No Rust code (it's all TypeScript)
- No HFT algorithms (basic CRUD operations)
- No complex concurrency (standard async/await)
- ~588 lines of code total
- Perfect fit for Vertex AI Agents

**Migration Time:** 2-3 days

---

## 📋 Step-by-Step Migration Plan

### Prerequisites
```bash
# Install tools
pip install poetry
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Clone repository
git clone <repo-url>
cd constitutional-tender-agent
```

### Step 1: Database Models (2 hours)
```bash
# Create SQLAlchemy models from Prisma schema
# Input: apps/api/prisma/schema.prisma
# Output: models/database/*.py

poetry new constitutional-tender-agent
cd constitutional-tender-agent
poetry add sqlalchemy psycopg2-binary alembic pydantic
```

**Models to create:**
- `models/database/user.py`
- `models/database/vault.py`
- `models/database/asset.py`
- `models/database/holding.py`
- `models/database/transaction.py`

### Step 2: Business Logic Services (4 hours)
```bash
poetry add python-dotenv structlog
```

**Services to implement:**
- `services/database.py` - SQLAlchemy session factory
- `services/trade_service.py` - Core trading logic (buy/sell/teleport)
- `services/market_service.py` - Price fetching (mock or real API)
- `services/auth_service.py` - User management

**Copy from TypeScript:**
- `apps/api/src/trade-execution/trade-execution.service.ts` → `services/trade_service.py`
- `apps/api/src/market-data/market-data.service.ts` → `services/market_service.py`

### Step 3: Vertex AI Tools (3 hours)
```bash
poetry add google-cloud-aiplatform langchain
```

**Tools to create:**
1. `agents/tools/buy_tool.py`
   ```python
   def execute_buy_tool(user_id: str, asset_id: str, vault_id: str, 
                        quantity: float, currency: str) -> dict:
       """Execute precious metal purchase"""
       # Call services/trade_service.py
       pass
   ```

2. `agents/tools/sell_tool.py`
3. `agents/tools/teleport_tool.py`
4. `agents/tools/market_data_tool.py`
5. `agents/tools/portfolio_tool.py`

### Step 4: Streamlit UI (4 hours)
```bash
poetry add streamlit pandas plotly
```

**Pages to create:**
- `streamlit_app/main.py` - Entry point with chat interface
- `streamlit_app/pages/1_📊_Dashboard.py` - Portfolio overview
- `streamlit_app/pages/2_💰_Trading.py` - Buy/Sell forms
- `streamlit_app/pages/3_🚀_Teleport.py` - Vault transfers

**Copy UI logic from:**
- `apps/web/src/app/page.tsx` → Dashboard structure
- `apps/web/src/components/VaultSelector.tsx` → Streamlit selectbox

### Step 5: Integration & Testing (3 hours)
```bash
poetry add pytest pytest-asyncio pytest-cov
```

**Test scenarios:**
1. Database operations (CRUD)
2. Trade execution (buy/sell/teleport)
3. Vertex AI tool calls
4. Streamlit page rendering

---

## 🗂️ File Migration Mapping

### TypeScript → Python Equivalents

| TypeScript File | Python File | Complexity |
|-----------------|-------------|------------|
| `apps/api/src/trade-execution/trade-execution.service.ts` | `services/trade_service.py` | 🟢 Easy |
| `apps/api/src/market-data/market-data.service.ts` | `services/market_service.py` | 🟢 Easy |
| `apps/api/src/auth/auth.service.ts` | `services/auth_service.py` | 🟢 Easy |
| `apps/api/prisma/schema.prisma` | `models/database/*.py` | 🟡 Medium |
| `apps/web/src/app/page.tsx` | `streamlit_app/pages/1_📊_Dashboard.py` | 🟢 Easy |
| `apps/web/src/components/*.tsx` | `streamlit_app/components/*.py` | 🟢 Easy |

**Total Migration Complexity:** 🟢 **LOW**

---

## 📦 Dependencies Cheat Sheet

### Replace These
```
NestJS → FastAPI (optional) OR direct Streamlit
Prisma → SQLAlchemy
Next.js → Streamlit
React → Streamlit components
TypeScript → Python 3.11+
```

### Install These
```txt
# Core
python = "^3.11"
pydantic = "^2.6"
python-dotenv = "^1.0"
structlog = "^24.1"

# Database
sqlalchemy = "^2.0"
psycopg2-binary = "^2.9"
alembic = "^1.13"

# Web/AI
streamlit = "^1.31"
google-cloud-aiplatform = "^1.42"
langchain = "^0.1"

# Optional
fastapi = "^0.109"  # If you need REST API
uvicorn = "^0.27"   # For FastAPI
```

---

## 🎯 Opus 4.6 Usage Strategy

### When to Use Opus 4.6
1. **System Prompt Design** - Crafting the Vertex AI agent personality
2. **Tool Integration Logic** - Complex tool chaining scenarios
3. **Error Recovery** - Handling edge cases in agent conversations
4. **Documentation** - Auto-generating API docs and tutorials

### When NOT to Use Opus 4.6
1. ❌ Direct code translation (TypeScript → Python) - Use GPT-4 or Cursor
2. ❌ SQLAlchemy model creation - Use Prisma schema as reference
3. ❌ Streamlit UI layout - Use official examples
4. ❌ Basic CRUD operations - Copy from existing code

**Cost Optimization:**
- Use GPT-4 for 90% of migration
- Save Opus 4.6 for agent prompt engineering and complex reasoning

---

## ⚡ Speed Run Commands

### Full Setup (20 minutes)
```bash
# 1. Create project
poetry new constitutional-tender-agent
cd constitutional-tender-agent

# 2. Install deps
poetry add sqlalchemy psycopg2-binary alembic pydantic \
  streamlit google-cloud-aiplatform langchain \
  python-dotenv structlog pandas plotly

# 3. Create folder structure
mkdir -p {agents/tools,agents/prompts,services,models/database,streamlit_app/pages,streamlit_app/components,tests}

# 4. Copy files from original repo
cp <original>/apps/api/prisma/schema.prisma ./schema.prisma.backup

# 5. Initialize database
alembic init alembic
# Edit alembic.ini with your DATABASE_URL

# 6. Run Streamlit
streamlit run streamlit_app/main.py
```

### Development Workflow
```bash
# Terminal 1: Database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16

# Terminal 2: Development
poetry run streamlit run streamlit_app/main.py

# Terminal 3: Tests
poetry run pytest --cov=. --cov-report=html
```

---

## 🐛 Common Pitfalls

### 1. Prisma Enums → SQLAlchemy Enums
**Problem:** Prisma enums don't map directly
```typescript
// Prisma
enum Currency {
  USD
  EUR
  CHF
}
```

**Solution:** Create Python enum + SQLAlchemy type
```python
from enum import Enum as PyEnum
from sqlalchemy import Enum

class Currency(str, PyEnum):
    USD = "USD"
    EUR = "EUR"
    CHF = "CHF"

# In model
currency = Column(Enum(Currency), default=Currency.USD)
```

### 2. Prisma Decimal → SQLAlchemy Numeric
**Problem:** JavaScript Decimal vs Python Decimal
```python
from decimal import Decimal
from sqlalchemy import Numeric

# In model
live_price_bid = Column(Numeric(precision=18, scale=8), default=Decimal("0"))
```

### 3. Async/Await Patterns
**Problem:** NestJS uses decorators, Python uses native async
```python
# TypeScript
async executeBuy(dto: TradeDto) { ... }

# Python
async def execute_buy_tool(dto: BuyToolInput) -> dict:
    async with AsyncSession(engine) as session:
        ...
```

### 4. Vertex AI Tool Schema
**Problem:** Tools need OpenAPI-compatible schemas
```python
from pydantic import BaseModel, Field

class BuyToolInput(BaseModel):
    """Schema for buy tool - auto-generates OpenAPI spec"""
    user_id: str = Field(description="User UUID")
    quantity: float = Field(gt=0, description="Quantity in troy oz")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "quantity": 5.0
            }
        }
```

---

## 📚 Reference Links

### Official Documentation
- [Streamlit Docs](https://docs.streamlit.io/)
- [Vertex AI Agents](https://cloud.google.com/vertex-ai/docs/agents)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Pydantic](https://docs.pydantic.dev/)

### Similar Projects
- [Streamlit Trading Dashboard](https://github.com/streamlit/demo-trading-dashboard)
- [Vertex AI Tools Example](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/agents)

### Market Data APIs
- [Metals-API](https://metals-api.com/) - Gold/silver prices
- [ExchangeRate-API](https://www.exchangerate-api.com/) - FX rates
- [Alpha Vantage](https://www.alphavantage.co/) - General market data

---

## ✅ Success Criteria

Migration is complete when:
- [ ] All 5 database models created and tested
- [ ] All 3 core services (trade, market, auth) working
- [ ] All 5 Vertex AI tools callable from agent
- [ ] Streamlit dashboard displays portfolio
- [ ] Can execute buy/sell/teleport via UI
- [ ] Agent responds to natural language queries
- [ ] Tests pass with >80% coverage

---

## 🎉 Expected Outcome

**Before (TypeScript):**
```
User opens web app → Clicks buttons → REST API call → Database update
```

**After (Python + Vertex AI):**
```
User types "Buy 5 oz gold in Switzerland" 
  → Agent understands intent
  → Agent calls get_market_prices_tool()
  → Agent shows price and confirms
  → User approves
  → Agent calls execute_buy_tool()
  → Agent confirms transaction with receipt
```

**User Experience Improvement:** 🚀 10x better (natural language vs forms)

---

## 📞 Support

If you encounter issues:
1. Check the main analysis doc: `POLY_AGENT_MIGRATION_ANALYSIS.md`
2. Review original TypeScript code for business logic
3. Test each component independently before integration
4. Use mock data for external APIs during development

**Estimated Success Rate:** 95% (low risk migration)
