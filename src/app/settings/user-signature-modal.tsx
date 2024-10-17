import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UserSignatureModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: (values: any) => void; initialValues?: any }> = ({ visible, onClose, onSubmit, initialValues }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        form.resetFields();
        if (initialValues) {
            form.setFieldsValue(initialValues);
            setFileList(initialValues.signature_image ? [{ url: initialValues.signature_image, name: 'Signature' }] : []);
        } else {
            setFileList([]);
        }
    }, [initialValues, form]);

    const handleFileChange = ({ fileList }: any) => {
        setFileList(fileList);
    };

    return (
        <Modal
            title={initialValues ? "Edit Signature" : "Create Signature"}
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
            <Form form={form} layout="vertical" onFinish={(values) => onSubmit({ ...values, signature_image: fileList[0]?.originFileObj })}>
                <Form.Item
                    name="signature_name"
                    label="Signature Name"
                    rules={[{ required: true, message: 'Please enter the signature name' }]}
                >
                    <Input placeholder="Enter the signature name" />
                </Form.Item>
                <Form.Item
                    name="signature_image"
                    label="Signature Image"
                    rules={[{ required: true, message: 'Please upload the signature image' }]}
                >
                    <Upload
                        name="signature"
                        listType="picture"
                        beforeUpload={() => false}
                        fileList={fileList}
                        onChange={handleFileChange}
                    >
                        <Button icon={<UploadOutlined />}>Click to upload</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserSignatureModal;
