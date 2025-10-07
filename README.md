# nexusnodejs-public

**Author:** Santiago Valencia García - A00395902

---

This repository contains the source code for a Node.js application, originally developed for event management. For this project, the codebase is reused as a foundation to implement a complete DevOps solution focused on infrastructure automation, security, and code quality.

---

## Documentation

### 1. Initial Local Setup (SonarQube with Docker Compose)

The first stage consists of running SonarQube locally using Docker Compose, as provided by the instructor. This approach allows for quick code quality analysis without cloud infrastructure or automation tools.

#### Configuration Files

**sonar-project.properties**
```
sonar.host.url=http://localhost:9000

sonar.projectKey=nexusnodejs-public
sonar.projectName=Nexus NodeJS
sonar.projectVersion=1.0.0

sonar.sources=src
sonar.tests=src/tests
sonar.sourceEncoding=UTF-8

sonar.typescript.lcov.reportPaths=coverage/lcov.info

sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/tests/**
sonar.coverage.exclusions=**/tests/**,**/seed.ts

sonar.token=YOUR_TOKEN_HERE
```

**docker-compose.yml**
```docker
version: '2'

services:
  sonarqube:
    image: sonarqube
    ports:
      - "9000:9000"
    networks:
      - sonarnet
    environment:
      - SONARQUBE_JDBC_URL=jdbc:postgresql://db:5432/sonar
      - SONARQUBE_JDBC_USERNAME=sonar
      - SONARQUBE_JDBC_PASSWORD=sonar
    volumes:
      - sonarqube_conf:/opt/sonarqube/conf
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_bundled-plugins:/opt/sonarqube/lib/bundled-plugins

  db:
    image: postgres
    networks:
      - sonarnet
    environment:
      - POSTGRES_USER=sonar
      - POSTGRES_PASSWORD=sonar
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data

networks:
  sonarnet:
    driver: bridge

volumes:
  sonarqube_conf:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_bundled-plugins:
  postgresql:
  postgresql_data:
```

#### Execution Commands

```bash
# Start SonarQube and PostgreSQL containers
docker compose up -d

# Install project dependencies
npm install

# Run tests with coverage
npm run test:coverage

# Run SonarQube analysis
sonar-scanner
```

#### Results

The local setup produces the following outcomes:

| Metric | Result |
|--------|--------|
| SonarQube Instance | Running on localhost:9000 |
| Code Coverage | Generated in coverage/ directory |
| Analysis Status | Completed successfully |
| Quality Gate | Passed |

**Screenshots:**

![SonarQube Local Setup - Dashboard](/images/image1.jpeg)

![SonarQube Local Setup - Project Analysis](/images/image2.jpeg)

![SonarQube Local Setup - Coverage Report](/images/image3.jpeg)

This local setup is suitable for evaluation and initial development, but lacks scalability, automation, and security best practices.

---

### 2. Automated DevOps Solution (Terraform, Ansible, CI/CD, SonarQube, Trivy)

The second and main stage implements a robust, automated DevOps pipeline using cloud infrastructure, configuration management, and security/code quality gates.

#### Infrastructure Provisioning (Terraform)

Azure resources are provisioned using Terraform, including resource group, virtual network, subnet, public IP with FQDN for stable access, network security group with rules for SSH and SonarQube, and a Linux virtual machine running Ubuntu. All variables are managed via terraform.tfvars, including admin credentials and DNS label. Outputs provide the FQDN, public IP, and SonarQube URL for further automation.

**Execution Commands:**

```bash
# Navigate to terraform directory
cd terraform/

# Initialize Terraform
terraform init

# Review the execution plan
terraform plan

# Apply infrastructure changes
terraform apply

# View outputs (FQDN, IP, SonarQube URL)
terraform output
```

**Provisioned Resources:**

| Resource | Type | Purpose |
|----------|------|---------|
| Resource Group | azurerm_resource_group | Container for all resources |
| Virtual Network | azurerm_virtual_network | Network isolation |
| Subnet | azurerm_subnet | VM network segment |
| Public IP | azurerm_public_ip | External access with FQDN |
| Network Security Group | azurerm_network_security_group | Firewall rules (SSH, SonarQube) |
| Virtual Machine | azurerm_linux_virtual_machine | Ubuntu server for SonarQube |

#### Configuration Management (Ansible)

Ansible is used to configure the VM by installing Docker and Docker Compose, deploying SonarQube and PostgreSQL using Docker Compose, and ensuring the VM is accessible via FQDN and SSH. The inventory is updated with the FQDN and credentials from Terraform outputs.

**Execution Commands:**

```bash
# Update inventory with FQDN from Terraform outputs
# Edit ansible/inventory.ini with the FQDN and credentials

# Run the playbook
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

# Verify SonarQube is running
curl http://FQDN:9000
```

**Configuration Tasks:**

| Task | Description | Status |
|------|-------------|--------|
| Docker Installation | Install Docker and Docker Compose | Completed |
| SonarQube Deployment | Deploy containers via Docker Compose | Completed |
| Network Configuration | Configure SSH and SonarQube access | Completed |
| Service Verification | Ensure services are running | Completed |

#### CI/CD Pipeline (GitHub Actions)

The GitHub Actions workflow automates security scanning with Trivy for filesystem and Docker images, test execution and coverage reporting with Jest, SonarQube analysis using the cloud instance with secrets for URL and token, Quality Gate enforcement with continue-on-error for first run, and build artifact upload. Secrets SONAR_HOST_URL and SONAR_TOKEN are managed in GitHub for secure integration.

**Setup Commands:**

```bash
# Configure GitHub Secrets
# Go to: Repository Settings > Secrets and variables > Actions
# Add the following secrets:
# - SONAR_HOST_URL: http://FQDN:9000
# - SONAR_TOKEN: (generated from SonarQube)

# Trigger the pipeline
git add .
git commit -m "feat: trigger CI/CD pipeline"
git push origin main
```

**Pipeline Jobs:**

| Job | Duration | Status |
|-----|----------|--------|
| Security Scan (Trivy) | ~2-3 min | Passed |
| Test and Coverage | ~3-5 min | Passed |
| SonarQube Analysis | ~2-3 min | Passed |
| Build Application | ~1-2 min | Passed |
| Total Pipeline | ~8-10 min | Success |

#### Security and Code Quality

Trivy scans the codebase and Docker images for vulnerabilities, reporting results to the GitHub Security tab. SonarQube analyzes code quality, coverage, bugs, and code smells, enforcing quality gates. Coverage is generated and uploaded as an artifact for review.

**Screenshots:**

![Automated Solution - Terraform Apply](/images/image4.jpeg)

![Automated Solution - Ansible Playbook](/images/image5.jpeg)

![Automated Solution - GitHub Actions Pipeline](/images/image6.jpeg)

**Analysis Results:**

| Metric | Tool | Result |
|--------|------|--------|
| Vulnerabilities (Critical) | Trivy | 0 found |
| Vulnerabilities (High) | Trivy | 0 found |
| Code Coverage | Jest | ~80% |
| Bugs | SonarQube | 0 detected |
| Code Smells | SonarQube | Minor issues only |
| Quality Gate | SonarQube | Passed |
| Security Hotspots | SonarQube | Reviewed |

#### Best Practices

The project follows Infrastructure as Code with Terraform, Configuration as Code with Ansible, Automated CI/CD with GitHub Actions, secrets management with GitHub Secrets, stable FQDN for SonarQube and SSH access, and modular documentation in each folder.

#### Complete Workflow Summary

```bash
# Step 1: Provision Infrastructure
cd terraform/
terraform init
terraform apply

# Step 2: Configure VM
cd ../ansible/
ansible-playbook -i inventory.ini playbook.yml

# Step 3: Access SonarQube
# Open browser: http://FQDN:9000
# Login: admin/admin (change password on first login)
# Generate token: My Account > Security > Generate Token

# Step 4: Configure GitHub Secrets
# Add SONAR_HOST_URL and SONAR_TOKEN to repository secrets

# Step 5: Trigger Pipeline
git add .
git commit -m "feat: complete DevOps setup"
git push origin main

# Step 6: Monitor Results
# View pipeline: GitHub Actions tab
# View analysis: SonarQube dashboard
# View security: GitHub Security tab
```

---

## Folder Structure and Module Documentation

- terraform/ - Infrastructure provisioning (see terraform/TERRAFORM.md)
- ansible/ - VM configuration and SonarQube deployment (see ansible/ANSIBLE.md)
- .github/workflows/ - CI/CD pipelines (see .github/workflows/WORKFLOWS.md)
