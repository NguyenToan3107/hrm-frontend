import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { RoleRepository } from "@/core/application/infrastructure-interface/repositories/role.repo-interface";
import { EditRoleParams } from "@/apis/modules/role";

export class EditRoleUseCase {
  private roleRepo: RoleRepository;
  constructor(roleRepo: RoleRepository) {
    this.roleRepo = roleRepo;
  }

  async execute(params: EditRoleParams): Promise<CommonResponse | null> {
    const response = await this.roleRepo.editRole(params);
    return response;
  }
}
