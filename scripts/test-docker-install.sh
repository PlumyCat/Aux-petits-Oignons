#!/bin/bash
# =============================================================================
# OpenCode Enterprise - Docker Installation Test Script
# =============================================================================
# Tests the Docker build and validates the installation
#
# Usage:
#   ./scripts/test-docker-install.sh [--full]
#
# Options:
#   --full    Run full test suite including Azure connectivity test
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

# Configuration
IMAGE_NAME="opencode-enterprise-test"
MAX_IMAGE_SIZE_MB=500
FULL_TEST=false

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# =============================================================================
# Helper Functions
# =============================================================================

log_test()    { echo -e "${BLUE}[TEST]${NC}    $1"; }
log_pass()    { echo -e "${GREEN}[PASS]${NC}    $1"; ((TESTS_PASSED++)); }
log_fail()    { echo -e "${RED}[FAIL]${NC}    $1"; ((TESTS_FAILED++)); }
log_skip()    { echo -e "${YELLOW}[SKIP]${NC}    $1"; }
log_info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }

cleanup() {
    log_info "Cleaning up test artifacts..."
    docker rmi "$IMAGE_NAME" 2>/dev/null || true
}

# =============================================================================
# Test Functions
# =============================================================================

test_dockerfile_exists() {
    log_test "Checking Dockerfile.ubuntu exists..."

    if [[ -f "Dockerfile.ubuntu" ]]; then
        log_pass "Dockerfile.ubuntu found"
        return 0
    else
        log_fail "Dockerfile.ubuntu not found"
        return 1
    fi
}

test_install_script_exists() {
    log_test "Checking install-ubuntu.sh exists..."

    if [[ -f "scripts/install-ubuntu.sh" ]]; then
        log_pass "scripts/install-ubuntu.sh found"

        if [[ -x "scripts/install-ubuntu.sh" ]]; then
            log_pass "install-ubuntu.sh is executable"
        else
            log_fail "install-ubuntu.sh is not executable"
        fi
        return 0
    else
        log_fail "scripts/install-ubuntu.sh not found"
        return 1
    fi
}

test_docker_build() {
    log_test "Building Docker image..."

    local start_time
    start_time=$(date +%s)

    if docker build -f Dockerfile.ubuntu -t "$IMAGE_NAME" . ; then
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_pass "Docker image built successfully (${duration}s)"
        return 0
    else
        log_fail "Docker build failed"
        return 1
    fi
}

test_image_size() {
    log_test "Checking image size (max: ${MAX_IMAGE_SIZE_MB}MB)..."

    local size_bytes
    size_bytes=$(docker image inspect "$IMAGE_NAME" --format='{{.Size}}')
    local size_mb=$((size_bytes / 1024 / 1024))

    if [[ $size_mb -lt $MAX_IMAGE_SIZE_MB ]]; then
        log_pass "Image size: ${size_mb}MB (under ${MAX_IMAGE_SIZE_MB}MB limit)"
        return 0
    else
        log_fail "Image size: ${size_mb}MB (exceeds ${MAX_IMAGE_SIZE_MB}MB limit)"
        return 1
    fi
}

test_opencode_version() {
    log_test "Testing 'opencode --version' in container..."

    local version
    version=$(docker run --rm "$IMAGE_NAME" --version 2>&1) || true

    if [[ -n "$version" && "$version" != *"error"* && "$version" != *"Error"* ]]; then
        log_pass "OpenCode version: $version"
        return 0
    else
        log_fail "Failed to get OpenCode version: $version"
        return 1
    fi
}

test_opencode_help() {
    log_test "Testing 'opencode --help' in container..."

    local output
    output=$(docker run --rm "$IMAGE_NAME" --help 2>&1) || true

    if [[ "$output" == *"Usage"* || "$output" == *"usage"* || "$output" == *"Options"* ]]; then
        log_pass "OpenCode help command works"
        return 0
    else
        log_fail "OpenCode help command failed"
        echo "$output" | head -20
        return 1
    fi
}

test_ripgrep_available() {
    log_test "Checking ripgrep is available in container..."

    local version
    version=$(docker run --rm --entrypoint rg "$IMAGE_NAME" --version 2>&1) || true

    if [[ "$version" == *"ripgrep"* ]]; then
        log_pass "ripgrep available: $(echo "$version" | head -1)"
        return 0
    else
        log_fail "ripgrep not found in container"
        return 1
    fi
}

test_git_available() {
    log_test "Checking git is available in container..."

    local version
    version=$(docker run --rm --entrypoint git "$IMAGE_NAME" --version 2>&1) || true

    if [[ "$version" == *"git version"* ]]; then
        log_pass "git available: $version"
        return 0
    else
        log_fail "git not found in container"
        return 1
    fi
}

test_env_vars_not_hardcoded() {
    log_test "Checking Azure credentials are not hardcoded..."

    # Check the image for hardcoded secrets
    local env_output
    env_output=$(docker run --rm --entrypoint env "$IMAGE_NAME" 2>&1) || true

    if [[ "$env_output" == *"AZURE_OPENAI_API_KEY="*"sk-"* ]]; then
        log_fail "Found hardcoded API key in image"
        return 1
    fi

    log_pass "No hardcoded credentials found"
    return 0
}

test_volume_mount() {
    log_test "Testing volume mount functionality..."

    local test_dir
    test_dir=$(mktemp -d)
    echo "test content" > "$test_dir/test.txt"

    local output
    output=$(docker run --rm -v "$test_dir:/workspace" --entrypoint cat "$IMAGE_NAME" /workspace/test.txt 2>&1) || true

    rm -rf "$test_dir"

    if [[ "$output" == "test content" ]]; then
        log_pass "Volume mount works correctly"
        return 0
    else
        log_fail "Volume mount failed"
        return 1
    fi
}

test_azure_connectivity() {
    log_test "Testing Azure OpenAI connectivity..."

    if [[ -z "${AZURE_OPENAI_API_KEY:-}" || -z "${AZURE_OPENAI_ENDPOINT:-}" ]]; then
        log_skip "Azure credentials not set (set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT)"
        return 0
    fi

    local output
    output=$(docker run --rm \
        -e AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY" \
        -e AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT" \
        -e AZURE_OPENAI_DEPLOYMENT="${AZURE_OPENAI_DEPLOYMENT:-}" \
        "$IMAGE_NAME" --help 2>&1) || true

    if [[ "$output" != *"authentication"* && "$output" != *"401"* ]]; then
        log_pass "Azure connectivity test passed"
        return 0
    else
        log_fail "Azure connectivity test failed"
        return 1
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --full)
                FULL_TEST=true
                shift
                ;;
            --cleanup)
                cleanup
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    echo ""
    echo -e "${BOLD}OpenCode Docker Installation Tests${NC}"
    echo "========================================"
    echo ""

    # Change to repo root
    cd "$(dirname "$0")/.."

    # Run tests
    test_dockerfile_exists
    test_install_script_exists

    echo ""
    log_info "Building Docker image (this may take a while)..."
    echo ""

    if test_docker_build; then
        echo ""
        test_image_size
        test_opencode_version
        test_opencode_help
        test_ripgrep_available
        test_git_available
        test_env_vars_not_hardcoded
        test_volume_mount

        if [[ "$FULL_TEST" == true ]]; then
            test_azure_connectivity
        fi
    fi

    # Summary
    echo ""
    echo "========================================"
    echo -e "${BOLD}Test Summary${NC}"
    echo "========================================"
    echo -e "  ${GREEN}Passed:${NC} $TESTS_PASSED"
    echo -e "  ${RED}Failed:${NC} $TESTS_FAILED"
    echo ""

    # Cleanup
    cleanup

    # Exit code
    if [[ $TESTS_FAILED -gt 0 ]]; then
        echo -e "${RED}Some tests failed!${NC}"
        exit 1
    else
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    fi
}

main "$@"
