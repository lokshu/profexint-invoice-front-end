import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select } from 'antd';
import { useCustom } from '@refinedev/core';

const AccountModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: (values: any) => void; initialValues?: any }> = ({ visible, onClose, onSubmit, initialValues }) => {
    const [form] = Form.useForm();
    const [isBankAccount, setIsBankAccount] = useState(false);
    const { data: accountTypes, isLoading: isLoadingAccountTypes } = useCustom({
        url: 'account-types/dropdown',
        method: 'get',
    });
    const { data: currencies, isLoading: isLoadingCurrencies } = useCustom({
        url: 'currencies/dropdown',
        method: 'get',
    });

    useEffect(() => {
        form.resetFields();
        if (initialValues) {
            form.setFieldsValue(initialValues);
            const selectedAccountType = accountTypes?.data?.find((type: any) => type.id === initialValues.account_type);
            setIsBankAccount(selectedAccountType?.is_bank_account);
        }
    }, [initialValues, form, accountTypes]);

    const handleAccountTypeChange = (value: any) => {
        const selectedAccountType = accountTypes?.data?.find((type: any) => type.id === value);
        setIsBankAccount(selectedAccountType?.is_bank_account);
    };

    return (
        <Modal
            title={initialValues ? "Edit Account" : "Create Account"}
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {initialValues ? "Update" : "Create"}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item
                    name="account_type"
                    label="Account Type"
                    rules={[{ required: true, message: 'Please select the account type' }]}
                >
                    <Select
                        placeholder="Select an account type"
                        loading={isLoadingAccountTypes}
                        onChange={handleAccountTypeChange}
                    >
                        {accountTypes?.data?.map((type: any) => (
                            <Select.Option key={type.id} value={type.id}>
                                {type.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="name"
                    label="Account Name"
                    rules={[{ required: true, message: 'Please enter the account name' }]}
                >
                    <Input placeholder="Enter the account name" />
                </Form.Item>
                <Form.Item
                    name="account_code"
                    label="Account Code"
                    rules={[{ required: true, message: 'Please enter the account code' }]}
                >
                    <Input placeholder="Enter the account code" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea placeholder="Enter the description" />
                </Form.Item>
                <Form.Item
                    name="currency"
                    label="Currency"
                >
                    <Select placeholder="Select a currency" loading={isLoadingCurrencies}>
                        {currencies?.data?.map((currency: any) => (
                            <Select.Option key={currency.id} value={currency.id}>
                                {currency.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                {isBankAccount && (
                    <>
                        <Form.Item
                            name="bank_name"
                            label="Bank Name"
                        >
                            <Input placeholder="Enter the bank name" />
                        </Form.Item>
                        <Form.Item
                            name="bank_code"
                            label="Bank Code"
                        >
                            <Input placeholder="Enter the bank code" />
                        </Form.Item>
                    </>
                )}
                <Form.Item
                    name="account_number"
                    label="Account Number"
                >
                    <Input placeholder="Enter the account number" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AccountModal;
