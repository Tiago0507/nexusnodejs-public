# Ansible Module

**Author:** Santiago Valencia García

---

This folder contains the Ansible playbooks and roles for configuring the Azure VM. Ansible automates Docker and Docker Compose installation, then deploys SonarQube and PostgreSQL using docker-compose.yml.

## Overview

The Ansible module provides automated configuration management for the provisioned Azure VM. It ensures all required software is installed, configured, and running without manual intervention.

## Architecture

The automation follows a role-based architecture:

```
ansible/
├── inventory.ini          # Host inventory with connection details
├── playbook.yml          # Main orchestration playbook
└── roles/
    ├── docker/           # Docker installation and configuration
    │   └── tasks/
    │       └── main.yml
    └── sonarqube/        # SonarQube deployment
        ├── files/
        │   └── docker-compose.yml
        └── tasks/
            └── main.yml
```

## Files

| File/Folder | Purpose |
|-------------|---------|
| `inventory.ini` | Ansible inventory defining target hosts and connection parameters |
| `playbook.yml` | Main playbook orchestrating all roles and tasks |
| `roles/docker/` | Role for Docker and Docker Compose installation |
| `roles/sonarqube/` | Role for SonarQube container deployment |
| `roles/sonarqube/files/docker-compose.yml` | Docker Compose configuration for SonarQube stack |

## Configuration

### Inventory File

The `inventory.ini` file defines the target VM and connection details:

```ini
[sonarqube_servers]
nexus-sonar-yourname.eastus.cloudapp.azure.com

[sonarqube_servers:vars]
ansible_user=azureuser
ansible_password=YourSecurePassword123!
ansible_become=yes
ansible_become_method=sudo
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
```

### Inventory Variables

- **ansible_user**: SSH username for VM access
- **ansible_password**: Password for authentication
- **ansible_become**: Enable privilege escalation (sudo)
- **ansible_become_method**: Method for privilege escalation
- **ansible_python_interpreter**: Python path on target host
- **ansible_ssh_common_args**: SSH options for connection

## Roles

### Docker Role

**Purpose**: Installs Docker Engine and Docker Compose on the target VM

**Tasks**:
1. Updates APT package cache
2. Installs prerequisites (apt-transport-https, ca-certificates, curl, gnupg)
3. Adds Docker's official GPG key
4. Adds Docker's APT repository
5. Installs Docker CE (Community Edition)
6. Ensures Docker service is running and enabled
7. Adds the user to the Docker group for non-root access
8. Downloads and installs Docker Compose

**Outcome**: Docker and Docker Compose are fully operational

### SonarQube Role

**Purpose**: Deploys SonarQube and PostgreSQL containers

**Tasks**:
1. Creates the deployment directory (`/opt/sonarqube`)
2. Copies `docker-compose.yml` to the VM
3. Starts containers using Docker Compose
4. Verifies containers are running

**Outcome**: SonarQube web UI accessible on port 9000

## Playbook

The main `playbook.yml` orchestrates the roles:

```yaml
- name: Configure SonarQube VM
  hosts: sonarqube_servers
  become: yes
  roles:
    - docker
    - sonarqube
```

**Execution Flow**:
1. Connects to all hosts in `sonarqube_servers` group
2. Executes Docker role tasks
3. Executes SonarQube role tasks
4. Reports completion status

## Usage

### 1. Prerequisites

Ensure the following are available:
- Ansible >= 2.9
- Python 3 on the local machine
- SSH access to the target VM
- Terraform outputs (FQDN, username, password)

### 2. Update Inventory

Edit `inventory.ini` with the VM details from Terraform outputs:

```bash
vim inventory.ini
```

Replace placeholders:
- FQDN from `terraform output sonar_fqdn`
- Username from `terraform output` (admin_username)
- Password from your `terraform.tfvars`

### 3. Test Connection

Verify Ansible can reach the VM:

```bash
ansible -i inventory.ini sonarqube_servers -m ping
```

Expected output:
```
nexus-sonar-yourname.eastus.cloudapp.azure.com | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

### 4. Run Playbook

Execute the configuration playbook:

```bash
ansible-playbook -i inventory.ini playbook.yml
```

### 5. Monitor Execution

Ansible displays real-time progress:

```
PLAY [Configure SonarQube VM] **************************************************

TASK [Gathering Facts] *********************************************************
ok: [nexus-sonar-yourname.eastus.cloudapp.azure.com]

TASK [docker : Update apt cache] ***********************************************
changed: [nexus-sonar-yourname.eastus.cloudapp.azure.com]

...

PLAY RECAP *********************************************************************
nexus-sonar-yourname.eastus.cloudapp.azure.com : ok=9 changed=7 unreachable=0 failed=0
```

### 6. Verification

Check SonarQube is accessible:

```bash
curl -I http://nexus-sonar-yourname.eastus.cloudapp.azure.com:9000
```

Expected response:
```
HTTP/1.1 200 OK
```

Or visit in browser: `http://<FQDN>:9000`

## Task Details

### Docker Role Tasks

| Task | Description | Status Check |
|------|-------------|--------------|
| Update apt cache | Refreshes package lists | `apt-get update` |
| Install prerequisites | Installs required packages | `dpkg -l \| grep curl` |
| Add Docker GPG key | Adds Docker repository key | `apt-key list` |
| Add Docker repository | Adds Docker APT source | `/etc/apt/sources.list.d/docker.list` |
| Install Docker | Installs Docker Engine | `docker --version` |
| Start Docker service | Ensures Docker is running | `systemctl status docker` |
| Add user to docker group | Grants non-root Docker access | `groups azureuser` |
| Install Docker Compose | Downloads and installs compose | `docker-compose --version` |

### SonarQube Role Tasks

| Task | Description | Status Check |
|------|-------------|--------------|
| Create directory | Creates `/opt/sonarqube` | `ls -la /opt/sonarqube` |
| Copy docker-compose.yml | Transfers compose file | `cat /opt/sonarqube/docker-compose.yml` |
| Start containers | Runs `docker-compose up -d` | `docker ps` |

## Docker Compose Configuration

The deployed `docker-compose.yml` includes:

### Services

**PostgreSQL Database**:
- Image: `postgres:13`
- Port: 5432 (internal only)
- Environment: Database credentials and schema
- Volume: Persistent data storage

**SonarQube Server**:
- Image: `sonarqube:lts-community`
- Port: 9000 (exposed externally)
- Depends on: PostgreSQL
- Environment: Database connection settings
- Volumes: Data, extensions, logs

### Network

- Bridge network (`sonarnet`) for service communication
- PostgreSQL only accessible from SonarQube container
- SonarQube web UI accessible on host port 9000

## Maintenance

### Rerunning the Playbook

Ansible is idempotent; rerunning is safe:

```bash
ansible-playbook -i inventory.ini playbook.yml
```

Changed tasks will be executed; unchanged tasks will be skipped.

### Checking Container Status

SSH into the VM and check:

```bash
ssh azureuser@nexus-sonar-yourname.eastus.cloudapp.azure.com
docker ps
docker-compose -f /opt/sonarqube/docker-compose.yml ps
```

### Viewing Container Logs

```bash
docker logs sonarqube
docker logs postgres
```

### Restarting Services

```bash
cd /opt/sonarqube
docker-compose restart
```

### Stopping Services

```bash
cd /opt/sonarqube
docker-compose down
```

### Starting Services

```bash
cd /opt/sonarqube
docker-compose up -d
```

## Troubleshooting

### Common Issues

**Issue**: Connection timeout
- **Solution**: Verify NSG rules allow SSH (port 22)
- **Check**: `az network nsg rule list --resource-group <rg> --nsg-name <nsg>`

**Issue**: Authentication failed
- **Solution**: Verify username/password in inventory.ini match Terraform tfvars
- **Check**: `ssh azureuser@<FQDN>` manually

**Issue**: Docker installation fails
- **Solution**: Check VM has internet access
- **Check**: `ssh azureuser@<FQDN> 'ping google.com'`

**Issue**: SonarQube containers not starting
- **Solution**: Check Docker is running and user is in docker group
- **Check**: `systemctl status docker` and `groups azureuser`

**Issue**: Port 9000 not accessible
- **Solution**: Verify NSG allows port 9000
- **Check**: `curl -I http://<FQDN>:9000` from another machine

## Integration

### With Terraform

Ansible depends on Terraform outputs:
- **FQDN**: Used in inventory.ini as the host
- **Credentials**: Must match between Terraform tfvars and Ansible inventory

### With CI/CD

After Ansible completes:
- SonarQube URL is used in GitHub Actions workflow
- Token generation requires SonarQube to be running
- Analysis jobs connect to the deployed instance

## Best Practices

- Use Ansible Vault to encrypt passwords in inventory.ini
- Test playbook changes with `--check` flag (dry run)
- Use tags to run specific roles: `--tags docker,sonarqube`
- Keep roles modular and reusable
- Document all variables and their purposes
- Use version control for playbooks and roles
- Store sensitive data (passwords) securely
- Validate inventory with `ansible-inventory --list -i inventory.ini`
