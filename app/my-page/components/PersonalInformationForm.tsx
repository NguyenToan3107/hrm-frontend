"use client";
import { UserProfileParams } from "@/apis/modules/auth";
import AvatarDefault from "@/app/assets/avatar/avatar_default.svg";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import AvatarCropDialog from "@/app/my-page/components/AvatarCropDialog ";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import { AlertDialogCancelButton } from "@/components/common/alert-dialog/AlertDialogCancelButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledDatePicker_v1 } from "@/components/common/StyledDatePicker_v1";
import StyledOverlay from "@/components/common/StyledOverlay";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EditMyPageUseCase } from "@/core/application/usecases/my-page/editMyPage.usecase";
import { ShowMyPageUseCase } from "@/core/application/usecases/my-page/showMyPage.usecase";
import { AuthRepositoryImpl } from "@/core/infrastructure/repositories/auth.repo";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import useWindowSize from "@/hooks/use-dimession";
import { useToast } from "@/hooks/use-toast";
import { useEditingStore, useFileStore } from "@/stores/commonStore";
import { useUserStore } from "@/stores/userStore";
import {
  DATE,
  formatDateToString,
  formatStringToDate,
} from "@/utilities/format";
import { getCroppedImg } from "@/utilities/helper";
import { COUNTRY } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import IconCamera from "../../assets/icons/iconCamera.svg";
import { isMobile } from "react-device-detect";

const formSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(1, { message: "Fullname must be at least 1 characters long" })
    .max(255, { message: "Fullname must be at most 255 characters long" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Mobile Number must be at least 10 characters long" }),
  birth_day: z
    .union([z.string(), z.date()])
    .refine(
      (value) => {
        // if (value === "") return false;
        if (!value || value === "") return false;
        const date = new Date(value);
        const today = new Date();
        return date < today;
      },
      {
        message: "Date of birth must be in the past",
      }
    )
    .transform((value) => {
      if (value === "") return "";
      return new Date(value);
    }),
  address: z
    .string()
    .trim()
    .min(1, { message: "Address must be at least 1 characters long" })
    .max(255, { message: "Address must be at most 255 characters long" }),
  country: z
    .string()
    .trim()
    .min(1, { message: "Country must be at least 1 characters long" })
    .max(255, { message: "Country must be at most 255 characters long" }),
  image: z.string().trim(),
});

const authRepo = new AuthRepositoryImpl();
const userRepo = new UserRepositoryImpl();
const editMyPage = new EditMyPageUseCase(authRepo);
const showMyPage = new ShowMyPageUseCase(userRepo);

export default function PersonalInformationForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const useDimession = useWindowSize();
  const { user, setUser } = useUserStore((state) => state);
  const { isEditing, setIsEditing, setIsDirtyMyPage } = useEditingStore(
    (state) => state
  );
  const {
    image,
    selectedAvatarFile,
    setImage,
    // setSelectedAvatarFile,
    clearImage,
    clearImageRoot,
  } = useFileStore();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // State to control modal visibility
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [isDialogCropAvatarOpen, setIsDialogCropAvatarOpen] = useState(false);
  const [croppedArea, setCroppedArea] = useState(null);
  const i18nMyPage = useTranslations("MyPage");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: user?.phone || "",
      birth_day: user?.birth_day ? formatStringToDate(user.birth_day) : "",
      address: user?.address || "",
      country: user?.country || "",
      image: user?.image || "",
      fullname: user?.fullname || "",
    },
  });

  useEffect(() => {
    if (user?.idkey) {
      form.setValue("fullname", user?.fullname || "");
      form.setValue("address", user?.address || "");
      form.setValue("phone", user?.phone || "");
      form.setValue("country", user?.country || "");
      form.setValue("image", user?.image || "");
      form.setValue(
        "birth_day",
        user?.birth_day ? formatStringToDate(user?.birth_day || "") : ""
      );
    }
  }, [user]);

  const reloadMyPage = async () => {
    try {
      const response: any = await showMyPage.execute();
      setUser(response.data);
    } catch (error) {}
  };

  useEffect(() => {
    reloadMyPage();
  }, []);

  const onChangeMyPage = async () => {
    const data = form.getValues();
    // FLOW: UI -> use cases -> repositories -> API
    try {
      setLoading(true);
      let params: UserProfileParams = {
        fullname: data.fullname,
        phone: data.phone,
        birth_day: format(data.birth_day, DATE).toString(),
        address: data.address,
        country: data.country,
        image: image,

        updated_at: user?.updated_at || "",
      };
      // nếu user chưa có ảnh gốc thì chọn ảnh từ thư mục và lưu vào selectedAvatarFile để update
      // nếu user đã có ảnh gốc rồi thì sẽ ko update ảnh gốc nữa
      if (selectedAvatarFile) {
        params = { ...params, image_root: selectedAvatarFile };
      }
      const res = await editMyPage.execute(params);
      if (res?.code === 0) {
        setUser(res.data);
        toast({
          description: "Edit profile success",
          color: "bg-blue-200",
        });
        clearImage();
        clearImageRoot();
        setIsEditing(false);
        setIsDirtyMyPage(false);
      } else {
        if (res?.data?.phone) {
          toast({
            description: "The phone number must be in the correct format.",
            color: "bg-red-100",
          });
        } else if (res?.data?.fullname) {
          toast({
            description: "The fullname must be in the correct format.",
            color: "bg-red-100",
          });
        } else if (res?.data?.birth_day) {
          toast({
            description: "The date of birth must be in the correct format.",
            color: "bg-red-100",
          });
        } else if (res?.data?.address) {
          toast({
            description: "The address must be in the correct format.",
            color: "bg-red-100",
          });
        } else if (res?.data?.country) {
          toast({
            description: "The country must be in the correct format.",
            color: "bg-red-100",
          });
        } else if (res?.data?.image) {
          toast({
            description: "The image must be in the correct format.",
            color: "bg-red-100",
          });
        } else if (res?.data?.image_root) {
          toast({
            description: "The image root must be in the correct format.",
            color: "bg-red-100",
          });
        } else if (res?.data?.updated_at) {
          toast({
            description: "Data has been updated.",
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Edit profile failed",
            color: "bg-red-100",
          });
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    setOpenSubmitDialog(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    if (!isEditing) {
      setSelectedImage("");
    }
  }, [isEditing]);

  const handleCloseModal = () => {
    setIsPreviewOpen(false);
  };

  const handleImageClick = () => {
    setIsPreviewOpen(true);
  };

  const handleChooseImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setSelectedImage(URL.createObjectURL(file));
      setIsDialogCropAvatarOpen(true);

      event.target.value = "";
    }
  };

  const onCancelEditMode = () => {
    // form.reset();
    form.reset({
      phone: user?.phone || "",
      birth_day: user?.birth_day ? formatStringToDate(user.birth_day) : "",
      address: user?.address || "",
      country: user?.country || "",
      image: user?.image || "",
      fullname: user?.fullname || "",
    });

    clearImage();
    clearImageRoot();
    setIsEditing(false);
    setIsDirtyMyPage(false);
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleSaveCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(
        selectedImage as string,
        croppedArea
      );
      if (!croppedBlob) {
        throw new Error("Failed to crop the image");
      }
      const imageName = selectedImage
        ? `${
            selectedImage.split("/").pop()?.split(".")[0]
          }-${Date.now()}.png` || `${Date.now()}.png`
        : `${Date.now()}.png`;
      const croppedFile = new File([croppedBlob], imageName, {
        type: croppedBlob.type,
      });
      const previewUrl = URL.createObjectURL(croppedBlob);
      setSelectedImage(previewUrl); // lưu link ảnh đã crop
      setImage(croppedFile); // lưu vào store file ảnh đã crop
      setIsDialogCropAvatarOpen(false);
    } catch (error) {}
  };

  const handleClickImage = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (user.image) {
      setSelectedImage(
        `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user?.image_root}`
      );
    } else {
      setSelectedImage(AvatarDefault.src);
    }
    setIsDialogCropAvatarOpen(true);
  };

  const isDirtyEdit = useMemo(() => {
    const values = form.getValues();

    const address = user?.address ?? "";
    const fullname = user?.fullname ?? "";
    const phone = user?.phone ?? "";
    const country = user?.country ?? "";
    const birth_day = user?.birth_day ?? "";
    return (
      values?.fullname !== fullname ||
      values?.address !== address ||
      formatDateToString(values?.birth_day) !== birth_day ||
      values?.phone !== phone ||
      values?.country !== country
    );
  }, Object.values(form.watch()));

  const isDirtyImage = useMemo(() => {
    return image ? image?.name !== user?.image?.split("/")?.at(-1) : false;
  }, [image]);

  useEffect(() => {
    setIsDirtyMyPage(isDirtyImage);
  }, [isDirtyImage]);

  useEffect(() => {
    setIsDirtyMyPage(isDirtyEdit);
  }, [isDirtyEdit]);

  return (
    <div>
      <div
        className="flex flex-1 p-4 flex-col w-full max-h-screen overflow-y-auto"
        style={{
          maxHeight:
            useDimession.height -
            100 -
            100 -
            (isMobile ? 0 - 16 : 120 + 36) +
            (isEditing ? 8 : 0),
          minHeight:
            useDimession.height -
            100 -
            100 -
            (isMobile ? 0 - 16 : 120 + 36) +
            (isEditing ? 8 : 0),
          scrollbarWidth: "none",
        }}
      >
        <StyledOverlay isVisible={loading} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            {user ? (
              <div className="grid grid-cols-1 laptop:grid-cols-2 gap-5 w-full">
                <div
                  className="laptop:hidden relative w-[100px] h-[100px]"
                  onClick={isEditing ? undefined : handleImageClick}
                >
                  <Image
                    src={
                      selectedImage ||
                      (user?.image
                        ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                        : AvatarDefault)
                    }
                    alt=""
                    width={100}
                    height={100}
                    className={`w-full h-full object-cover cursor-pointer rounded-md ${
                      isEditing ? "opacity-60" : ""
                    }`}
                  />
                  {isEditing && (
                    <>
                      <div className="absolute inset-0 flex justify-center items-center cursor-pointer">
                        <div className="p-1 rounded-full bg-white">
                          <Image
                            src={IconCamera}
                            alt=""
                            className="shadow-lg"
                          />
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onClick={handleClickImage}
                        onChange={handleChooseImage}
                        className="hidden"
                        id="fileInput1"
                      />
                      <label
                        htmlFor="fileInput1"
                        className="absolute inset-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-col pb-2 col-span-1 gap-5">
                  <div className={`flex flex-col`}>
                    <FormField
                      control={form.control}
                      name={"fullname"}
                      render={({ field, fieldState }) => {
                        return (
                          <FormItem className="w-full">
                            <div className="flex flex-row items-center">
                              <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                                Fullname
                              </FormLabel>
                              {isEditing && (
                                <p className={"text-red-500 leading-none"}>*</p>
                              )}
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                tabIndex={1}
                                disabled={!isEditing}
                                className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full`}
                                style={{ color: "#16151", opacity: 1 }}
                              />
                            </FormControl>
                            {isEditing && fieldState.error?.message && (
                              <p className={"text-red-500 text-[10px]"}>
                                {fieldState.error?.message}
                              </p>
                            )}
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                  <div
                    className={`flex flex-col ${
                      isEditing ? "" : "hover:cursor-not-allowed"
                    }`}
                  >
                    <FormField
                      control={form.control}
                      name={"birth_day"}
                      render={({ field, fieldState }) => (
                        <FormItem className="w-full">
                          <div className="flex flex-row items-center">
                            <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                              Date of Birth
                            </FormLabel>
                            {isEditing && (
                              <p className={"text-red-500 leading-none"}>*</p>
                            )}
                          </div>
                          <FormControl>
                            <StyledDatePicker_v1
                              title=""
                              field={field}
                              tabIndex={2}
                            />
                          </FormControl>
                          {isEditing && fieldState.error?.message && (
                            <p className={"text-red-500 text-[10px]"}>
                              {fieldState.error?.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className={`flex flex-col`}>
                    <FormField
                      control={form.control}
                      name={"address"}
                      render={({ field, fieldState }) => {
                        return (
                          <FormItem className="w-full">
                            <div className="flex flex-row items-center">
                              <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                                Address
                              </FormLabel>
                              {isEditing && (
                                <p className={"text-red-500 leading-none"}>*</p>
                              )}
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                tabIndex={3}
                                disabled={!isEditing}
                                className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full`}
                                style={{ color: "#16151", opacity: 1 }}
                              />
                            </FormControl>
                            {isEditing && fieldState.error?.message && (
                              <p className={"text-red-500 text-[10px]"}>
                                {fieldState.error?.message}
                              </p>
                            )}
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                  <div className={`flex flex-col`}>
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field, fieldState }) => {
                        return (
                          <FormItem className="w-full" tabIndex={4}>
                            <div className="flex flex-row items-center">
                              <FormLabel
                                className={
                                  "font-normal text-[0.9rem] text-secondary"
                                }
                              >
                                Nationality
                              </FormLabel>
                              {isEditing && (
                                <p className={"text-red-500 leading-none"}>*</p>
                              )}
                            </div>
                            <FormControl>
                              <StyledSelected
                                items={COUNTRY}
                                disabled={!isEditing}
                                field={field}
                                iconRight={ArrowDownIcon}
                              />
                            </FormControl>
                            {isEditing && fieldState.error?.message && (
                              <p className={"text-red-500 text-[10px]"}>
                                {fieldState.error?.message}
                              </p>
                            )}
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col pb-2 col-span-1 gap-5">
                  <div className={`flex flex-col`}>
                    <FormField
                      control={form.control}
                      name={"phone"}
                      render={({ field, fieldState }) => (
                        <FormItem className="w-full">
                          <div className="flex flex-row items-center">
                            <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                              Mobile Number
                            </FormLabel>
                            {isEditing && (
                              <p className={"text-red-500 leading-none"}>*</p>
                            )}
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={5}
                              disabled={!isEditing}
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full`}
                              style={{ color: "#16151", opacity: 1 }}
                              enterKeyHint="done"
                            />
                          </FormControl>
                          {isEditing && fieldState.error?.message && (
                            <p className={"text-red-500 text-[10px]"}>
                              {fieldState.error?.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="fixed flex flex-row bottom-[8px] laptop:bottom-[66px] right-0 mobile:left-0 laptop:right-[54px]">
                  {isEditing && (
                    <div className="flex laptop:gap-4 w-full flex-row justify-end">
                      {isDirtyEdit || isDirtyImage ? (
                        <AlertDialogCancelButton
                          isOpen={true}
                          tabIndex={7}
                          onConfirm={onCancelEditMode}
                        />
                      ) : (
                        <Button
                          tabIndex={7}
                          className="w-[100px] laptop:w-[152px] mx-3 laptop:mx-0 h-8 laptop:h-[50px] font-normal bg-white text-[#16151C] text-[12px] laptop:text-[16px] border border-[#A2A1A8] hover:bg-gray-100 rounded-lg"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                          }}
                        >
                          {i18nMyPage("cancelButton")}
                        </Button>
                      )}

                      <Button
                        tabIndex={6}
                        className="w-[100px] laptop:w-[152px] mr-6 laptop:mx-0 h-8 laptop:h-[50px] font-normal text-white text-[12px] laptop:text-[16px] hover:bg-primary-hover rounded-lg"
                        type="submit"
                      >
                        Save
                      </Button>
                    </div>
                  )}
                  {!isEditing && (
                    <div className="flex laptop:gap-4 w-full flex-row justify-end">
                      <Button
                        tabIndex={6}
                        className="laptop:hidden h-8 w-[100px] font-normal mx-6 text-white text-[12px] laptop:text-[16px] bg-button-edit hover:bg-button-edit-hover rounded-lg"
                        type="button"
                        onClick={handleEdit}
                      >
                        <p className={"text-white"}>Edit</p>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <StyledOverlay isVisible={loading} />
            )}
          </form>
        </Form>
      </div>
      {/* Modal for image preview */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={handleCloseModal} // Close modal on background click
        >
          <div
            className="bg-white rounded shadow-lg relative w-[500px] h-[400px] overflow-hidden first-letter:flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <div className="flex items-center justify-center bg-black w-full h-full">
              <Image
                src={
                  user?.image
                    ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                    : AvatarDefault || AvatarDefault
                }
                alt="Preview"
                width={500}
                height={500}
                className="max-w-full max-h-full  object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onChangeMyPage}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />
      {isDialogCropAvatarOpen && (
        <AvatarCropDialog
          selectedImage={selectedImage}
          isDialogOpen={isDialogCropAvatarOpen}
          setIsDialogOpen={setIsDialogCropAvatarOpen}
          handleCropComplete={handleCropComplete}
          handleSaveCroppedImage={handleSaveCroppedImage}
          setSelectedImage={setSelectedImage}
        />
      )}
    </div>
  );
}
