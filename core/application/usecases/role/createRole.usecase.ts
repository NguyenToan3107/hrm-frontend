import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { RoleRepository } from "@/core/application/infrastructure-interface/repositories/role.repo-interface";
import { CreateRoleParams } from "@/apis/modules/role";

export class CreateRoleUseCase {
  private roleRepo: RoleRepository;
  constructor(roleRepo: RoleRepository) {
    this.roleRepo = roleRepo;
  }

  async execute(params: CreateRoleParams): Promise<CommonResponse | null> {
    const response = await this.roleRepo.createRole(params);
    return response;
  }
}
