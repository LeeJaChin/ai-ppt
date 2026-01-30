@echo off
REM AI-PPT Architect 启动脚本 (Windows)
chcp 65001 >nul

echo ================================================
echo   AI-PPT Architect - 启动脚本
echo ================================================
echo.

REM 检查是否在项目根目录
if not exist "backend" (
    echo 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "frontend" (
    echo 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 检查 Python 版本
echo 🔍 检查 Python 环境...
python --version 2>nul
if errorlevel 1 (
    echo ❌ 未找到 Python，请安装 Python 3.8+
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo 📌 当前 Python 版本: %PYTHON_VERSION%

REM 检查 Node.js 版本
echo 🔍 检查 Node.js 环境...
node --version 2>nul
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请安装 Node.js 18+
    pause
    exit /b 1
)

for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo 📌 当前 Node.js 版本: %NODE_VERSION%
echo.

REM 后端设置
echo.
echo ================================================
echo 📦 配置后端环境
echo ================================================
cd backend

if not exist "venv" (
    echo ⚙️  创建 Python 虚拟环境...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ 虚拟环境创建失败，请检查 Python 安装
        pause
        exit /b 1
    )
)

echo ✅ 激活虚拟环境...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ 虚拟环境激活失败
    pause
    exit /b 1
)

echo 📥 安装后端依赖（使用清华镜像）...
python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --upgrade pip -q
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

REM 检查 .env 文件
if not exist ".env" (
    echo 警告：未找到 .env 文件，正在从模板创建...
    copy .env.example .env
    echo 请编辑 backend\.env 文件，添加您的 API Keys
)

REM 创建输出目录
if not exist "output" mkdir output

echo ✅ 后端环境准备完成
echo.

REM 前端设置
echo.
echo ================================================
echo 📦 配置前端环境
echo ================================================
cd ..\frontend

if not exist "node_modules" (
    echo 📥 安装前端依赖（使用淘宝镜像，这可能需要几分钟）...
    call npm install --registry=https://registry.npmmirror.com
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)

echo ✅ 前端环境准备完成
echo.

REM 启动服务
echo.
echo ================================================
echo 🚀 启动服务
echo ================================================
echo.

echo ▶️  启动后端服务 (端口 8000)...
cd ..\backend
start "🔵 AI-PPT Backend" cmd /k "venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM 等待后端启动
echo ⏳ 等待后端初始化...
timeout /t 5 /nobreak >nul

echo ▶️  启动前端服务 (端口 3000)...
cd ..\frontend
start "🟢 AI-PPT Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo   ✅ 服务启动成功！
echo ================================================
echo.
echo 📍 前端地址: http://localhost:3000
echo 📍 后端地址: http://localhost:8000
echo 📍 API 文档: http://localhost:8000/docs
echo.
echo 📝 日志: 查看弹出的两个命令行窗口
echo.
echo ⚠️  提示: 请确保已在 backend\.env 中配置 API Keys
echo.
echo 🔴 关闭命令行窗口即可停止服务
echo.

pause
