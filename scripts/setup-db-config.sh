#!/bin/bash

# PostgreSQL 資料庫配置設定腳本
# 用於快速設定資料庫連線

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        🔧 PostgreSQL 資料庫配置設定                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 檢查 .env 文件是否存在
if [ -f .env ]; then
    echo "⚠️  .env 文件已存在"
    read -p "是否要覆蓋現有配置？(y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 已取消"
        exit 1
    fi
fi

echo "請輸入 PostgreSQL 資料庫配置："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 讀取配置
read -p "資料庫主機 (預設: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "資料庫連接埠 (預設: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "資料庫名稱 (預設: postgres): " DB_NAME
DB_NAME=${DB_NAME:-postgres}

read -p "資料庫使用者 (預設: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "資料庫密碼 (預設: 1234): " DB_PASSWORD
echo ""
DB_PASSWORD=${DB_PASSWORD:-1234}

echo ""
echo "📋 配置摘要："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "主機: $DB_HOST"
echo "連接埠: $DB_PORT"
echo "資料庫: $DB_NAME"
echo "使用者: $DB_USER"
echo "密碼: ****"
echo ""

# 測試連線
echo "🔍 測試資料庫連線..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ 資料庫連線成功！"
    echo ""
    
    # 建立 .env 文件
    cat > .env << EOF
# 環境變數配置
# 自動生成於 $(date)

# 伺服器配置
NODE_ENV=development
PORT=5010

# 前端 URL（用於 CORS）
CLIENT_URL=http://localhost:5030

# PostgreSQL 資料庫配置
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# 資料庫連線池配置
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# 資料庫 SSL 配置（生產環境建議開啟）
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true

# 其他配置
LOG_LEVEL=info
EOF

    echo "✅ .env 文件已建立！"
    echo ""
    echo "🚀 下一步："
    echo "   1. 重新啟動伺服器：npm run dev"
    echo "   2. 檢查資料庫初始化是否成功"
    echo ""
    
else
    echo "❌ 資料庫連線失敗！"
    echo ""
    echo "請檢查："
    echo "  1. PostgreSQL 是否正在運行"
    echo "  2. 主機、連接埠、使用者名稱是否正確"
    echo "  3. 密碼是否正確"
    echo ""
    echo "macOS 使用者可以執行："
    echo "  brew services list | grep postgresql"
    echo "  brew services start postgresql@14"
    echo ""
    exit 1
fi
