import { useCallback, useState } from "react";

export function useUnsavedChanges() {
    const [isDirty, setIsDirty] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const confirmDiscard = useCallback((onDiscard: () => void) => {
        if (!isDirty) {
            onDiscard();
            return;
        }
        setPendingAction(() => onDiscard);
        setIsModalVisible(true);
    }, [isDirty]);

    const handleConfirm = useCallback(() => {
        setIsModalVisible(false);
        setIsDirty(false);
        pendingAction?.();
        setPendingAction(null);
    }, [pendingAction]);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setPendingAction(null);
    }, []);

    return {
        isDirty,
        setIsDirty,
        confirmDiscard,
        isModalVisible,
        handleConfirm,
        handleCancel,
    };
}