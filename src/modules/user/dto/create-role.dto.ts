export interface CreateRoleDto {
  readonly name: string;
  readonly description?: string;
  readonly permissions: string[];
}
