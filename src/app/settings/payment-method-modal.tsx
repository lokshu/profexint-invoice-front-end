import React, { useEffect } from 'react';
import { Button, Form, Input, Modal } from 'antd';

const PaymentMethodModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: (values: any) => void; initialValues?: any }> = ({ visible, onClose, onSubmit, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.resetFields();
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    return (
        <Modal
            title={initialValues ? "Edit Payment Method" : "Create Payment Method"}
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
                    label="Payment Method Name"
                    rules={[{ required: true, message: 'Please enter the payment method name' }]}
                >
                    <Input placeholder="Enter the payment method name" />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea placeholder="Enter the description" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentMethodModal;
