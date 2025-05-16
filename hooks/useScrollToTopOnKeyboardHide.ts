import { useEffect } from "react";

const useScrollToTopOnKeyboardHide = () => {
  const handleFocusOut = () => {
    if (document?.activeElement) {
      document.activeElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  useEffect(() => {
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);
};

export default useScrollToTopOnKeyboardHide;
