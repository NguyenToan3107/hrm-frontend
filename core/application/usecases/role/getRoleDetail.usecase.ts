import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { RoleRepository } from "@/core/application/infrastructure-interface/repositories/role.repo-interface";
import { GetRoleDetailParams } from "@/apis/modules/role";

export class GetRoleDetailUseCase {
  private roleRepo: RoleRepository;
  constructor(roleRepo: RoleRepository) {
    this.roleRepo = roleRepo;
  }

  async execute(params: GetRoleDetailParams): Promise<CommonResponse | null> {
    const response = await this.roleRepo.getDetailRole(params);
    return response;
  }
}
