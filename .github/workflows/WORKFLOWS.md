# GitHub Actions Workflows

**Author:** Santiago Valencia García

---

This folder contains the CI/CD workflows for the project. The workflows automate security scanning, testing, code quality analysis, and build processes.

## Overview

The CI/CD pipeline is implemented using GitHub Actions, providing automated quality assurance and security scanning for every code change. The workflows are designed to run in parallel for optimal performance.

## Architecture

```
.github/workflows/
├── ci-cd.yml          # Main CI/CD pipeline (test, analyze, build)
└── docker-scan.yml    # Security scanning for Docker images
```

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Purpose**: Comprehensive testing, code quality analysis, and build verification

**Trigger Events**:
- Push to `main` branch
- Pull requests targeting `main` branch

**Jobs**:

#### Security Scan Job
- **Duration**: ~18 seconds
- **Actions**:
  - Checks out repository code
  - Scans filesystem for vulnerabilities using Trivy
  - Uploads results to GitHub Security tab
- **Tools**: `aquasecurity/trivy-action@master`
- **Output**: SARIF format for GitHub integration

#### Test and Analysis Job
- **Duration**: ~56 seconds
- **Actions**:
  - Checks out repository code
  - Sets up Node.js 18
  - Installs project dependencies
  - Runs Jest test suite (122 tests)
  - Generates coverage report (lcov format)
  - Analyzes code with SonarQube Scanner
  - Checks Quality Gate status
- **Tools**: 
  - Jest (testing framework)
  - SonarQube Scanner CLI v7.3.0
  - GitHub Actions SonarQube integration
- **Outputs**: 
  - Test results
  - Coverage report (`coverage/lcov.info`)
  - SonarQube analysis results

#### Build Job
- **Duration**: ~19 seconds
- **Dependencies**: Requires Test and Analysis job to pass
- **Actions**:
  - Checks out repository code
  - Sets up Node.js 18
  - Installs project dependencies
  - Compiles TypeScript to JavaScript
  - Uploads build artifacts
- **Output**: `dist/` folder with compiled code

### 2. Docker Security Scan (`docker-scan.yml`)

**Purpose**: Vulnerability scanning for Docker images

**Trigger Events**:
- Push to `main` branch
- Pull requests targeting `main` branch

**Job**: Docker Image Scan
- **Actions**:
  - Checks out repository code
  - Scans Dockerfile and dependencies
  - Reports vulnerabilities by severity
- **Tools**: `aquasecurity/trivy-action@master`
- **Output**: Console report with vulnerability details

## Configuration

### Required Secrets

Configure the following secrets in GitHub repository settings:

| Secret | Purpose | Example Value |
|--------|---------|---------------|
| `SONAR_HOST_URL` | SonarQube server URL | `http://yourname-sonar.eastus.cloudapp.azure.com:9000` |
| `SONAR_TOKEN` | Authentication token for SonarQube | `sqp_1234567890abcdef...` |

### Adding Secrets

1. Navigate to repository Settings
2. Select "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each secret with its name and value

### Permissions

The workflows require the following permissions:

```yaml
permissions:
  security-events: write  # Upload Trivy scan results
  contents: read          # Checkout repository code
  actions: read           # Access workflow context
```

## Job Details

### Security Scan

**Steps**:
1. **Checkout code**: `actions/checkout@v4`
2. **Run Trivy scan**: 
   - Scan type: Filesystem
   - Format: SARIF (Security Analysis Results Interchange Format)
   - Output file: `trivy-results.sarif`
3. **Upload to GitHub Security**: `github/codeql-action/upload-sarif@v3`

**Security Levels**:
- CRITICAL: Immediate action required
- HIGH: Fix soon
- MEDIUM: Schedule for fix
- LOW: Optional fix

### Test and Analysis

**Steps**:
1. **Checkout code**: `actions/checkout@v4` with full history
2. **Setup Node.js**: `actions/setup-node@v4` with version 18
3. **Install dependencies**: `npm ci` (clean install)
4. **Run tests**: `npm run test:coverage`
   - Executes all 122 test cases
   - Generates coverage report in lcov format
   - Coverage threshold: ~80%
5. **SonarQube Scan**: `sonarsource/sonarqube-scan-action@master`
   - Reads `sonar-project.properties`
   - Uploads code and coverage data
   - Analyzes code quality and security
6. **Quality Gate**: `sonarsource/sonarqube-quality-gate-action@master`
   - Checks if code meets quality standards
   - Continues on error for first-time setup

**Test Categories**:
- Auth module: Authentication and authorization
- Event module: Event management
- Purchase module: Purchase processing
- Ticket module: Ticket operations
- User module: User and role management

**Coverage Metrics**:
- Line coverage: ~80%
- Branch coverage: ~75%
- Function coverage: ~85%

### Build

**Steps**:
1. **Checkout code**: `actions/checkout@v4`
2. **Setup Node.js**: `actions/setup-node@v4` with version 18
3. **Install dependencies**: `npm ci`
4. **Build project**: `npm run build`
   - Compiles TypeScript files
   - Outputs to `dist/` directory
   - Validates type definitions
5. **Upload artifact**: `actions/upload-artifact@v4`
   - Artifact name: `build-output`
   - Includes: `dist/` folder
   - Retention: 90 days

## Usage

### Manual Trigger

Run workflows manually from GitHub Actions tab:
1. Go to "Actions" tab in repository
2. Select workflow (ci-cd or docker-scan)
3. Click "Run workflow"
4. Choose branch and click "Run workflow" button

### Automatic Trigger

Workflows run automatically on:
- Code push to main branch
- Pull request creation/update to main branch

### Viewing Results

#### Test Results
- Navigate to Actions tab
- Select workflow run
- Click "Test and Analysis" job
- View test output and coverage summary

#### Security Results
- Navigate to Security tab
- Click "Code scanning"
- View Trivy scan findings
- Filter by severity level

#### SonarQube Results
- Open SonarQube URL (`SONAR_HOST_URL`)
- Login with credentials
- Select project
- View dashboard with metrics

## SonarQube Integration

### Project Configuration

The `sonar-project.properties` file defines analysis parameters:

```properties
sonar.projectKey=nexusnodejs
sonar.organization=your-org
sonar.sources=src
sonar.tests=src/tests
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Analysis Process

1. **Code Checkout**: Full repository history fetched
2. **Dependency Installation**: npm ci installs exact versions
3. **Test Execution**: Jest generates coverage data
4. **Scanner Execution**: SonarQube Scanner CLI uploads code
5. **Server Analysis**: SonarQube server processes and analyzes
6. **Quality Gate**: Results compared against quality standards
7. **Results Display**: Metrics available in SonarQube UI

### Metrics Tracked

| Metric | Description | Target |
|--------|-------------|--------|
| Coverage | Percentage of code tested | > 80% |
| Code Smells | Maintainability issues | < 50 |
| Bugs | Potential runtime errors | 0 |
| Vulnerabilities | Security issues | 0 |
| Security Hotspots | Code requiring review | < 5 |
| Duplications | Duplicate code blocks | < 3% |
| Technical Debt | Estimated fix time | < 1 day |

## Trivy Security Scanning

### Scan Types

**Filesystem Scan**:
- Scans source code for vulnerabilities
- Checks dependency files (package.json, package-lock.json)
- Detects vulnerable npm packages
- Reports CVEs with severity levels

**Docker Image Scan** (docker-scan.yml):
- Scans Dockerfile for misconfigurations
- Checks base image vulnerabilities
- Verifies installed packages
- Reports security best practice violations

### Vulnerability Database

Trivy uses multiple databases:
- National Vulnerability Database (NVD)
- GitHub Security Advisories
- npm Security Advisories
- Alpine SecDB
- Red Hat Security Data

### Report Format

SARIF (Security Analysis Results Interchange Format):
- Standardized format for security tools
- Integrates with GitHub Security tab
- Provides detailed vulnerability information
- Links to remediation guidance

## Troubleshooting

### Common Issues

**Issue**: SonarQube scan fails with authentication error
- **Solution**: Verify `SONAR_TOKEN` secret is correct
- **Check**: Token is not expired in SonarQube

**Issue**: Quality Gate fails
- **Solution**: Review code quality metrics in SonarQube
- **Action**: Fix reported issues and push again

**Issue**: Tests fail in CI but pass locally
- **Solution**: Ensure Node.js versions match (18)
- **Check**: Verify dependencies with `npm ci` locally

**Issue**: Coverage report not found
- **Solution**: Verify Jest generates lcov.info
- **Check**: `coverage/lcov.info` exists after test run

**Issue**: Trivy scan times out
- **Solution**: Check GitHub Actions status
- **Action**: Retry workflow run

**Issue**: Build artifacts not uploaded
- **Solution**: Verify build completes successfully
- **Check**: `dist/` directory exists after build

### Debug Mode

Enable verbose logging:
```yaml
- name: Run tests
  run: npm run test:coverage -- --verbose
```

### Checking Secrets

Verify secrets are configured:
1. Go to repository Settings
2. Select "Secrets and variables" → "Actions"
3. Confirm `SONAR_HOST_URL` and `SONAR_TOKEN` exist

## Performance Optimization

### Caching

Node modules are cached to speed up workflows:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'npm'
```

### Parallel Execution

Jobs run in parallel when possible:
- Security Scan (independent)
- Test and Analysis (independent)
- Build (depends on Test and Analysis)

### Resource Limits

GitHub Actions limits:
- Workflow run time: 6 hours maximum
- Job run time: 360 minutes maximum
- Concurrent jobs: Varies by plan

## Best Practices

- **Fail Fast**: Security and test failures stop the build
- **Artifact Retention**: Build artifacts kept for 90 days
- **Secret Rotation**: Regularly update `SONAR_TOKEN`
- **Quality Standards**: Maintain high coverage and low debt
- **Dependency Updates**: Keep actions and tools current
- **Error Handling**: Use `continue-on-error` judiciously
- **Branch Protection**: Require status checks before merge
- **Code Review**: Use pull requests for all changes

## Integration with Infrastructure

### Connection to Terraform

- `SONAR_HOST_URL` uses the FQDN from Terraform output
- Example: `http://nexus-sonar-yourname.eastus.cloudapp.azure.com:9000`

### Connection to Ansible

- SonarQube server deployed by Ansible must be running
- Token generated from the deployed SonarQube instance
- Network Security Group must allow port 9000 access

### Complete Flow

1. **Infrastructure**: Terraform provisions Azure VM
2. **Configuration**: Ansible deploys SonarQube
3. **Token Generation**: Admin creates token in SonarQube UI
4. **Secret Setup**: Token added to GitHub repository secrets
5. **Pipeline Execution**: CI/CD workflows connect to SonarQube
6. **Analysis**: Code quality results displayed in SonarQube dashboard

## Maintenance

### Updating Workflows

1. Edit workflow YAML files
2. Test changes in a feature branch
3. Review workflow runs
4. Merge to main after validation

### Updating Dependencies

```bash
npm update
npm audit fix
```

Push changes to trigger new workflow run.

### Monitoring

- Check Actions tab regularly for failed runs
- Review Security tab for vulnerabilities
- Monitor SonarQube dashboard for quality trends
- Set up notifications for workflow failures
