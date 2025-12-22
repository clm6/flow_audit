#!/bin/bash

# Career Flow Diagnostic Tool - Quick Setup Script
# This script automates local development setup

set -e  # Exit on error

echo "🚀 Career Flow Diagnostic Tool - Quick Setup"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.9 or higher.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  IMPORTANT: Please update the .env file with your actual credentials:${NC}"
    echo "   - ANTHROPIC_API_KEY (get from https://console.anthropic.com)"
    echo "   - SENDER_EMAIL and SENDER_PASSWORD (for email delivery)"
    echo ""
    read -p "Press enter when you've updated the .env file..."
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Initialize database
echo "Initializing database..."
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('✓ Database initialized')"

cd ..

# Setup Frontend
echo ""
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies (this may take a minute)..."
    npm install --silent
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Node modules already installed${NC}"
fi

cd ..

# Create start script
echo ""
echo -e "${BLUE}📝 Creating start scripts...${NC}"

# Backend start script
cat > backend/start.sh << 'EOF'
#!/bin/bash
source venv/bin/activate
python app.py
EOF
chmod +x backend/start.sh

# Frontend start script
cat > frontend/start.sh << 'EOF'
#!/bin/bash
npm start
EOF
chmod +x frontend/start.sh

# Combined start script (using tmux if available)
if command -v tmux &> /dev/null; then
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Career Flow Diagnostic Tool..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo ""
echo "Press Ctrl+B then D to detach from tmux session"
echo "Run 'tmux attach -t career-flow' to reattach"
echo ""

tmux new-session -d -s career-flow -n backend 'cd backend && source venv/bin/activate && python app.py'
tmux new-window -t career-flow -n frontend 'cd frontend && npm start'
tmux attach -t career-flow
EOF
    chmod +x start-all.sh
    echo -e "${GREEN}✓ Start scripts created${NC}"
    echo ""
    echo -e "${BLUE}💡 Tip: Run ./start-all.sh to start both backend and frontend in tmux${NC}"
else
    echo -e "${GREEN}✓ Individual start scripts created${NC}"
fi

# Print instructions
echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Verify .env configuration:"
echo -e "   cd backend && cat .env"
echo ""
echo "2. Start the backend (Terminal 1):"
echo -e "   cd backend && ./start.sh"
echo -e "   ${BLUE}Backend will run on http://localhost:5000${NC}"
echo ""
echo "3. Start the frontend (Terminal 2):"
echo -e "   cd frontend && ./start.sh"
echo -e "   ${BLUE}Frontend will run on http://localhost:3000${NC}"
echo ""

if command -v tmux &> /dev/null; then
    echo "OR use the combined start script:"
    echo -e "   ./start-all.sh"
    echo -e "   ${BLUE}Runs both services in tmux${NC}"
    echo ""
fi

echo "4. Open your browser:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "5. Test the assessment flow"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full documentation"
echo "   - DEPLOYMENT.md - Deployment guide"
echo ""
echo -e "${GREEN}Happy building! 🎉${NC}"
