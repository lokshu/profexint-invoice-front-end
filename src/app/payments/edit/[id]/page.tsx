'use client';

import { Form, Input, DatePicker, Select, Button, Upload, InputNumber, Row, Col, Card, Divider, List, Skeleton, Typography } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { dataProvider } from '@providers/data-provider';
import { Identity } from '@/types/interfaces';
import { useCustom, useGetIdentity, useNotification } from '@refinedev/core';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';
import { saveAs } from 'file-saver';

const { Option } = Select;
const { Dragger } = Upload;
const { Title } = Typography;

const PaymentEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { open } = useNotification();
    const [form] = Form.useForm();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [paymentData, setPaymentData] = useState<any>(null);

    const { data: identity } = useGetIdentity<Identity>();
    const { data: paymentNumberData, isLoading: isLoadingPaymentNumber } = useCustom({
        url: `latest-number/?document_type=RECEIPT&user_id=${identity?.id}`,
        method: 'get',
    });

    interface PaymentMethod {
        id: string;
        name: string;
    }

    interface Account {
        id: string;
        name: string;
    }

    interface Attachment {
        id: string;
        name: string;
    }

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            const response = await dataProvider.getList<PaymentMethod>({ resource: 'payment-methods/dropdown' });
            setPaymentMethods(response.data);
        };

        const fetchAccounts = async () => {
            const response = await dataProvider.getList<Account>({ resource: 'accounts/dropdown' });
            setAccounts(response.data);
        };

        const fetchPaymentDetails = async () => {
            const response = await dataProvider.getOne({ resource: 'payments', id });
            setPaymentData(response.data);
            form.setFieldsValue({
                payment_number: response.data.payment_number,
                payment_date: response.data.payment_date ? moment(response.data.payment_date) : null,
                amount: response.data.amount,
                payment_method: response.data.payment_method,
                deposit_to: response.data.deposit_to,
                reference_number: response.data.reference_number,
                notes: response.data.notes,
            });
            setInvoiceNumber(response.data.invoice_reference_number);
            setUploadedAttachments(response.data.documents.map((doc: any) => ({ id: doc.id, name: doc.original_filename })));
        };

        fetchPaymentMethods();
        fetchAccounts();
        fetchPaymentDetails();
    }, [id, form]);

    const handleUpload = async (options: any) => {
        const { onSuccess, onError, file } = options;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', 'payment');
        formData.append('reference_number', invoiceNumber);

        try {
            const response = await dataProvider.create({
                resource: 'document-attachments/upload',
                variables: formData,
            });

            setUploadedAttachments([...uploadedAttachments, { id: response.data.id as string, name: file.name }]);
            onSuccess("Ok");
        } catch (err) {
            console.error("Error uploading file: ", err);
            onError({ err });
        }
    };

    const handleFinish = async (values: any) => {
        const { documents, payment_date, ...rest } = values;
        const payload = {
            ...rest,
            payment_date: payment_date ? payment_date.format('YYYY-MM-DD') : null,
            documents: uploadedAttachments.map(attachment => attachment.id),
        };

        try {
            await dataProvider.update({
                resource: 'payments',
                id,
                variables: payload,
            });

            if (open) {
                open({
                    message: 'Payment updated successfully!',
                    type: 'success',
                    description: 'Success',
                });
            }

            router.push(`/payments/${id}`);
        } catch (error) {
            console.error('Failed to update payment', error);
            if (open) {
                open({
                    message: 'Failed to update payment. Please try again.',
                    type: 'error',
                    description: 'Error',
                });
            }
        }
    };

    const downloadAttachment = async (fileId: string, fileName: string) => {
        try {
            const response = await dataProvider.getOne({
                resource: 'document-attachments',
                id: fileId,
                meta: {
                    responseType: 'arraybuffer',
                },
            });

            const blob = new Blob([response.data as ArrayBuffer], { type: 'application/pdf' });
            saveAs(blob, fileName);

            if (open) {
                open({
                    message: 'File downloaded successfully!',
                    type: 'success',
                    description: 'Success',
                });
            }
        } catch (error) {
            console.error('Failed to download the file', error);
            if (open) {
                open({
                    message: 'Failed to download the file. Please try again.',
                    type: 'error',
                    description: 'Error',
                });
            }
        }
    };

    const removeAttachment = (file: any) => {
        setUploadedAttachments(uploadedAttachments.filter(att => att.name !== file.name));
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Edit Payment</Title>
            <Divider />
            {paymentData ? (
                <Form form={form} onFinish={handleFinish} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card title="Payment Details" bordered={false}>
                                <Form.Item label="Payment Number">
                                    <Input value={paymentNumberData?.data.latest_number} readOnly />
                                </Form.Item>
                                <Form.Item label="Invoice Number">
                                    <Input value={invoiceNumber} readOnly />
                                </Form.Item>
                                <Form.Item name="payment_date" label="Payment Date" rules={[{ required: true }]}>
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                                <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                                <Form.Item name="payment_method" label="Payment Method" rules={[{ required: true }]}>
                                    <Select>
                                        {paymentMethods.map((method: any) => (
                                            <Option key={method.id} value={method.id}>
                                                {method.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="deposit_to" label="Deposit To">
                                    <Select>
                                        {accounts.map((account: any) => (
                                            <Option key={account.id} value={account.id}>
                                                {account.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="reference_number" label="Reference Number">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="notes" label="Notes">
                                    <Input.TextArea />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Upload Documents" bordered={false}>
                                <Form.Item name="documents">
                                    <Dragger
                                        name="files"
                                        multiple={true}
                                        customRequest={handleUpload}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                    </Dragger>
                                </Form.Item>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={uploadedAttachments}
                                    renderItem={(attachment, index) => (
                                        <List.Item
                                            key={index}
                                            actions={[
                                                <Button key={`download-${index}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => downloadAttachment(attachment.id, attachment.name)} />,
                                                <Button key={`delete-${index}`} type="link" icon={<DeleteOutlined />} style={{ color: 'red' }} onClick={() => removeAttachment({ name: attachment.name } as any)} />
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={attachment.name}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Divider />
                    <Row justify="end">
                        <Button type="primary" htmlType="submit">
                            Save Payment
                        </Button>
                    </Row>
                </Form>
            ) : (
                <Skeleton active />
            )}
        </div>
    );
};

export default PaymentEdit;
