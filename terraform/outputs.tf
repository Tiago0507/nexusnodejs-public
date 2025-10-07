output "vm_public_ip" {
  description = "Dirección IP pública de la VM de SonarQube"
  value       = azurerm_public_ip.sonarqube_public_ip.ip_address
}

output "resource_group_name" {
  description = "Nombre del resource group creado"
  value       = azurerm_resource_group.sonarqube_rg.name
}

output "sonar_fqdn" {
  description = "FQDN público asignado a la IP"
  value       = azurerm_public_ip.sonarqube_public_ip.fqdn
}

output "sonar_url" {
  description = "URL base para SonarQube"
  value       = "http://${azurerm_public_ip.sonarqube_public_ip.fqdn}:9000"
}
