#!/bin/bash

# Azure Bicep Template Validation Script
# Usage: ./validate.sh <environment> <resource-group> <location>
# Example: ./validate.sh dev rg-myapp-dev westeurope

set -e

# ========================================
# Parameters
# ========================================

ENVIRONMENT=${1:-dev}
RESOURCE_GROUP=${2}
LOCATION=${3:-westeurope}

# ========================================
# Configuration
# ========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")"
MAIN_TEMPLATE="$TEMPLATE_DIR/main.bicep"
PARAMETERS_FILE="$TEMPLATE_DIR/parameters/${ENVIRONMENT}.parameters.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================================
# Functions
# ========================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

validate_prerequisites() {
    log_info "Validating prerequisites..."
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    
    # Check if template file exists
    if [ ! -f "$MAIN_TEMPLATE" ]; then
        log_error "Main template not found: $MAIN_TEMPLATE"
        exit 1
    fi
    
    # Check if parameters file exists
    if [ ! -f "$PARAMETERS_FILE" ]; then
        log_error "Parameters file not found: $PARAMETERS_FILE"
        exit 1
    fi
    
    log_info "Prerequisites validated successfully"
}

validate_bicep_syntax() {
    log_info "Validating Bicep syntax..."
    
    # Build the main template
    if az bicep build --file "$MAIN_TEMPLATE" 2>&1 | grep -q "Error"; then
        log_error "Bicep syntax validation failed"
        return 1
    fi
    
    log_info "Bicep syntax validation passed"
}

validate_modules() {
    log_info "Validating individual modules..."
    
    local modules_dir="$TEMPLATE_DIR/modules"
    local all_valid=true
    
    for module in "$modules_dir"/*.bicep; do
        local module_name=$(basename "$module")
        log_info "Validating module: $module_name"
        
        if ! az bicep build --file "$module" 2>&1 | grep -q "Error"; then
            log_info "✓ Module $module_name is valid"
        else
            log_error "✗ Module $module_name has syntax errors"
            all_valid=false
        fi
    done
    
    if [ "$all_valid" = false ]; then
        log_error "Some modules have validation errors"
        return 1
    fi
    
    log_info "All modules validated successfully"
}

validate_deployment() {
    log_info "Validating deployment against Azure..."
    
    if [ -z "$RESOURCE_GROUP" ]; then
        log_warn "No resource group specified, skipping deployment validation"
        log_warn "To validate against Azure, provide: ./validate.sh $ENVIRONMENT <resource-group> <location>"
        return 0
    fi
    
    # Check if resource group exists
    if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        log_warn "Resource group '$RESOURCE_GROUP' does not exist"
        log_info "Creating resource group in location: $LOCATION"
        az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags Environment="$ENVIRONMENT" ManagedBy="Bicep"
    fi
    
    # Validate deployment
    log_info "Running deployment validation..."
    if az deployment group validate \
        --resource-group "$RESOURCE_GROUP" \
        --template-file "$MAIN_TEMPLATE" \
        --parameters "@$PARAMETERS_FILE" \
        --verbose; then
        log_info "Deployment validation passed"
    else
        log_error "Deployment validation failed"
        return 1
    fi
}

what_if_analysis() {
    if [ -z "$RESOURCE_GROUP" ]; then
        log_info "Skipping what-if analysis (no resource group specified)"
        return 0
    fi
    
    log_info "Running what-if analysis..."
    az deployment group what-if \
        --resource-group "$RESOURCE_GROUP" \
        --template-file "$MAIN_TEMPLATE" \
        --parameters "@$PARAMETERS_FILE"
}

# ========================================
# Main Execution
# ========================================

main() {
    log_info "=========================================="
    log_info "Azure Bicep Template Validation"
    log_info "=========================================="
    log_info "Environment: $ENVIRONMENT"
    log_info "Template: $MAIN_TEMPLATE"
    log_info "Parameters: $PARAMETERS_FILE"
    if [ -n "$RESOURCE_GROUP" ]; then
        log_info "Resource Group: $RESOURCE_GROUP"
        log_info "Location: $LOCATION"
    fi
    log_info "=========================================="
    echo
    
    validate_prerequisites
    echo
    
    validate_bicep_syntax
    echo
    
    validate_modules
    echo
    
    validate_deployment
    echo
    
    what_if_analysis
    echo
    
    log_info "=========================================="
    log_info "${GREEN}Validation completed successfully!${NC}"
    log_info "=========================================="
}

main
