import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { RoleRepository } from "@/core/application/infrastructure-interface/repositories/role.repo-interface";
import { DeleteRoleParams } from "@/apis/modules/role";

export class DeleteRoleUseCase {
  private roleRepo: RoleRepository;
  constructor(roleRepo: RoleRepository) {
    this.roleRepo = roleRepo;
  }

  async execute(params: DeleteRoleParams): Promise<CommonResponse | null> {
    const response = await this.roleRepo.deleteRole(params);
    return response;
  }
}
