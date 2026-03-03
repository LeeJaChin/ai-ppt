FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm install --registry=https://registry.npmmirror.com

# 复制应用代码
COPY . .

# 构建生产版本
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
