'use client';

import React, { useEffect, useState } from 'react';
import { Show } from '@refinedev/antd';
import { useCustom, useGetIdentity, useNotification } from '@refinedev/core';
import { Button, Card, Col, Divider, Form, List, Row, Tabs, Timeline, Typography, Skeleton, Tag, Table } from 'antd';
import { DownloadOutlined, FilePdfOutlined, DollarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { saveAs } from 'file-saver';
import { dataProvider } from '@providers/data-provider';
import ProductsServicesView from '@components/form/product-service-view';
import AdjustmentFieldsView from '@components/form/adjustment-fields-view';
import PaymentFormModal from './payment-modal';
import { Item, PaymentRecord } from '@/types/interfaces';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

type Status = 'pending' | 'paid' | 'partial_paid' | 'cancelled';

const statusColors: { [key in Status]: string } = {
    pending: 'orange',
    paid: 'green',
    partial_paid: 'blue',
    cancelled: 'red',
};

const getStatusColor = (status: Status): string => statusColors[status] || 'black';

const getStatusTag = (status: Status) => {
    const color = getStatusColor(status);
    return <Tag color={color}>{status.split('_').map(word => word.toUpperCase()).join(' ')}</Tag>;
};

const InvoiceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { open } = useNotification();
    const [attachments, setAttachments] = useState<{ id: string, original_filename: string, description: string }[]>([]);
    const [activeKey, setActiveKey] = useState<string>('0');
    const [versionMapping, setVersionMapping] = useState<{ [key: string]: number }>({}); // Store version mapping
    const [form] = Form.useForm(); // Initialize form outside the render function
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number>(1); // Store the selected version
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [paymentPagination, setPaymentPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const { data: identity } = useGetIdentity();
    const { data: invoiceData, refetch: refetchInvoiceData, isLoading } = useCustom({
        url: `invoices/${id}`,
        method: 'get'
    });

    const { data: paymentsData, refetch: refetchPayments } = useCustom({
        url: `payments/?invoice=${id}`,
        method: 'get',
        config: {
            filters: [
                {
                    field: 'invoice',
                    operator: 'eq',
                    value: id,
                }
            ]
        }
    });

    const calculateTotalAmount = (items: Item[]) => {
        return items.map(item => ({
            ...item,
            total_amount: parseFloat((item.quantity * parseFloat(String(item.unit_price))).toFixed(2))
        }));
    };

    useEffect(() => {
        if (paymentsData) {
            setPayments(paymentsData.data.results);
            setPaymentPagination({
                current: paymentsData.data.page,
                pageSize: paymentsData.data.pageSize,
                total: paymentsData.data.total,
            });
        }
    }, [paymentsData]);

    useEffect(() => {
        if (invoiceData) {
            setActiveKey('0'); // Default to the latest version
            // Create a mapping of tab keys to version numbers
            const mapping: { [key: string]: number } = {};
            invoiceData.data.versions.forEach((version: any, index: number) => {
                mapping[index.toString()] = version.version;
            });
            setVersionMapping(mapping);
        }
    }, [invoiceData]);

    const handleTabChange = (key: string) => {
        setActiveKey(key);
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

    const downloadInvoicePdf = async (versionNumber: number) => {
        try {
            const response = await dataProvider.getOne({
                resource: `invoice-pdf/${versionNumber}`,
                id,
                meta: {
                    responseType: 'arraybuffer',
                },
            });

            const blob = new Blob([response.data as ArrayBuffer], { type: 'application/pdf' });
            saveAs(blob, `invoice_${invoiceData?.data?.reference_number}_v${versionNumber}.pdf`);

            if (open) {
                open({
                    message: 'Invoice PDF downloaded successfully!',
                    type: 'success',
                    description: 'Success',
                });
            }
        } catch (error) {
            console.error('Failed to download the invoice PDF', error);
            if (open) {
                open({
                    message: 'Failed to download the invoice PDF. Please try again.',
                    type: 'error',
                    description: 'Error',
                });
            }
        }
    };

    const formatStatusChangeText = (statusChange: any) => {
        if (statusChange.previous_status === statusChange.new_status) {
            return `${moment(statusChange.change_date).format('YYYY-MM-DD HH:mm:ss')} ${statusChange.changed_by} has created the invoice version ${statusChange.version}`;
        } else {
            return `${moment(statusChange.change_date).format('YYYY-MM-DD HH:mm:ss')} ${statusChange.changed_by} has changed the status from ${statusChange.previous_status} to ${statusChange.new_status} in version ${statusChange.version}`;
        }
    };

    const getStatusDotColor = (status: string) => {
        return getStatusColor(status as Status);
    };

    const showPaymentModal = (versionId: number) => {
        setSelectedVersionId(versionId);
        setIsPaymentModalVisible(true);
    };

    const closePaymentModal = () => {
        setIsPaymentModalVisible(false);
    };

    return (
        <Show isLoading={isLoading}>
            {isLoading ? (
                <Skeleton active />
            ) : (
                <Form layout="horizontal" labelCol={{ span: 6 }} form={form}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Card title="Customer Details" bordered={false}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <p><strong>Display Name:</strong> {invoiceData?.data?.customer_details.display_name}</p>
                                        <p><strong>Company Name:</strong> {invoiceData?.data?.customer_details.company_name}</p>
                                        <p><strong>Primary Contact:</strong> {invoiceData?.data?.customer_details.primary_contact}</p>
                                    </Col>
                                    <Col span={12}>
                                        <p><strong>Attention:</strong> {invoiceData?.data?.customer_details.billing_address?.attention}</p>
                                        <p><strong>Address Line 1:</strong> {invoiceData?.data?.customer_details.billing_address?.address_line1}</p>
                                        <p><strong>Address Line 2:</strong> {invoiceData?.data?.customer_details.billing_address?.address_line2}</p>
                                        <p><strong>City:</strong> {invoiceData?.data?.customer_details.billing_address?.city}</p>
                                        <p><strong>State:</strong> {invoiceData?.data?.customer_details.billing_address?.state}</p>
                                        <p><strong>Zip Code:</strong> {invoiceData?.data?.customer_details.billing_address?.zip_code}</p>
                                        <p><strong>Country:</strong> {invoiceData?.data?.customer_details.billing_address?.country}</p>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Tabs activeKey={activeKey} onChange={handleTabChange}>
                        {invoiceData?.data?.versions.map((version: any, index: number) => {
                            const itemsWithTotalAmount = calculateTotalAmount(version.items);

                            return (
                                <TabPane tab={`Version ${version.version}`} key={index.toString()}>
                                    {invoiceData?.data?.quotation && invoiceData?.data?.quotation_reference_number ? (
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item label="Quotation#">
                                                    <Button type="link" onClick={() => router.push(`/quotations/${invoiceData.data.quotation}`)}>
                                                        {invoiceData.data.quotation_reference_number}
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Button type="primary" icon={<FilePdfOutlined />} onClick={() => downloadInvoicePdf(version.version)} style={{ float: 'right', marginBottom: '10px' }}>
                                                    Download v{version.version}
                                                </Button>
                                                <Button type="default" icon={<DollarOutlined />} onClick={() => showPaymentModal(version.version)} style={{ float: 'right', marginRight: '10px' }}>
                                                    Record Payment
                                                </Button>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row gutter={16}>
                                            <Col span={24}>
                                                <Button type="primary" icon={<FilePdfOutlined />} onClick={() => downloadInvoicePdf(version.version)} style={{ float: 'right', marginBottom: '10px' }}>
                                                    Download v{version.version}
                                                </Button>
                                                <Button type="default" icon={<DollarOutlined />} onClick={() => showPaymentModal(version.version)} style={{ float: 'right', marginRight: '10px' }}>
                                                    Record Payment
                                                </Button>
                                            </Col>
                                        </Row>
                                    )}

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Invoice#">
                                                <Text>{`${invoiceData?.data?.reference_number} v${version.version}`}</Text>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Status">
                                                {getStatusTag(version.status)}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Invoice Date">
                                                <Text>{moment(version.issue_date).format('YYYY-MM-DD')}</Text>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Expiry Date">
                                                <Text>{moment(version.valid_until).format('YYYY-MM-DD')}</Text>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {/* Add Payment Term Display */}
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Payment Term">
                                                <Text>{version.payment_term_name || 'N/A'}</Text>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <ProductsServicesView items={itemsWithTotalAmount} isLoading={false} />

                                    <Divider />

                                    <Row justify="end" style={{ marginTop: 20, marginRight: 30 }}>
                                        <Col span={8}>
                                            <Card bordered={false} style={{ width: '100%', backgroundColor: '#f8f8fa' }}>
                                                <Row>
                                                    <Col span={12}>
                                                        <Text strong>Sub Total:</Text>
                                                    </Col>
                                                    <Col span={12} style={{ textAlign: 'right' }}>
                                                        <Text strong>{`$${Number(version.subtotal_price).toFixed(2)}`}</Text>
                                                    </Col>
                                                </Row>

                                                {version.adjustments.length > 0 && (
                                                    <>
                                                        <Divider />
                                                        <AdjustmentFieldsView adjustments={version.adjustments} />
                                                    </>
                                                )}

                                                {version.adjustments.length === 0 && <Divider />}

                                                <Row>
                                                    <Col span={12}>
                                                        <Title level={3}>Total:</Title>
                                                    </Col>
                                                    <Col span={12} style={{ textAlign: 'right' }}>
                                                        <Title level={3}>{`$${Number(version.total_price).toFixed(2)}`}</Title>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Row gutter={16}>
                                        <Col span={16}>
                                            <Form.Item label="Customer Notes">
                                                <Text style={{ whiteSpace: 'pre-wrap' }}>{version.customer_notes}</Text>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={16}>
                                            <Form.Item label="Terms and Conditions">
                                                <Text style={{ whiteSpace: 'pre-wrap' }}>{version.terms_conditions}</Text>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider orientation="left" orientationMargin="0">
                                        Attachments
                                    </Divider>

                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={version.attachments}
                                                renderItem={(attachment: { id: string, original_filename: string, description: string }, index: number) => (
                                                    <List.Item
                                                        key={index}
                                                        actions={[
                                                            <Button key={`download-${index}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => downloadAttachment(attachment.id, attachment.original_filename)} />
                                                        ]}
                                                    >
                                                        <List.Item.Meta
                                                            title={attachment.original_filename}
                                                            description={attachment.description}
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </Col>
                                    </Row>
                                </TabPane>
                            );
                        })}
                        <TabPane tab="Payments" key="payments">
                            <Table
                                dataSource={payments}
                                pagination={{
                                    current: paymentPagination.current,
                                    pageSize: paymentPagination.pageSize,
                                    total: paymentPagination.total,
                                    onChange: (page, pageSize) => {
                                        setPaymentPagination({ ...paymentPagination, current: page, pageSize });
                                        refetchPayments();
                                    },
                                }}
                                rowKey="id"
                            >
                                <Table.Column title="Payment Date" dataIndex="payment_date" key="payment_date" render={(text) => moment(text).format('YYYY-MM-DD')} />
                                <Table.Column
                                    title="Payment Number"
                                    dataIndex="payment_number"
                                    key="payment_number"
                                    render={(text, record: PaymentRecord) => (
                                        <Button type="link" onClick={() => router.push(`/payments/${record.id}`)}>
                                            {text}
                                        </Button>
                                    )}
                                />
                                <Table.Column title="Payment Method" dataIndex="payment_method_name" key="payment_method_name" />
                                <Table.Column title="Deposit To" dataIndex="deposit_to_name" key="deposit_to_name" />
                                <Table.Column title="Amount" dataIndex="amount" key="amount" />
                            </Table>
                        </TabPane>

                        <TabPane tab="Change History" key="status-changes">
                            <Timeline>
                                {invoiceData?.data?.status_changes.length === 0 ? (
                                    <Timeline.Item>No status changes recorded.</Timeline.Item>
                                ) : (
                                    invoiceData?.data?.status_changes.map((statusChange: any, index: number) => (
                                        <Timeline.Item key={index} color={getStatusDotColor(statusChange.new_status)}>
                                            {formatStatusChangeText(statusChange)}
                                        </Timeline.Item>
                                    ))
                                )}
                            </Timeline>
                        </TabPane>
                    </Tabs>
                    <PaymentFormModal
                        visible={isPaymentModalVisible}
                        onClose={closePaymentModal}
                        invoiceId={id}
                        invoiceVersionId={selectedVersionId}
                        refetchPayments={refetchPayments}
                        refetchInvoice={refetchInvoiceData}
                    />
                </Form>
            )}
        </Show>
    );
};

export default InvoiceView;
