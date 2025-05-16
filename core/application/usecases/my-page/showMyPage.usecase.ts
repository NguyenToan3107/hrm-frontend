import { UserRepository } from "@/core/application/infrastructure-interface/repositories/user.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class ShowMyPageUseCase {
    private userRepo: UserRepository;
    constructor(userRepo: UserRepository) {
      this.userRepo = userRepo;
    }
    async execute(): Promise<CommonResponse | null> {
      const reponse = await this.userRepo.getProfile();
      return reponse;
    }
  }