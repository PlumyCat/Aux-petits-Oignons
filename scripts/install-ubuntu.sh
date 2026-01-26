#!/bin/bash
# =============================================================================
# OpenCode Enterprise - Installation Script for Ubuntu
# =============================================================================
# This script installs OpenCode "Aux petits Oignons" enterprise version
# on Ubuntu containers (22.04 LTS or 24.04 LTS)
#
# Usage:
#   curl -fsSL https://your-repo/install-ubuntu.sh | bash
#   or
#   ./install-ubuntu.sh [--local]
#
# Options:
#   --local     Build from local sources instead of cloning from git
#   --help      Show this help message
#
# Environment variables:
#   OPENCODE_INSTALL_DIR    Installation directory (default: /opt/opencode)
#   OPENCODE_REPO_URL       Git repository URL (default: current repo)
#   OPENCODE_BRANCH         Git branch to use (default: dev)
# =============================================================================

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

OPENCODE_INSTALL_DIR="${OPENCODE_INSTALL_DIR:-/opt/opencode}"
OPENCODE_REPO_URL="${OPENCODE_REPO_URL:-https://github.com/anomalyco/opencode.git}"
OPENCODE_BRANCH="${OPENCODE_BRANCH:-dev}"
# IMPORTANT: Must match the version in package.json "packageManager" field
BUN_REQUIRED_VERSION="1.3.5"
LOCAL_MODE=false

# =============================================================================
# Colors and Logging
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

log_info()    { echo -e "${GREEN}[INFO]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $1"; }
log_step()    { echo -e "${BLUE}[STEP]${NC}    ${BOLD}$1${NC}"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# =============================================================================
# Helper Functions
# =============================================================================

show_banner() {
    echo -e "${CYAN}"
    echo "  ___                    ____          _      "
    echo " / _ \ _ __   ___ _ __  / ___|___   __| | ___ "
    echo "| | | | '_ \ / _ \ '_ \| |   / _ \ / _\` |/ _ \\"
    echo "| |_| | |_) |  __/ | | | |__| (_) | (_| |  __/"
    echo " \___/| .__/ \___|_| |_|\____\___/ \__,_|\___|"
    echo "      |_|                                     "
    echo -e "${NC}"
    echo -e "${BOLD}Enterprise Edition - \"Aux petits Oignons\"${NC}"
    echo ""
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --local     Build from local sources (run from repo root)"
    echo "  --help      Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  OPENCODE_INSTALL_DIR    Installation directory (default: /opt/opencode)"
    echo "  OPENCODE_REPO_URL       Git repository URL"
    echo "  OPENCODE_BRANCH         Git branch to use (default: dev)"
    echo ""
    echo "Examples:"
    echo "  # Install from git"
    echo "  ./install-ubuntu.sh"
    echo ""
    echo "  # Install from local sources"
    echo "  cd /path/to/opencode && ./scripts/install-ubuntu.sh --local"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

check_os() {
    if [[ ! -f /etc/os-release ]]; then
        log_error "Cannot detect OS. /etc/os-release not found."
        exit 1
    fi

    source /etc/os-release

    if [[ "$ID" != "ubuntu" ]]; then
        log_error "This script is designed for Ubuntu only (detected: $ID)"
        exit 1
    fi

    # Check version (22.04 or 24.04)
    case "$VERSION_ID" in
        22.04|24.04)
            log_info "Detected Ubuntu $VERSION_ID LTS"
            ;;
        *)
            log_warn "Ubuntu $VERSION_ID detected. Recommended: 22.04 or 24.04 LTS"
            ;;
    esac
}

detect_architecture() {
    local arch
    arch=$(uname -m)

    case "$arch" in
        x86_64|amd64)
            OPENCODE_ARCH="x64"
            log_info "Architecture: x86_64 (amd64)"
            ;;
        aarch64|arm64)
            OPENCODE_ARCH="arm64"
            log_info "Architecture: aarch64 (arm64)"
            ;;
        *)
            log_error "Unsupported architecture: $arch"
            log_error "Supported: x86_64, aarch64"
            exit 1
            ;;
    esac
}

install_system_dependencies() {
    log_step "Installing system dependencies..."

    apt-get update -qq

    local packages=(
        curl
        git
        ripgrep
        build-essential
        unzip
        ca-certificates
    )

    apt-get install -y "${packages[@]}"

    log_success "System dependencies installed"
}

install_bun() {
    log_step "Installing Bun v${BUN_REQUIRED_VERSION}..."

    # Check if Bun is already installed with the correct version
    if command -v bun &> /dev/null; then
        local current_version
        current_version=$(bun --version)
        log_info "Bun already installed: v$current_version"

        # Check if exact version matches (required by opencode build script)
        if [[ "$current_version" == "$BUN_REQUIRED_VERSION" ]]; then
            log_success "Bun version matches required version ($BUN_REQUIRED_VERSION)"
            return 0
        else
            log_warn "Bun version mismatch: v$current_version != v$BUN_REQUIRED_VERSION"
            log_info "Installing correct version..."
        fi
    fi

    # Install specific Bun version (required by opencode build script)
    curl -fsSL https://bun.sh/install | bash -s "bun-v${BUN_REQUIRED_VERSION}"

    # Source Bun environment
    export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
    export PATH="$BUN_INSTALL/bin:$PATH"

    # Also add to profile for future sessions
    if [[ -f "$HOME/.bashrc" ]]; then
        if ! grep -q "BUN_INSTALL" "$HOME/.bashrc"; then
            echo '' >> "$HOME/.bashrc"
            echo '# Bun' >> "$HOME/.bashrc"
            echo 'export BUN_INSTALL="$HOME/.bun"' >> "$HOME/.bashrc"
            echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> "$HOME/.bashrc"
        fi
    fi

    # Verify installation
    if ! command -v bun &> /dev/null; then
        log_error "Bun installation failed"
        exit 1
    fi

    local version
    version=$(bun --version)
    log_success "Bun installed: v$version"
}

clone_or_update_repo() {
    log_step "Setting up source code..."

    if [[ "$LOCAL_MODE" == true ]]; then
        log_info "Using local sources"

        # Find the repo root (look for package.json with opencode)
        local script_dir
        script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        local repo_root
        repo_root="$(cd "$script_dir/.." && pwd)"

        if [[ ! -f "$repo_root/package.json" ]]; then
            log_error "Cannot find package.json. Run from repo root or use git clone mode."
            exit 1
        fi

        OPENCODE_INSTALL_DIR="$repo_root"
        log_info "Using local repo: $OPENCODE_INSTALL_DIR"
        return 0
    fi

    if [[ -d "$OPENCODE_INSTALL_DIR/.git" ]]; then
        log_info "Repository exists, updating..."
        cd "$OPENCODE_INSTALL_DIR"
        git fetch origin
        git checkout "$OPENCODE_BRANCH"
        git pull origin "$OPENCODE_BRANCH"
    else
        log_info "Cloning repository..."

        # Create parent directory if needed
        mkdir -p "$(dirname "$OPENCODE_INSTALL_DIR")"

        git clone --branch "$OPENCODE_BRANCH" "$OPENCODE_REPO_URL" "$OPENCODE_INSTALL_DIR"
        cd "$OPENCODE_INSTALL_DIR"
    fi

    log_success "Source code ready at $OPENCODE_INSTALL_DIR"
}

build_opencode() {
    log_step "Building OpenCode..."

    cd "$OPENCODE_INSTALL_DIR"

    # Install dependencies
    log_info "Installing npm dependencies..."
    bun install

    # Build the project
    log_info "Compiling OpenCode..."
    cd packages/opencode
    bun run build

    log_success "Build completed"
}

install_binary() {
    log_step "Installing OpenCode binary..."

    local binary_path="$OPENCODE_INSTALL_DIR/packages/opencode/dist/opencode-linux-${OPENCODE_ARCH}/bin/opencode"

    if [[ ! -f "$binary_path" ]]; then
        # Try baseline version for x64
        if [[ "$OPENCODE_ARCH" == "x64" ]]; then
            binary_path="$OPENCODE_INSTALL_DIR/packages/opencode/dist/opencode-linux-x64-baseline/bin/opencode"
        fi
    fi

    if [[ ! -f "$binary_path" ]]; then
        log_error "Binary not found at: $binary_path"
        log_error "Available builds:"
        ls -la "$OPENCODE_INSTALL_DIR/packages/opencode/dist/" 2>/dev/null || echo "No dist directory found"
        exit 1
    fi

    # Create symlink
    ln -sf "$binary_path" /usr/local/bin/opencode

    # Make executable
    chmod +x /usr/local/bin/opencode
    chmod +x "$binary_path"

    log_success "Binary installed to /usr/local/bin/opencode"
}

verify_installation() {
    log_step "Verifying installation..."

    if ! command -v opencode &> /dev/null; then
        log_error "OpenCode not found in PATH"
        exit 1
    fi

    local version
    version=$(opencode --version 2>/dev/null || echo "unknown")

    if [[ "$version" == "unknown" ]]; then
        log_error "Failed to get OpenCode version"
        exit 1
    fi

    log_success "OpenCode installed successfully: $version"
}

show_post_install() {
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}  Installation Complete!${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo "OpenCode has been installed successfully."
    echo ""
    echo -e "${BOLD}Next steps:${NC}"
    echo ""
    echo "1. Configure Azure OpenAI credentials:"
    echo ""
    echo "   export AZURE_OPENAI_API_KEY='your-api-key'"
    echo "   export AZURE_OPENAI_ENDPOINT='https://your-resource.openai.azure.com'"
    echo "   export AZURE_OPENAI_DEPLOYMENT='your-deployment-name'"
    echo ""
    echo "2. (Optional) Add to your ~/.bashrc or ~/.profile:"
    echo ""
    echo "   echo 'export AZURE_OPENAI_API_KEY=\"...\"' >> ~/.bashrc"
    echo "   echo 'export AZURE_OPENAI_ENDPOINT=\"...\"' >> ~/.bashrc"
    echo ""
    echo "3. Start using OpenCode:"
    echo ""
    echo "   opencode --help"
    echo ""
    echo -e "${CYAN}For more information, visit the documentation.${NC}"
    echo ""
}

# =============================================================================
# Main
# =============================================================================

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --local)
                LOCAL_MODE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    show_banner

    log_info "Starting OpenCode installation..."
    echo ""

    # Pre-flight checks
    check_root
    check_os
    detect_architecture

    echo ""

    # Installation steps
    install_system_dependencies
    install_bun
    clone_or_update_repo
    build_opencode
    install_binary
    verify_installation

    # Done
    show_post_install
}

# Run main function
main "$@"
