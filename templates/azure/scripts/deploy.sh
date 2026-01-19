#!/bin/bash

# Azure Bicep Template Deployment Script
# Usage: ./deploy.sh <environment> <resource-group> <location>
# Example: ./deploy.sh dev rg-myapp-dev westeurope

set -e

# ========================================
# Parameters
# ========================================

ENVIRONMENT=${1}
RESOURCE_GROUP=${2}
LOCATION=${3:-westeurope}

# ========================================
# Configuration
# ========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")"
MAIN_TEMPLATE="$TEMPLATE_DIR/main.bicep"
PARAMETERS_FILE="$TEMPLATE_DIR/parameters/${ENVIRONMENT}.parameters.json"
DEPLOYMENT_NAME="deployment-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

show_usage() {
    echo "Usage: $0 <environment> <resource-group> <location>"
    echo ""
    echo "Arguments:"
    echo "  environment     Environment name (dev, staging, prod)"
    echo "  resource-group  Azure resource group name"
    echo "  location        Azure region (default: westeurope)"
    echo ""
    echo "Example:"
    echo "  $0 dev rg-myapp-dev westeurope"
    exit 1
}

validate_arguments() {
    if [ -z "$ENVIRONMENT" ] || [ -z "$RESOURCE_GROUP" ]; then
        log_error "Missing required arguments"
        show_usage
    fi
    
    # Validate environment
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        log_error "Invalid environment. Must be: dev, staging, or prod"
        exit 1
    fi
}

validate_prerequisites() {
    log_step "Validating prerequisites..."
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check Azure CLI version
    local az_version=$(az version --output json | grep -o '"azure-cli": "[^"]*"' | cut -d'"' -f4)
    log_info "Azure CLI version: $az_version"
    
    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    
    local subscription_name=$(az account show --query name -o tsv)
    local subscription_id=$(az account show --query id -o tsv)
    log_info "Using subscription: $subscription_name ($subscription_id)"
    
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

create_resource_group() {
    log_step "Checking resource group..."
    
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        log_info "Resource group '$RESOURCE_GROUP' already exists"
    else
        log_info "Creating resource group '$RESOURCE_GROUP' in location '$LOCATION'"
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --tags Environment="$ENVIRONMENT" ManagedBy="Bicep" CreatedAt="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        log_info "Resource group created successfully"
    fi
}

run_validation() {
    log_step "Running deployment validation..."
    
    if az deployment group validate \
        --resource-group "$RESOURCE_GROUP" \
        --template-file "$MAIN_TEMPLATE" \
        --parameters "@$PARAMETERS_FILE" \
        --verbose; then
        log_info "Validation passed"
    else
        log_error "Validation failed. Please check the template and parameters."
        exit 1
    fi
}

deploy_infrastructure() {
    log_step "Deploying infrastructure..."
    
    log_info "Deployment name: $DEPLOYMENT_NAME"
    
    if az deployment group create \
        --name "$DEPLOYMENT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --template-file "$MAIN_TEMPLATE" \
        --parameters "@$PARAMETERS_FILE" \
        --verbose; then
        log_info "Deployment completed successfully"
    else
        log_error "Deployment failed"
        exit 1
    fi
}

show_deployment_outputs() {
    log_step "Retrieving deployment outputs..."
    
    local outputs=$(az deployment group show \
        --name "$DEPLOYMENT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query properties.outputs \
        --output json)
    
    if [ -n "$outputs" ] && [ "$outputs" != "{}" ]; then
        echo -e "\n${BLUE}========================================${NC}"
        echo -e "${BLUE}Deployment Outputs${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo "$outputs" | jq -r 'to_entries[] | "\(.key): \(.value.value)"'
        echo -e "${BLUE}========================================${NC}\n"
    fi
}

show_deployed_resources() {
    log_step "Listing deployed resources..."
    
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}Deployed Resources${NC}"
    echo -e "${BLUE}========================================${NC}"
    az resource list \
        --resource-group "$RESOURCE_GROUP" \
        --output table
    echo -e "${BLUE}========================================${NC}\n"
}

confirm_deployment() {
    log_warn "You are about to deploy to environment: $ENVIRONMENT"
    log_warn "Resource group: $RESOURCE_GROUP"
    log_warn "Location: $LOCATION"
    echo
    
    read -p "Do you want to continue? (yes/no): " confirmation
    
    if [[ ! "$confirmation" =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Deployment cancelled by user"
        exit 0
    fi
}

# ========================================
# Main Execution
# ========================================

main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Azure Infrastructure Deployment${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "Environment:     ${GREEN}$ENVIRONMENT${NC}"
    echo -e "Resource Group:  ${GREEN}$RESOURCE_GROUP${NC}"
    echo -e "Location:        ${GREEN}$LOCATION${NC}"
    echo -e "Template:        ${GREEN}$MAIN_TEMPLATE${NC}"
    echo -e "Parameters:      ${GREEN}$PARAMETERS_FILE${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    validate_arguments
    validate_prerequisites
    echo
    
    # Production warning
    if [ "$ENVIRONMENT" == "prod" ]; then
        log_warn "⚠️  WARNING: You are deploying to PRODUCTION!"
        confirm_deployment
    fi
    
    create_resource_group
    echo
    
    run_validation
    echo
    
    deploy_infrastructure
    echo
    
    show_deployment_outputs
    show_deployed_resources
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "Deployment name: ${BLUE}$DEPLOYMENT_NAME${NC}"
    echo -e "Resource group:  ${BLUE}$RESOURCE_GROUP${NC}"
    echo -e "${GREEN}========================================${NC}\n"
}

main
