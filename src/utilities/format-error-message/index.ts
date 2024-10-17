export const formatErrorMessage = (errorData: any): string => {
    let errorMessage = '';

    for (const [key, value] of Object.entries(errorData)) {
        if (Array.isArray(value)) {
            errorMessage += `${key}: ${value.join(' ')}\n`;
        } else {
            errorMessage += `${key}: ${value}\n`;
        }
    }

    return errorMessage.trim();
};
