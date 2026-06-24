import { toast } from "sonner";

const successToastStyle = {
  background: "#ecfdf3",
  color: "#065f46",
  border: "1px solid #a7f3d0",
};

const errorToastStyle = {
  background: "#fef2f2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const loadingToastStyle = {
  background: "#eef2ff",
  color: "#3730a3",
  border: "1px solid #c7d2fe",
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    style: successToastStyle,
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    style: errorToastStyle,
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    style: loadingToastStyle,
  });
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};
