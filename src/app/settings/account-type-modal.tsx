import React, { useEffect } from 'react';
import { Button, Form, Input, Modal, Checkbox } from 'antd';

const AccountTypeModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: (values: any) => void; initialValues?: any }> = ({ visible, onClose, onSubmit, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.resetFields();
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    return (
        <Modal
            title={initialValues ? "Edit Account Type" : "Create Account Type"}
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
                    name="name"
                    label="Account Type Name"
                    rules={[{ required: true, message: 'Please enter the account type name' }]}
                >
                    <Input placeholder="Enter the account type name" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea placeholder="Enter the description" />
                </Form.Item>
                <Form.Item
                    name="is_bank_account"
                    valuePropName="checked"
                >
                    <Checkbox>Is Bank Account</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AccountTypeModal;
