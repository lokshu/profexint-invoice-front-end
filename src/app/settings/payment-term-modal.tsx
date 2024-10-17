import React, {useEffect} from 'react';
import {Button, Form, Input, Modal} from 'antd';

const PaymentTermModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: (values: any) => void; initialValues?: any }> = ({ visible, onClose, onSubmit, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.resetFields();
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    return (
        <Modal
            title={initialValues ? "Edit Payment Term" : "Create Payment Term"}
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
                    name="term_name"
                    label="Term Name"
                    rules={[{ required: true, message: 'Please enter the term name' }]}
                >
                    <Input placeholder="Enter the term name" />
                </Form.Item>
                <Form.Item
                    name="days_due"
                    label="Days Due"
                    rules={[{ required: true, message: 'Please enter the days due' }]}
                >
                    <Input type="number" placeholder="Enter the days due" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentTermModal;
