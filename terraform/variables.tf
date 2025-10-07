variable "resource_group_name" {
  description = "Nombre del resource group de Azure"
  type        = string
}

variable "location" {
  description = "Región de Azure donde se desplegará la infraestructura"
  type        = string
  default     = "eastus"
}

variable "vm_name" {
  description = "Nombre de la máquina virtual para SonarQube"
  type        = string
  default     = "sonarqube-vm"

}

variable "vm_size" {
  description = "Tamaño de la VM (SKU)"
  type        = string
  default     = "Standard_B2s"
}

variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "admin_username" {
  description = "Usuario administrador para la VM"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key_path" {
  description = "(Obsoleto) No se usa: autenticación por contraseña habilitada"
  type        = string
  default     = ""
}

variable "admin_password" {
  description = "Contraseña del usuario administrador para la VM"
  type        = string
  sensitive   = true
}

variable "public_ip_dns_label" {
  description = "Etiqueta DNS única para asignar FQDN público (solo minúsculas y números, único por región)"
  type        = string
}
