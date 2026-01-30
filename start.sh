#!/bin/bash

# AI-PPT Architect 启动脚本

echo "================================================"
echo "  AI-PPT Architect - 启动脚本"
echo "================================================"
echo ""

# 检查是否在项目根目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 设置 Python 版本（使用 pyenv）
if command -v pyenv &> /dev/null; then
    echo "🔧 检测到 pyenv，设置 Python 版本为 3.10.15..."
    pyenv local 3.10.15 2>/dev/null || echo "⚠️  Python 3.10.15 未安装，使用当前版本"
fi

# 检查 Python 版本
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
echo "📌 当前 Python 版本: $PYTHON_VERSION"

# 设置 Node.js 版本（使用 nvm）
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "🔧 检测到 nvm，设置 Node.js 版本..."
    source "$HOME/.nvm/nvm.sh"
    nvm use 20 2>/dev/null || nvm use 18 2>/dev/null || echo "⚠️  Node.js 18/20 未安装，使用当前版本"
fi

# 检查 Node.js 版本
NODE_VERSION=$(node --version 2>&1)
echo "📌 当前 Node.js 版本: $NODE_VERSION"
echo ""

# 后端设置
echo "================================================"
echo "📦 配置后端环境"
echo "================================================"
cd backend

if [ ! -d "venv" ]; then
    echo "⚙️  创建 Python 虚拟环境..."
    python -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ 虚拟环境创建失败，请检查 Python 安装"
        exit 1
    fi
fi

echo "✅ 激活虚拟环境..."
source venv/bin/activate

if [ $? -ne 0 ]; then
    echo "❌ 虚拟环境激活失败"
    exit 1
fi

echo "📥 安装后端依赖（使用清华镜像）..."
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --upgrade pip -q
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告：未找到 .env 文件，正在从模板创建..."
    cp .env.example .env
    echo "⚠️  请编辑 backend/.env 文件，添加您的 API Keys"
fi

# 创建输出目录
mkdir -p output

echo "✅ 后端环境准备完成"
echo ""

# 前端设置
echo ""
echo "================================================"
echo "📦 配置前端环境"
echo "================================================"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖（使用淘宝镜像，这可能需要几分钟）..."
    npm install --registry=https://registry.npmmirror.com
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        exit 1
    fi
fi

echo "✅ 前端环境准备完成"
echo ""

# 启动服务
echo ""
echo "================================================"
echo "🚀 启动服务"
echo "================================================"
echo ""

# 启动后端
echo "▶️  启动后端服务 (端口 8000)..."
cd ../backend
source venv/bin/activate

# 确保使用 python -m uvicorn 方式启动，并监听 127.0.0.1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!

if [ $? -ne 0 ]; then
    echo "❌ 后端启动失败，请查看 backend.log"
    exit 1
fi

echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"

# 等待后端启动
echo "⏳ 等待后端初始化..."
sleep 5

# 启动前端
echo "▶️  启动前端服务 (端口 3000)..."
cd ../frontend

# 确保使用正确的 Node.js 版本
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use 20 2>/dev/null || nvm use 18 2>/dev/null
fi

# 强制 Next.js 监听 127.0.0.1
PORT=3000 HOST=127.0.0.1 npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

if [ $? -ne 0 ]; then
    echo "❌ 前端启动失败，请查看 frontend.log"
    kill $BACKEND_PID
    exit 1
fi

echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

echo ""
echo "================================================"
echo "  ✅ 服务启动成功！"
echo "================================================"
echo ""
echo "📍 前端地址: http://127.0.0.1:3000 (或 http://localhost:3000)"
echo "📍 后端地址: http://127.0.0.1:8000 (或 http://localhost:8000)"
echo "📍 API 文档: http://127.0.0.1:8000/docs"
echo ""
echo "📝 日志文件:"
echo "   - 后端: backend.log"
echo "   - 前端: frontend.log"
echo ""
echo "⚠️  提示: 请确保已在 backend/.env 中配置 API Keys"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo ''; echo '⏹️  正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服务已停止'; exit" INT TERM

wait
