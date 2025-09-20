#!/bin/bash

# GraphSQL 快速启动脚本
# 用法: ./start.sh [dev|prod|clean]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker 未运行，请先启动 Docker"
        exit 1
    fi
    log_success "Docker 运行正常"
}

# 检查端口是否被占用
check_ports() {
    local ports=(3000 5173 7474 7687)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warn "端口 $port 已被占用"
        fi
    done
}

# 开发环境启动
start_dev() {
    log_info "启动开发环境..."

    # 启动 Neo4j
    log_info "启动 Neo4j 数据库..."
    docker-compose up -d neo4j

    # 等待 Neo4j 启动
    log_info "等待 Neo4j 启动完成..."
    sleep 10

    # 检查 Neo4j 连接
    until docker exec graphsql-neo4j cypher-shell -u neo4j -p password123 "RETURN 1" > /dev/null 2>&1; do
        log_info "等待 Neo4j 启动..."
        sleep 2
    done
    log_success "Neo4j 启动成功"

    # 初始化数据
    log_info "初始化示例数据..."
    cd database
    npm install --silent
    npm run init
    cd ..

    # 启动后端
    log_info "启动后端服务..."
    cd backend
    npm install --silent
    npm run dev &
    BACKEND_PID=$!
    cd ..

    # 启动前端
    log_info "启动前端应用..."
    cd frontend
    npm install --silent
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    log_success "开发环境启动完成！"
    log_info "访问地址："
    log_info "  前端应用: http://localhost:5173"
    log_info "  后端API: http://localhost:3000"
    log_info "  Neo4j Browser: http://localhost:7474"
    log_info ""
    log_info "按 Ctrl+C 停止服务"

    # 等待用户中断
    trap 'log_info "正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit 0' INT
    wait
}

# 生产环境启动
start_prod() {
    log_info "启动生产环境..."

    check_docker

    # 构建并启动所有服务
    log_info "构建和启动服务..."
    docker-compose up -d --build

    # 等待服务启动
    log_info "等待服务启动完成..."
    sleep 15

    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_success "生产环境启动成功！"
        log_info "访问地址："
        log_info "  应用: http://localhost:5173"
        log_info "  API: http://localhost:3000"
        log_info "  Neo4j: http://localhost:7474"
    else
        log_error "服务启动失败，请检查日志："
        docker-compose logs
        exit 1
    fi
}

# 清理环境
clean_env() {
    log_info "清理开发环境..."

    # 停止 Docker 容器
    docker-compose down -v

    # 清理 node_modules
    log_info "清理依赖文件..."
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "package-lock.json" -type f -delete 2>/dev/null || true

    # 清理构建文件
    rm -rf frontend/dist 2>/dev/null || true

    log_success "环境清理完成"
}

# 显示帮助信息
show_help() {
    echo "GraphSQL 快速启动脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令："
    echo "  dev     启动开发环境（默认）"
    echo "  prod    启动生产环境"
    echo "  clean   清理环境"
    echo "  help    显示此帮助信息"
    echo ""
    echo "示例："
    echo "  $0 dev    # 启动开发环境"
    echo "  $0 prod   # 启动生产环境"
    echo "  $0 clean  # 清理环境"
}

# 主函数
main() {
    case "${1:-dev}" in
        "dev")
            check_docker
            check_ports
            start_dev
            ;;
        "prod")
            start_prod
            ;;
        "clean")
            clean_env
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"