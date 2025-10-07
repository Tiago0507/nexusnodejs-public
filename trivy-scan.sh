#!/bin/bash

# Script para ejecutar Trivy localmente
# Uso: ./trivy-scan.sh [fs|config|all]

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar si Trivy está instalado
if ! command -v trivy &> /dev/null; then
    print_error "Trivy no está instalado"
    print_info "Instalando Trivy..."
    
    # Detectar sistema operativo e instalar
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install wget apt-transport-https gnupg lsb-release -y
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update
        sudo apt-get install trivy -y
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install trivy
    else
        print_error "Sistema operativo no soportado. Instala Trivy manualmente: https://aquasecurity.github.io/trivy/"
        exit 1
    fi
    
    print_success "Trivy instalado correctamente"
fi

# Función para escanear filesystem
scan_filesystem() {
    print_info "Escaneando código fuente con Trivy..."
    trivy fs --severity CRITICAL,HIGH,MEDIUM --format table .
    print_success "Escaneo de filesystem completado"
}

# Función para escanear configuración
scan_config() {
    print_info "Escaneando archivos de configuración con Trivy..."
    trivy config --severity CRITICAL,HIGH --format table .
    print_success "Escaneo de configuración completado"
}

# Función para generar reporte JSON
generate_report() {
    print_info "Generando reporte JSON..."
    trivy fs --severity CRITICAL,HIGH,MEDIUM --format json --output trivy-report.json .
    print_success "Reporte generado: trivy-report.json"
}

# Main
case "${1:-all}" in
    fs)
        scan_filesystem
        ;;
    config)
        scan_config
        ;;
    all)
        scan_filesystem
        scan_config
        generate_report
        ;;
    *)
        print_error "Opción no válida: $1"
        echo "Uso: $0 [fs|config|all]"
        echo "  fs      - Escanear código fuente"
        echo "  config  - Escanear archivos de configuración"
        echo "  all     - Ejecutar todos los escaneos (por defecto)"
        exit 1
        ;;
esac

print_success "¡Escaneo de Trivy completado!"
