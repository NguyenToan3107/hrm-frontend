import { UserProfileParams } from "@/apis/modules/auth";
import { AuthRepository } from "@/core/application/infrastructure-interface/repositories/auth.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class EditMyPageUseCase {
  private authRepo: AuthRepository;
  constructor(authRepo: AuthRepository) {
    this.authRepo = authRepo;
  }
  async execute(params: UserProfileParams): Promise<CommonResponse | null> {
    const formData = new FormData();

    formData.append("fullname", params.fullname);
    formData.append("phone", params.phone);
    formData.append("birth_day", params.birth_day);
    formData.append("address", params.address);
    formData.append("country", params.country);
    formData.append("updated_at", params.updated_at || "");

    if (params.image instanceof File) {
      formData.append("image", params.image);
    }
    if (params.image_root instanceof File) {
      formData.append("image_root", params.image_root);
    }
    const reponse = await this.authRepo.updateUser(formData);
    return reponse;
  }
}
