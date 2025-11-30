import Toast from "react-native-toast-message";

export const showErrorToast = (label: string) => {
    Toast.show({
        type: "error",
        text1: label,
        position: "top",
        visibilityTime: 2500,
        topOffset: 80,
    });
};

export const showSuccessToast = (label: string) => {
    Toast.show({
        type: "success",
        text1: label,
        position: "top",
        visibilityTime: 2500,
        topOffset: 80,
    });
};