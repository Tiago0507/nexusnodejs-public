# Terraform Module

**Author:** Santiago Valencia García

---

This folder contains the Terraform configuration for provisioning all required Azure resources for the DevOps solution. The infrastructure is defined as code to ensure reproducibility, scalability, and security.

## Overview

The Terraform module provisions a complete Azure infrastructure for hosting SonarQube on a dedicated virtual machine. All resources are configured with best practices for security, networking, and accessibility.

## Architecture

The infrastructure consists of the following components:

- **Resource Group**: Container for all Azure resources
- **Virtual Network**: Isolated network environment with address space 10.0.0.0/16
- **Subnet**: Network segment for the VM with address prefix 10.0.1.0/24
- **Public IP**: Static IP address with FQDN for stable external access
- **Network Security Group**: Firewall rules controlling inbound traffic
- **Network Interface**: Virtual NIC connecting the VM to the network
- **Linux Virtual Machine**: Ubuntu 22.04 LTS server running SonarQube

## Files

| File | Purpose |
|------|---------|
| `main.tf` | Main infrastructure definition and resource configuration |
| `variables.tf` | Input variable declarations with descriptions and types |
| `outputs.tf` | Output values for FQDN, IP address, and SonarQube URL |
| `terraform.tfvars.example` | Example configuration file with placeholder values |

## Configuration

### Required Variables

The following variables must be configured in `terraform.tfvars`:

```hcl
resource_group_name = "sonarqube-rg-yourname"
location            = "eastus"
vm_name             = "sonarqube-vm-yourname"
vm_size             = "Standard_B2s"
admin_username      = "azureuser"
admin_password      = "YourSecurePassword123!"
public_ip_dns_label = "yourname-sonar-unique"
```

### Variable Descriptions

- **resource_group_name**: Unique name for the Azure resource group
- **location**: Azure region for resource deployment (e.g., eastus, westus)
- **vm_name**: Name for the virtual machine
- **vm_size**: Azure VM SKU (Standard_B2s recommended for SonarQube)
- **admin_username**: SSH/login username for the VM
- **admin_password**: Secure password for VM authentication
- **public_ip_dns_label**: Unique DNS label for FQDN (lowercase, alphanumeric only)

### Network Security Rules

The Network Security Group includes the following inbound rules:

| Rule | Port | Protocol | Purpose |
|------|------|----------|---------|
| SSH | 22 | TCP | Remote administration access |
| SonarQube | 9000 | TCP | Web UI and API access |

## Usage

### 1. Prerequisites

Ensure the following tools are installed:
- Terraform >= 1.0.0
- Azure CLI
- Valid Azure subscription

### 2. Authentication

Authenticate with Azure:
```bash
az login
az account show
```

### 3. Configuration

Create `terraform.tfvars` from the example:
```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values.

### 4. Initialization

Initialize Terraform and download required providers:
```bash
terraform init
```

### 5. Planning

Review the execution plan:
```bash
terraform plan
```

This displays all resources that will be created, modified, or destroyed.

### 6. Deployment

Apply the configuration:
```bash
terraform apply
```

Type `yes` when prompted to confirm the deployment.

### 7. Outputs

After successful deployment, Terraform displays output values:

```
Outputs:

resource_group_name = "sonarqube-rg-yourname"
sonar_fqdn = "yourname-sonar-unique.eastus.cloudapp.azure.com"
sonar_url = "http://yourname-sonar-unique.eastus.cloudapp.azure.com:9000"
vm_public_ip = "20.XX.XX.XX"
```

### 8. Next Steps

Use the outputs to:
- Update Ansible inventory with the FQDN
- Configure GitHub Actions secrets with the SonarQube URL
- Access the VM via SSH using the FQDN

## Resource Details

### Virtual Machine Specifications

- **Operating System**: Ubuntu 22.04 LTS (Jammy)
- **Size**: Standard_B2s (2 vCPUs, 4 GB RAM)
- **Disk**: Standard LRS (Locally Redundant Storage)
- **Authentication**: Password-based (SSH key authentication disabled)

### Network Configuration

- **VNet Address Space**: 10.0.0.0/16
- **Subnet Range**: 10.0.1.0/24
- **Public IP**: Static allocation with Standard SKU
- **Private IP**: Dynamic allocation within subnet

## Maintenance

### Viewing Current State

```bash
terraform show
```

### Updating Infrastructure

Modify variables or configuration, then:
```bash
terraform plan
terraform apply
```

### Destroying Resources

To remove all provisioned resources:
```bash
terraform destroy
```

Type `yes` when prompted to confirm destruction.

## Troubleshooting

### Common Issues

**Issue**: Subscription ID not found
- **Solution**: Run `az login` and ensure the correct subscription is selected

**Issue**: DNS label already in use
- **Solution**: Use a unique value for `public_ip_dns_label`

**Issue**: VM size not available in region
- **Solution**: Change `location` or use a different `vm_size`

**Issue**: Authentication failed
- **Solution**: Verify Azure CLI is authenticated with `az account show`

## Integration

The Terraform outputs are designed for seamless integration:

- **Ansible**: Use `sonar_fqdn` in the inventory file
- **GitHub Actions**: Use `sonar_url` for the SONAR_HOST_URL secret
- **SSH Access**: Connect using `ssh admin_username@sonar_fqdn`

## Best Practices

- Use unique values for `resource_group_name` and `public_ip_dns_label`
- Store `terraform.tfvars` securely (it contains sensitive data)
- Never commit `terraform.tfvars` to version control
- Use strong passwords for `admin_password`
- Review the plan output before applying changes
- Keep Terraform state files secure and backed up
