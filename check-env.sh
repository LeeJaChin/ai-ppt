#!/bin/bash

# 环境检查脚本

echo "================================================"
echo "  AI-PPT Architect - 环境检查"
echo "================================================"
echo ""

# 检查 Python
echo "🔍 检查 Python..."
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    echo "✅ $PYTHON_VERSION"
    
    # 检查版本是否 >= 3.8
    PYTHON_MINOR=$(python -c 'import sys; print(sys.version_info.minor)')
    if [ "$PYTHON_MINOR" -lt 8 ]; then
        echo "⚠️  警告: Python 版本建议 >= 3.8"
    fi
else
    echo "❌ 未找到 Python"
fi

# 检查 pyenv
echo ""
echo "🔍 检查 pyenv..."
if command -v pyenv &> /dev/null; then
    echo "✅ pyenv 已安装"
    echo "   可用版本:"
    pyenv versions | head -5
else
    echo "ℹ️  pyenv 未安装（可选）"
fi

# 检查 Node.js
echo ""
echo "🔍 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo "✅ Node.js $NODE_VERSION"
    
    # 检查版本是否 >= 18
    NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo "⚠️  警告: Node.js 版本建议 >= 18"
    fi
else
    echo "❌ 未找到 Node.js"
fi

# 检查 npm
echo ""
echo "🔍 检查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version 2>&1)
    echo "✅ npm $NPM_VERSION"
else
    echo "❌ 未找到 npm"
fi

# 检查 nvm
echo ""
echo "🔍 检查 nvm..."
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "✅ nvm 已安装"
    source "$HOME/.nvm/nvm.sh"
    echo "   当前版本: $(nvm current)"
    echo "   可用版本:"
    nvm ls | head -5
else
    echo "ℹ️  nvm 未安装（可选）"
fi

# 检查后端配置
echo ""
echo "🔍 检查后端配置..."
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env 文件存在"
    
    # 检查是否配置了 API Key
    if grep -q "OPENAI_API_KEY=sk-" backend/.env || \
       grep -q "ANTHROPIC_API_KEY=sk-ant-" backend/.env || \
       grep -q "DEEPSEEK_API_KEY=" backend/.env | grep -v "your_" || \
       grep -q "GEMINI_API_KEY=" backend/.env | grep -v "your_"; then
        echo "✅ 检测到已配置的 API Key"
    else
        echo "⚠️  警告: 未检测到有效的 API Key"
    fi
else
    echo "⚠️  backend/.env 文件不存在"
    echo "   请复制 backend/.env.example 并配置"
fi

# 检查虚拟环境
echo ""
echo "🔍 检查 Python 虚拟环境..."
if [ -d "backend/venv" ]; then
    echo "✅ Python 虚拟环境已创建"
else
    echo "ℹ️  Python 虚拟环境未创建（首次运行时会自动创建）"
fi

# 检查 node_modules
echo ""
echo "🔍 检查前端依赖..."
if [ -d "frontend/node_modules" ]; then
    echo "✅ 前端依赖已安装"
else
    echo "ℹ️  前端依赖未安装（首次运行时会自动安装）"
fi

# 总结
echo ""
echo "================================================"
echo "  环境检查完成"
echo "================================================"
echo ""
echo "📝 建议:"
echo "1. 确保 Python >= 3.8 和 Node.js >= 18"
echo "2. 配置 backend/.env 文件中的 API Keys"
echo "3. 运行 ./start.sh 启动应用"
echo ""
