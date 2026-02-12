# Opus 4.6 Migration Prompt
## Complete Copy-Paste Instructions for Claude Opus 4.6

---

## 🎯 CONTEXT SETTING

You are an expert Python developer specializing in AI agent systems, Streamlit applications, and financial trading platforms.

### MISSION
Rewrite the Constitutional Tender Sovereign Web Terminal from TypeScript to Python, transforming it into a Vertex AI Agent-powered system.

### CURRENT SYSTEM OVERVIEW
- **Backend:** NestJS REST API with 3 modules (Auth, MarketData, TradeExecution)
- **Frontend:** Next.js dashboard with React components  
- **Database:** PostgreSQL via Prisma ORM
- **Business Logic:** Simple buy/sell/transfer operations for gold/silver across international vaults
- **Lines of Code:** ~588 total (20 TypeScript files)

### TARGET SYSTEM OVERVIEW
- **UI:** Streamlit multi-page app with chat interface
- **AI Agent:** Vertex AI Agent with custom Python tools
- **Backend:** FastAPI REST API (optional - can use tools directly)
- **Database:** PostgreSQL via SQLAlchemy
- **Deployment:** Google Cloud Platform

---

## 📋 PHASE 1: CORE ENGINE MIGRATION (PRIORITY)

### Task 1.1: Trade Execution Service
**Source File:** `apps/api/src/trade-execution/trade-execution.service.ts`

**Functions to Migrate:**

#### 1.1.1 Buy Function
```typescript
// Original TypeScript
async executeBuy(dto: TradeDto) {
  const asset = await this.prisma.asset.findUniqueOrThrow({
    where: { id: dto.assetId },
  });
  
  const totalAmount = Number(asset.livePriceAsk) * dto.quantity;
  
  const transaction = await this.prisma.transaction.create({
    data: {
      userId: dto.userId,
      assetId: dto.assetId,
      type: 'BUY',
      status: 'COMPLETED',
      quantity: dto.quantity,
      pricePerUnit: asset.livePriceAsk,
      totalAmount,
      currency: dto.currency as any,
      toVaultId: dto.vaultId,
    },
  });
  
  await this.prisma.holding.upsert({
    where: {
      userId_assetId_vaultId: {
        userId: dto.userId,
        assetId: dto.assetId,
        vaultId: dto.vaultId,
      },
    },
    update: { quantity: { increment: dto.quantity } },
    create: {
      userId: dto.userId,
      assetId: dto.assetId,
      vaultId: dto.vaultId,
      quantity: dto.quantity,
    },
  });
  
  return transaction;
}
```

**Target Python (services/trade_service.py):**
```python
async def execute_buy(
    user_id: str,
    asset_id: str,
    vault_id: str,
    quantity: Decimal,
    currency: Currency
) -> Transaction:
    """Execute precious metal purchase and update holdings."""
    async with AsyncSession(engine) as session:
        # Fetch asset with current price
        asset = await session.get(Asset, asset_id)
        if not asset:
            raise ValueError(f"Asset {asset_id} not found")
        
        # Calculate total amount
        total_amount = asset.live_price_ask * quantity
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            asset_id=asset_id,
            type=TransactionType.BUY,
            status=TransactionStatus.COMPLETED,
            quantity=quantity,
            price_per_unit=asset.live_price_ask,
            total_amount=total_amount,
            currency=currency,
            to_vault_id=vault_id
        )
        session.add(transaction)
        
        # Update or create holding
        stmt = select(Holding).where(
            Holding.user_id == user_id,
            Holding.asset_id == asset_id,
            Holding.vault_id == vault_id
        )
        holding = await session.scalar(stmt)
        
        if holding:
            holding.quantity += quantity
        else:
            holding = Holding(
                user_id=user_id,
                asset_id=asset_id,
                vault_id=vault_id,
                quantity=quantity
            )
            session.add(holding)
        
        await session.commit()
        await session.refresh(transaction)
        return transaction
```

**Vertex AI Tool Wrapper (agents/tools/buy_tool.py):**
```python
from pydantic import BaseModel, Field
from typing import Literal

class BuyToolInput(BaseModel):
    """Input schema for precious metal purchase tool."""
    user_id: str = Field(description="User UUID")
    asset_id: str = Field(description="Asset UUID (gold or silver product)")
    vault_id: str = Field(description="Destination vault UUID")
    quantity: float = Field(gt=0, description="Quantity in troy ounces")
    currency: Literal["USD", "EUR", "CHF", "SGD", "KYD", "GBP"] = Field(
        default="USD",
        description="Payment currency"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "asset_id": "987fcdeb-51a2-43f1-a123-456789abcdef",
                "vault_id": "456a7890-bcde-12f3-4567-890abcdef123",
                "quantity": 5.0,
                "currency": "USD"
            }
        }

async def execute_buy_tool(input: BuyToolInput) -> dict:
    """
    Execute a precious metal purchase and update user holdings.
    
    This tool:
    1. Fetches current market price for the asset
    2. Calculates total cost (quantity × ask price)
    3. Creates transaction record
    4. Updates user's holding in specified vault
    
    Returns transaction details including total cost and confirmation.
    """
    from services.trade_service import execute_buy
    from services.database import get_async_session
    
    try:
        async with get_async_session() as session:
            transaction = await execute_buy(
                user_id=input.user_id,
                asset_id=input.asset_id,
                vault_id=input.vault_id,
                quantity=Decimal(str(input.quantity)),
                currency=Currency[input.currency]
            )
            
            return {
                "status": "success",
                "transaction_id": str(transaction.id),
                "quantity": float(transaction.quantity),
                "price_per_unit": float(transaction.price_per_unit),
                "total_amount": float(transaction.total_amount),
                "currency": transaction.currency.value,
                "message": f"Successfully purchased {transaction.quantity} oz"
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": f"Purchase failed: {str(e)}"
        }
```

#### 1.1.2 Sell Function
**Instructions:** Convert `executeSell()` using same pattern as buy, but:
- Use `asset.live_price_bid` instead of ask
- Decrement holding quantity instead of increment
- Set `from_vault_id` instead of `to_vault_id`
- Add validation to ensure sufficient holdings

#### 1.1.3 Teleport Function  
**Instructions:** Convert `executeTeleport()` to transfer holdings between vaults:
- Decrement from source vault
- Increment in destination vault
- Both operations in same transaction
- No price calculation (internal transfer)

#### 1.1.4 Get Holdings Function
**Instructions:** Convert `getHoldings()` to fetch and return portfolio:
- Join holding with asset and vault tables
- Return enriched data with current prices
- Calculate total value per holding

---

### Task 1.2: Market Data Service
**Source File:** `apps/api/src/market-data/market-data.service.ts`

**Functions to Migrate:**

#### 1.2.1 Get Live Prices
```typescript
// Original TypeScript
async getLivePrices() {
  return this.prisma.asset.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      symbol: true,
      metalType: true,
      weightOz: true,
      livePriceBid: true,
      livePriceAsk: true,
      spreadPercent: true,
    },
  });
}
```

**Target Python (services/market_service.py):**
```python
async def get_live_prices() -> List[dict]:
    """Fetch current bid/ask prices for all active precious metal products."""
    async with AsyncSession(engine) as session:
        stmt = select(Asset).where(Asset.is_active == True)
        result = await session.scalars(stmt)
        assets = result.all()
        
        return [
            {
                "id": str(asset.id),
                "name": asset.name,
                "symbol": asset.symbol,
                "metal_type": asset.metal_type,
                "weight_oz": float(asset.weight_oz),
                "live_price_bid": float(asset.live_price_bid),
                "live_price_ask": float(asset.live_price_ask),
                "spread_percent": float(asset.spread_percent),
            }
            for asset in assets
        ]
```

**Vertex AI Tool (agents/tools/market_data_tool.py):**
- Wrap above function
- Add caching (5 minute TTL)
- Add error handling for database unavailability

#### 1.2.2 Get FX Rates
**Current:** Mocked hardcoded rates  
**Target:** Integrate with real API (e.g., ExchangeRate-API.com)
```python
async def get_fx_rates() -> dict:
    """Fetch foreign exchange rates for multi-currency support."""
    # TODO: Replace with real API call
    # Example: https://api.exchangerate-api.com/v4/latest/USD
    import aiohttp
    
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://api.exchangerate-api.com/v4/latest/USD"
        ) as response:
            data = await response.json()
            return {
                "base_currency": "USD",
                "rates": {
                    "EUR": data["rates"]["EUR"],
                    "CHF": data["rates"]["CHF"],
                    "SGD": data["rates"]["SGD"],
                    "KYD": data["rates"]["KYD"],
                    "GBP": data["rates"]["GBP"],
                },
                "updated_at": data["time_last_updated"]
            }
```

---

### Task 1.3: Database Models Migration
**Source File:** `apps/api/prisma/schema.prisma`

**Instructions:** Convert all Prisma models to SQLAlchemy 2.0 declarative style.

#### Example: User Model
```python
# models/database/user.py
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from enum import Enum as PyEnum

from .base import Base

class KycStatus(str, PyEnum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class Currency(str, PyEnum):
    USD = "USD"
    EUR = "EUR"
    CHF = "CHF"
    SGD = "SGD"
    KYD = "KYD"
    GBP = "GBP"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auth_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    kyc_status = Column(SQLEnum(KycStatus), default=KycStatus.PENDING)
    base_currency = Column(SQLEnum(Currency), default=Currency.USD)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    holdings = relationship("Holding", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
```

**Complete All Models:**
1. `models/database/user.py` - User (done above)
2. `models/database/vault.py` - Vault
3. `models/database/asset.py` - Asset  
4. `models/database/holding.py` - Holding
5. `models/database/transaction.py` - Transaction

**Key Mappings:**
- Prisma `String` → SQLAlchemy `String`
- Prisma `Decimal` → SQLAlchemy `Numeric(18, 8)`
- Prisma `Boolean` → SQLAlchemy `Boolean`
- Prisma `DateTime` → SQLAlchemy `DateTime(timezone=True)`
- Prisma `@unique` → SQLAlchemy `unique=True`
- Prisma `@default(uuid())` → SQLAlchemy `default=uuid.uuid4`
- Prisma `@@map("table_name")` → SQLAlchemy `__tablename__ = "table_name"`

---

## 📋 PHASE 2: VERTEX AI AGENT SETUP

### Task 2.1: Tool Registration
Create a central registry for all tools:

```python
# agents/tool_registry.py
from google.cloud import aiplatform
from typing import List, Callable
from .tools.buy_tool import execute_buy_tool
from .tools.sell_tool import execute_sell_tool
from .tools.teleport_tool import execute_teleport_tool
from .tools.market_data_tool import get_market_prices_tool
from .tools.portfolio_tool import get_portfolio_tool

class ToolRegistry:
    """Registry for all Vertex AI agent tools."""
    
    def __init__(self):
        self.tools: List[Callable] = [
            execute_buy_tool,
            execute_sell_tool,
            execute_teleport_tool,
            get_market_prices_tool,
            get_portfolio_tool,
        ]
    
    def get_tool_schemas(self) -> List[dict]:
        """Generate OpenAPI schemas for all tools."""
        schemas = []
        for tool in self.tools:
            # Extract from Pydantic BaseModel
            schema = tool.__annotations__["input"].model_json_schema()
            schemas.append({
                "name": tool.__name__,
                "description": tool.__doc__,
                "parameters": schema
            })
        return schemas
    
    async def execute_tool(self, tool_name: str, parameters: dict) -> dict:
        """Execute a tool by name with given parameters."""
        tool = next((t for t in self.tools if t.__name__ == tool_name), None)
        if not tool:
            raise ValueError(f"Tool {tool_name} not found")
        
        # Create input model instance
        input_class = tool.__annotations__["input"]
        input_obj = input_class(**parameters)
        
        # Execute tool
        return await tool(input_obj)
```

### Task 2.2: Agent Configuration
```python
# agents/trading_agent.py
from google.cloud import aiplatform
from vertexai.preview import reasoning_engines
import os

class TradingAgent:
    """Vertex AI agent for precious metals trading."""
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        self.tool_registry = ToolRegistry()
        
        aiplatform.init(project=project_id, location=location)
        
        # Load system prompt
        with open("agents/prompts/system_prompt.txt", "r") as f:
            self.system_prompt = f.read()
    
    async def create_session(self, user_id: str) -> str:
        """Create new conversation session for user."""
        # Initialize Vertex AI Reasoning Engine
        agent = reasoning_engines.LangchainAgent(
            model="claude-3-5-sonnet@20241022",  # Or Gemini
            tools=self.tool_registry.tools,
            agent_executor_kwargs={
                "return_intermediate_steps": True,
                "handle_parsing_errors": True,
            }
        )
        
        # Store session
        session_id = f"{user_id}_{datetime.utcnow().timestamp()}"
        # TODO: Save to database or cache
        
        return session_id
    
    async def chat(self, session_id: str, message: str) -> dict:
        """Send message to agent and get response with tool calls."""
        # Retrieve session context
        # Execute agent with tool registry
        # Return response with intermediate steps
        pass
```

### Task 2.3: System Prompt Design
Create a comprehensive prompt that instructs the agent on behavior:

```text
# agents/prompts/system_prompt.txt

You are a specialized precious metals trading advisor for Constitutional Tender, 
a platform for buying, selling, and storing allocated gold and silver in 
international vaults.

## Your Role
- Help users manage their precious metals portfolio
- Provide real-time market prices and analysis
- Execute trades (buy/sell) with user confirmation
- Transfer holdings between vaults (teleport)
- Explain spreads, fees, and risks

## Available Tools
1. **get_market_prices_tool**: Fetch current bid/ask prices for all metals
2. **get_portfolio_tool**: View user's holdings across all vaults
3. **execute_buy_tool**: Purchase precious metals
4. **execute_sell_tool**: Sell precious metals
5. **execute_teleport_tool**: Transfer between vaults

## Trading Rules
1. **Always** show prices before executing trades
2. **Always** explain bid/ask spread
3. **Always** confirm large transactions (>$10,000)
4. **Never** execute trades without user approval
5. **Always** provide transaction receipt with ID

## Price Transparency
- Ask Price: What you PAY when buying
- Bid Price: What you RECEIVE when selling
- Spread: Difference between ask and bid (our fee)

## Vault Information
- Switzerland: Oldest facility, highest security
- Singapore: Tax-advantaged jurisdiction
- Cayman Islands: Offshore privacy
- Each vault has different regulatory requirements

## Response Style
- Professional but approachable
- Explain financial concepts simply
- Use troy ounces (oz) as unit
- Show prices in user's base currency
- Include emojis: 🏆 gold, 🥈 silver, 🏦 vault, 💰 money

## Example Interactions

User: "Show my portfolio"
You: 
🏦 Your Precious Metals Portfolio:
- 10.5 oz Gold (🏆) in Switzerland: $21,000 USD
- 150 oz Silver (🥈) in Singapore: $3,750 USD
Total Value: $24,750 USD

User: "Buy 5 oz gold in Switzerland"
You:
Let me check current prices...

[calls get_market_prices_tool]

🏆 Gold Prices:
- Ask (buy): $2,050/oz
- Bid (sell): $2,030/oz
- Spread: 0.98%

Your order:
- Quantity: 5 oz
- Total Cost: $10,250 USD
- Destination: Switzerland Vault

This is a significant purchase. Shall I proceed? (yes/no)

User: "yes"
You:
[calls execute_buy_tool with parameters]

✅ Purchase Confirmed!
Transaction ID: abc123...
- Bought: 5 oz Gold
- Price: $2,050/oz
- Total: $10,250 USD
- Location: Switzerland Vault
- Status: Completed

Your gold has been allocated in your Switzerland vault. You can view 
the updated balance anytime by asking "show my portfolio".

## Error Handling
- If tool fails, explain error in plain language
- Suggest alternatives if request impossible
- Never expose technical details to user
```

---

## 📋 PHASE 3: STREAMLIT INTERFACE

### Task 3.1: Main Entry Point
```python
# streamlit_app/main.py
import streamlit as st
from agents.trading_agent import TradingAgent
import asyncio

st.set_page_config(
    page_title="Constitutional Tender Terminal",
    page_icon="🏆",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize agent
if "agent" not in st.session_state:
    st.session_state.agent = TradingAgent(
        project_id=st.secrets["gcp_project_id"]
    )

if "session_id" not in st.session_state:
    user_id = "demo_user"  # TODO: Get from auth
    st.session_state.session_id = asyncio.run(
        st.session_state.agent.create_session(user_id)
    )

if "messages" not in st.session_state:
    st.session_state.messages = []

# Header
st.title("🏆 Constitutional Tender Trading Terminal")
st.caption("AI-Powered Precious Metals Portfolio Management")

# Chat Interface
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if "tool_calls" in message:
            with st.expander("🛠️ Tool Calls"):
                st.json(message["tool_calls"])

# Chat Input
if prompt := st.chat_input("Ask about your portfolio or execute trades..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Get agent response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = asyncio.run(
                st.session_state.agent.chat(
                    st.session_state.session_id,
                    prompt
                )
            )
            st.markdown(response["content"])
            
            if response.get("tool_calls"):
                with st.expander("🛠️ Tool Calls"):
                    st.json(response["tool_calls"])
    
    # Save assistant message
    st.session_state.messages.append({
        "role": "assistant",
        "content": response["content"],
        "tool_calls": response.get("tool_calls", [])
    })

# Sidebar with quick actions
with st.sidebar:
    st.header("Quick Actions")
    if st.button("📊 View Portfolio"):
        # Auto-send message
        prompt = "Show my current portfolio"
        # Trigger chat flow
    
    if st.button("💰 Market Prices"):
        prompt = "What are the current gold and silver prices?"
    
    if st.button("🏦 Vault Info"):
        prompt = "Tell me about the available vaults"
    
    st.divider()
    st.caption("Need help? Try asking:")
    st.markdown("""
    - "Buy 5 oz gold in Switzerland"
    - "Show my silver holdings"
    - "Transfer 10 oz from Singapore to Cayman"
    - "What's the current spread?"
    """)
```

### Task 3.2: Dashboard Page
```python
# streamlit_app/pages/1_📊_Dashboard.py
import streamlit as st
import pandas as pd
import plotly.express as px
from services.trade_service import get_holdings
from services.market_service import get_live_prices

st.set_page_config(page_title="Dashboard", page_icon="📊", layout="wide")

st.title("📊 Portfolio Dashboard")

# Fetch data
user_id = "demo_user"  # TODO: From auth
holdings = asyncio.run(get_holdings(user_id))
prices = asyncio.run(get_live_prices())

# Summary Cards
col1, col2, col3 = st.columns(3)

with col1:
    total_value = sum(h["value"] for h in holdings)
    st.metric(
        "Total Holdings",
        f"${total_value:,.2f}",
        delta="+5.2%",  # TODO: Calculate actual change
        delta_color="normal"
    )

with col2:
    gold_oz = sum(h["quantity"] for h in holdings if h["metal_type"] == "GOLD")
    st.metric(
        "Gold Position",
        f"{gold_oz:.2f} oz",
        delta=f"${gold_oz * 2050:,.0f}"
    )

with col3:
    silver_oz = sum(h["quantity"] for h in holdings if h["metal_type"] == "SILVER")
    st.metric(
        "Silver Position",
        f"{silver_oz:.2f} oz",
        delta=f"${silver_oz * 25:,.0f}"
    )

# Holdings Table
st.subheader("Holdings by Vault")
df = pd.DataFrame(holdings)
st.dataframe(
    df,
    column_config={
        "quantity": st.column_config.NumberColumn("Quantity (oz)", format="%.2f"),
        "value": st.column_config.NumberColumn("Value (USD)", format="$%.2f"),
    },
    hide_index=True
)

# Vault Distribution Chart
fig = px.pie(
    df,
    values="value",
    names="vault_name",
    title="Assets by Vault",
    color_discrete_sequence=px.colors.sequential.Goldyellows
)
st.plotly_chart(fig, use_container_width=True)

# Metal Type Distribution
fig2 = px.bar(
    df.groupby("metal_type")["value"].sum().reset_index(),
    x="metal_type",
    y="value",
    title="Holdings by Metal Type",
    color="metal_type",
    color_discrete_map={"GOLD": "#FFD700", "SILVER": "#C0C0C0"}
)
st.plotly_chart(fig2, use_container_width=True)
```

### Task 3.3: Trading Page
```python
# streamlit_app/pages/2_💰_Trading.py
import streamlit as st
from services.market_service import get_live_prices, get_asset_price
from agents.tools.buy_tool import execute_buy_tool, BuyToolInput
from agents.tools.sell_tool import execute_sell_tool, SellToolInput

st.set_page_config(page_title="Trading", page_icon="💰", layout="wide")

st.title("💰 Buy & Sell Precious Metals")

# Fetch current prices
prices = asyncio.run(get_live_prices())

# Live Price Ticker
st.subheader("Live Prices")
cols = st.columns(len(prices))
for i, asset in enumerate(prices):
    with cols[i]:
        st.metric(
            f"{asset['metal_type']} {asset['symbol']}",
            f"${asset['live_price_ask']:.2f}/oz",
            delta=f"Spread: {asset['spread_percent']}%",
            delta_color="off"
        )

st.divider()

# Trading Interface
tab1, tab2 = st.tabs(["🟢 Buy", "🔴 Sell"])

with tab1:
    st.subheader("Buy Precious Metals")
    
    col1, col2 = st.columns(2)
    
    with col1:
        asset = st.selectbox(
            "Select Asset",
            options=prices,
            format_func=lambda x: f"{x['name']} ({x['weight_oz']} oz)",
            key="buy_asset"
        )
        
        quantity = st.number_input(
            "Quantity (troy oz)",
            min_value=0.1,
            max_value=1000.0,
            value=1.0,
            step=0.1,
            key="buy_quantity"
        )
    
    with col2:
        vaults = ["Switzerland", "Singapore", "Cayman Islands"]  # TODO: Fetch from DB
        vault = st.selectbox("Destination Vault", vaults, key="buy_vault")
        
        currency = st.selectbox(
            "Currency",
            ["USD", "EUR", "CHF", "SGD", "KYD", "GBP"],
            key="buy_currency"
        )
    
    # Price Calculation
    if asset:
        total_cost = quantity * asset["live_price_ask"]
        st.info(f"""
        **Order Summary:**
        - Asset: {asset['name']}
        - Quantity: {quantity} oz
        - Price per oz: ${asset['live_price_ask']:.2f} (Ask)
        - **Total Cost: ${total_cost:,.2f} {currency}**
        - Spread: {asset['spread_percent']}%
        """)
    
    if st.button("Execute Buy Order", type="primary", key="btn_buy"):
        with st.spinner("Executing trade..."):
            result = asyncio.run(execute_buy_tool(BuyToolInput(
                user_id="demo_user",
                asset_id=asset["id"],
                vault_id=vault,  # TODO: Map name to ID
                quantity=quantity,
                currency=currency
            )))
            
            if result["status"] == "success":
                st.success(f"""
                ✅ Purchase Successful!
                - Transaction ID: {result['transaction_id']}
                - Quantity: {result['quantity']} oz
                - Total: ${result['total_amount']:.2f}
                """)
            else:
                st.error(f"❌ Trade Failed: {result['error']}")

with tab2:
    st.subheader("Sell Precious Metals")
    # Similar structure to Buy tab but using sell_tool
    st.info("Sell interface - implement similar to Buy tab")
```

---

## 📋 PHASE 4: INTEGRATION & TESTING

### Task 4.1: Database Initialization
```bash
# Create Alembic migration
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head

# Seed database with sample data
python scripts/seed_database.py
```

### Task 4.2: Environment Setup
```bash
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/constitutional_tender
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
VERTEX_AI_ENDPOINT=https://us-central1-aiplatform.googleapis.com
MARKET_DATA_API_KEY=your-api-key
LOG_LEVEL=INFO
```

### Task 4.3: Testing Strategy
```python
# tests/test_trade_service.py
import pytest
from services.trade_service import execute_buy, execute_sell

@pytest.mark.asyncio
async def test_execute_buy():
    """Test buying precious metals updates holdings correctly."""
    # Arrange
    user_id = "test-user-123"
    asset_id = "gold-1oz"
    vault_id = "switzerland"
    quantity = 5.0
    
    # Act
    transaction = await execute_buy(user_id, asset_id, vault_id, quantity, "USD")
    
    # Assert
    assert transaction.type == "BUY"
    assert transaction.quantity == 5.0
    assert transaction.status == "COMPLETED"
    
    # Verify holding increased
    holdings = await get_holdings(user_id)
    assert any(h.vault_id == vault_id and h.quantity >= 5.0 for h in holdings)

@pytest.mark.asyncio
async def test_execute_sell_insufficient_balance():
    """Test selling more than owned fails gracefully."""
    # Arrange
    user_id = "test-user-123"
    asset_id = "gold-1oz"
    vault_id = "switzerland"
    quantity = 1000.0  # More than owned
    
    # Act & Assert
    with pytest.raises(ValueError, match="Insufficient balance"):
        await execute_sell(user_id, asset_id, vault_id, quantity, "USD")
```

---

## ✅ TECHNICAL REQUIREMENTS

### Code Quality
1. **Type Hints:** Use everywhere (`from typing import ...`)
2. **Docstrings:** Google style for all functions
3. **Logging:** Use `structlog` for structured logging
4. **Error Handling:** Never use bare `except:`
5. **Formatting:** Use `black` and `isort`
6. **Linting:** Pass `pylint` and `mypy`

### Performance
1. Use connection pooling for database (SQLAlchemy `create_async_engine`)
2. Cache market data (Redis or in-memory with TTL)
3. Async/await for all I/O operations
4. Batch database operations where possible

### Security
1. Validate all inputs with Pydantic
2. Use parameterized queries (SQLAlchemy ORM)
3. Store secrets in environment variables
4. Implement rate limiting for API calls
5. Add authentication middleware (TODO in phase 2)

---

## 📦 DELIVERABLES CHECKLIST

- [ ] All SQLAlchemy models in `models/database/`
- [ ] All service functions in `services/`
- [ ] All Vertex AI tools in `agents/tools/`
- [ ] Agent configuration in `agents/trading_agent.py`
- [ ] System prompt in `agents/prompts/system_prompt.txt`
- [ ] Streamlit main app in `streamlit_app/main.py`
- [ ] Dashboard page in `streamlit_app/pages/1_📊_Dashboard.py`
- [ ] Trading page in `streamlit_app/pages/2_💰_Trading.py`
- [ ] Alembic migrations in `alembic/versions/`
- [ ] Test suite in `tests/` (>80% coverage)
- [ ] `requirements.txt` with all dependencies
- [ ] `README.md` with setup instructions
- [ ] `.env.example` with required variables

---

## 🚀 EXECUTION ORDER

1. **Start Here:** Database models (foundational)
2. **Then:** Services (business logic)
3. **Then:** Tools (AI agent integration)
4. **Then:** Streamlit UI (user interface)
5. **Finally:** Tests and documentation

**Estimated Time:** 16-20 hours for complete migration

---

## 💡 IMPORTANT NOTES

### What Makes This Easy
- Simple business logic (CRUD only)
- No complex algorithms
- Standard web app patterns
- Well-defined database schema

### What to Watch Out For
- Async/await context switching
- SQLAlchemy transaction management
- Vertex AI tool schema formatting
- Streamlit session state management

### When to Ask for Help
- Vertex AI authentication issues
- Database migration conflicts
- Tool execution errors
- Streamlit performance problems

---

## 🎯 SUCCESS CRITERIA

Migration is successful when:
1. User can view portfolio in Streamlit dashboard
2. User can chat with AI agent in natural language
3. Agent can execute buy/sell/teleport trades via tools
4. All database operations commit successfully
5. Tests pass with >80% coverage
6. No TypeScript code remains

**Good luck! This is a straightforward migration that should take 2-3 days.**
