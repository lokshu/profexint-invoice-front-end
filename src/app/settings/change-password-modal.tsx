import React from 'react';
import {Button, Form, Input, Modal} from 'antd';

const ChangePasswordModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: (values: any) => void; }> = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();

    const validatePasswordsMatch = ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
            if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('The two passwords that you entered do not match!'));
        },
    });

    return (
        <Modal
            title="Change Password"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    Change Password
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please enter your current password' }]}
                >
                    <Input.Password placeholder="Enter your current password" />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[{ required: true, message: 'Please enter your new password' }]}
                >
                    <Input.Password placeholder="Enter your new password" />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Please confirm your new password' },
                        validatePasswordsMatch,
                    ]}
                >
                    <Input.Password placeholder="Confirm your new password" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;
