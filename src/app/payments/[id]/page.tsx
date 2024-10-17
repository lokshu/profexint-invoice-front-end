'use client';

import React, { useEffect, useState } from 'react';
import { Show } from '@refinedev/antd';
import { useCustom, useNotification } from '@refinedev/core';
import { Button, Card, Col, Divider, Form, Row, Skeleton, Tag, Typography, List } from 'antd';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { saveAs } from 'file-saver';
import { dataProvider } from '@providers/data-provider';
import { PaymentRecordView } from '@/types/interfaces';

const { Text, Title } = Typography;

const PaymentView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { open } = useNotification();
    const [attachments, setAttachments] = useState<{ id: string, original_filename: string, description: string }[]>([]);
    const [paymentData, setPaymentData] = useState<PaymentRecordView | null>(null);
    const { data, refetch, isLoading } = useCustom<PaymentRecordView>({
        url: `payments/${id}`,
        method: 'get'
    });

    useEffect(() => {
        if (data) {
            setPaymentData(data.data);
            setAttachments(data.data.documents || []);
        }
    }, [data]);

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

    return (
        <Show isLoading={isLoading}>
            {isLoading ? (
                <Skeleton active />
            ) : (
                <Form layout="horizontal" labelCol={{ span: 6 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Card title="Payment Details" bordered={false}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <p><strong>Payment Number:</strong> {paymentData?.payment_number}</p>
                                        <p><strong>Payment Date:</strong> {moment(paymentData?.payment_date).format('YYYY-MM-DD')}</p>
                                        <p>
                                            <strong>Amount:</strong> ${typeof paymentData?.amount === 'number' ? paymentData.amount.toFixed(2) : paymentData?.amount}
                                        </p>
                                    </Col>
                                    <Col span={12}>
                                    <p><strong>Payment Method:</strong> {paymentData?.payment_method_name}</p>
                                        <p><strong>Deposit To:</strong> {paymentData?.deposit_to_name}</p>
                                        <p><strong>Reference Number:</strong> {paymentData?.reference_number}</p>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                        <Col span={24}>
                            <Card title="Invoice Details" bordered={false}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <p>
                                            <strong>Invoice Number:</strong>
                                            <Button type="link" onClick={() => router.push(`/invoices/${paymentData?.invoice_id}`)}>
                                                {paymentData?.invoice_reference_number}
                                            </Button>
                                        </p>
                                        <p><strong>Customer Name:</strong> {paymentData?.customer_display_name}</p>
                                    </Col>
                                    <Col span={12}>
                                        <Button type="primary" icon={<FilePdfOutlined />} onClick={() => { /* Handle download invoice PDF */ }} style={{ float: 'right', marginBottom: '10px' }}>
                                            Download Invoice PDF
                                        </Button>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                        <Col span={24}>
                            <Card title="Attachments" bordered={false}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={attachments}
                                    renderItem={(attachment) => (
                                        <List.Item
                                            key={attachment.id}
                                            actions={[
                                                <Button key={`download-${attachment.id}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => downloadAttachment(attachment.id, attachment.original_filename)} />
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={attachment.original_filename}
                                                description={attachment.description}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Form>
            )}
        </Show>
    );
};

export default PaymentView;
