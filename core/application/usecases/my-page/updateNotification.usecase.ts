import {CommonResponse} from "@/core/entities/models/responseCommon.model";
import {UserRepository} from "@/core/application/infrastructure-interface/repositories/user.repo-interface";
import {UpdateNotificationConfigParams} from "@/apis/modules/user";

export class UpdateNotificationUseCase {
    private userRepo: UserRepository;

    constructor(userRepo: UserRepository) {
        this.userRepo = userRepo;
    }

    async execute(params: UpdateNotificationConfigParams): Promise<CommonResponse | null> {
        const response = await this.userRepo.updateNotificationConfig(params);
        return response;
    }
}
