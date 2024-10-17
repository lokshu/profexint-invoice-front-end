import {Rule} from 'antd/es/form';

export const phoneNumberValidator: Rule = {
    validator(_, value) {
        if (!value) return Promise.resolve(); // If no value is entered, skip further checks
        const sanitizedValue = value.replace(/\D/g, ''); // Remove non-digit characters for length check
        if (/^[0-9]+$/.test(value) && sanitizedValue.length <= 15) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Please input a valid phone number with up to 15 digits!'));
    },
};
