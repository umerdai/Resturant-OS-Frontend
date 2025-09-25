import { useToast } from 'primevue/usetoast';

export const useToastHelpers = () => {
    const toast = useToast();

    const showSuccess = (summary = 'Success', detail = 'Operation completed successfully') => {
        toast.add({ severity: 'success', summary, detail, life: 3000 });
    };

    const showInfo = (summary = 'Info', detail = 'Information message') => {
        toast.add({ severity: 'info', summary, detail, life: 3000 });
    };

    const showWarn = (summary = 'Warning', detail = 'Warning message') => {
        toast.add({ severity: 'warn', summary, detail, life: 3000 });
    };

    const showError = (summary = 'Error', detail = 'An error occurred') => {
        toast.add({ severity: 'error', summary, detail, life: 3000 });
    };

    const showSecondary = (summary = 'Note', detail = 'Secondary message') => {
        toast.add({ severity: 'secondary', summary, detail, life: 3000 });
    };

    const showContrast = (summary = 'Notice', detail = 'Contrast message') => {
        toast.add({ severity: 'contrast', summary, detail, life: 3000 });
    };

    return {
        showSuccess,
        showInfo,
        showWarn,
        showError,
        showSecondary,
        showContrast
    };
};
