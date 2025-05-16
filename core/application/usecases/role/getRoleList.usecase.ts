import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { RoleRepository } from "@/core/application/infrastructure-interface/repositories/role.repo-interface";
import { GetRoleListParams } from "@/apis/modules/role";

export class GetRoleListUseCase {
  private roleRepo: RoleRepository;
  constructor(roleRepo: RoleRepository) {
    this.roleRepo = roleRepo;
  }

  async execute(params: GetRoleListParams): Promise<CommonResponse | null> {
    const response = await this.roleRepo.getRoleList(params);
    return response;
  }
}
