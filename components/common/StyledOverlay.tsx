import React from "react";

interface Props {
  isVisible: boolean;
  onClose?(): void;
}
const StyledOverlay = (props: Props) => {
  const { isVisible, onClose } = props;
  if (!isVisible) return null;

  return (
    <div
      className={
        "fixed flex justify-center items-center top-0 bottom-0 left-0 right-0 bg-[#00000080] z-[1000] "
      }
      onClick={onClose}
    >
      <div className="w-10 h-10 border-4 border-t-white border-gray-200 rounded-full animate-spin"></div>
    </div>
  );
};

export default StyledOverlay;
