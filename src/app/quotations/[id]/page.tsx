'use client';

import React, { useEffect, useState } from 'react';
import { Show } from '@refinedev/antd';
import { useCustom, useGetIdentity, useNotification } from '@refinedev/core';
import { Button, Card, Col, Divider, Form, List, Row, Tabs, Timeline, Typography, Skeleton, Tag, Table, Space } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileDoneOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { saveAs } from 'file-saver';
import { dataProvider } from '@providers/data-provider';
import ProductsServicesView from '@components/form/product-service-view';
import AdjustmentFieldsView from '@components/form/adjustment-fields-view';
import { Item } from '@/types/interfaces';
import { v4 as uuidv4 } from 'uuid';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

type Status = 'pending' | 'confirmed' | 'cancelled';

const statusColors: { [key in Status]: string } = {
    pending: 'orange',
    confirmed: 'green',
    cancelled: 'red',
};

const getStatusColor = (status: Status): string => statusColors[status] || 'black';

const getStatusTag = (status: Status) => {
    const color = getStatusColor(status);
    return <Tag color={color}>{status.toUpperCase()}</Tag>;
};

const QuotationView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { open } = useNotification();
    const [attachments, setAttachments] = useState<{ id: string, original_filename: string, description: string }[]>([]);
    const [appendices, setAppendices] = useState<{ id: string, original_filename: string, description: string }[]>([]);
    const [activeKey, setActiveKey] = useState<string>('0');
    const [versionMapping, setVersionMapping] = useState<{ [key: string]: number }>({}); // Store version mapping
    const [form] = Form.useForm(); // Initialize form outside the render function

    const { data: identity } = useGetIdentity();
    const { data: quotationData, refetch: refetchQuotationData, isLoading } = useCustom({
        url: `quotations/${id}`,
        method: 'get'
    });

    const calculateTotalAmount = (items: Item[]) => {
        return items.map(item => ({
            ...item,
            total_amount: parseFloat((item.quantity * parseFloat(String(item.unit_price))).toFixed(2))
        }));
    };

    useEffect(() => {
        if (quotationData) {
            setActiveKey('0'); // Default to the latest version
            // Create a mapping of tab keys to version numbers
            const mapping: { [key: string]: number } = {};
            quotationData.data.versions.forEach((version: any, index: number) => {
                mapping[index.toString()] = version.version;
            });
            setVersionMapping(mapping);
        }
    }, [quotationData]);

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

    const downloadQuotationPdf = async (versionNumber: number) => {
        try {
            const response = await dataProvider.getOne({
                resource: `quotation-pdf/${versionNumber}`,
                id,
                meta: {
                    responseType: 'arraybuffer',
                },
            });

            const blob = new Blob([response.data as ArrayBuffer], { type: 'application/pdf' });
            saveAs(blob, `quotation_${quotationData?.data?.reference_number}_v${versionNumber}.pdf`);

            if (open) {
                open({
                    message: 'Quotation PDF downloaded successfully!',
                    type: 'success',
                    description: 'Success',
                });
            }
        } catch (error) {
            console.error('Failed to download the quotation PDF', error);
            if (open) {
                open({
                    message: 'Failed to download the quotation PDF. Please try again.',
                    type: 'error',
                    description: 'Error',
                });
            }
        }
    };

    const formatStatusChangeText = (statusChange: any) => {
        if (statusChange.previous_status === statusChange.new_status) {
            return `${moment(statusChange.change_date).format('YYYY-MM-DD HH:mm:ss')} ${statusChange.changed_by} has created the quotation version ${statusChange.version}`;
        } else {
            return `${moment(statusChange.change_date).format('YYYY-MM-DD HH:mm:ss')} ${statusChange.changed_by} has changed the status from ${statusChange.previous_status} to ${statusChange.new_status} in version ${statusChange.version}`;
        }
    };

    const getStatusDotColor = (status: string) => {
        return getStatusColor(status as Status);
    };

    // Function to handle convert to invoice button click
    const handleConvertToInvoice = () => {
        const selectedVersion = quotationData?.data?.versions.find((version: any) => version.version === versionMapping[activeKey]);
        if (selectedVersion) {
            const dataToSave = {
                ...selectedVersion,
                customer: quotationData?.data?.customer, // Include customer data
                quotation_number: quotationData?.data?.reference_number
            };
            const key = uuidv4(); // Generate a unique key
            localStorage.setItem(key, JSON.stringify(dataToSave)); // Save data to local storage with the key
            router.push(`/invoices/create?key=${key}`); // Navigate with the key
        }
    };

    const invoiceColumns = [
        {
            title: 'Invoice#',
            dataIndex: 'reference_number',
            key: 'reference_number',
            render: (text: string, record: any) => (
                <Button type="link" onClick={() => router.push(`/invoices/${record.id}`)}>
                    {text}
                </Button>
            ),
        },
        {
            title: 'Creation Date',
            dataIndex: 'creation_date',
            key: 'creation_date',
            render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

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
                                        <p><strong>Display Name:</strong> {quotationData?.data?.customer_details.display_name}</p>
                                        <p><strong>Company Name:</strong> {quotationData?.data?.customer_details.company_name}</p>
                                        <p><strong>Primary Contact:</strong> {quotationData?.data?.customer_details.primary_contact}</p>
                                    </Col>
                                    <Col span={12}>
                                        <p><strong>Attention:</strong> {quotationData?.data?.customer_details.billing_address?.attention}</p>
                                        <p><strong>Address Line 1:</strong> {quotationData?.data?.customer_details.billing_address?.address_line1}</p>
                                        <p><strong>Address Line 2:</strong> {quotationData?.data?.customer_details.billing_address?.address_line2}</p>
                                        <p><strong>City:</strong> {quotationData?.data?.customer_details.billing_address?.city}</p>
                                        <p><strong>State:</strong> {quotationData?.data?.customer_details.billing_address?.state}</p>
                                        <p><strong>Zip Code:</strong> {quotationData?.data?.customer_details.billing_address?.zip_code}</p>
                                        <p><strong>Country:</strong> {quotationData?.data?.customer_details.billing_address?.country}</p>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Tabs activeKey={activeKey} onChange={handleTabChange}>
                        {quotationData?.data?.versions.map((version: any, index: number) => {
                            const itemsWithTotalAmount = calculateTotalAmount(version.items);

                            return (
                                <TabPane tab={`Version ${version.version}`} key={index.toString()}>
                                    <Row gutter={16} justify="end" style={{ marginBottom: '16px' }}>
                                        <Col>

                                            {activeKey !== 'status-changes' && activeKey !== 'invoices' && (
                                                <Button type="primary" icon={<FileDoneOutlined/>} onClick={handleConvertToInvoice} style={{ marginRight: '10px' }}>
                                                    Convert to Invoice
                                                </Button>
                                            )}
                                            <Button type="primary" icon={<FilePdfOutlined />} onClick={() => downloadQuotationPdf(version.version)} style={{ marginRight: '10px' }}>
                                                Download v{version.version}
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Quotation#">
                                                <Text>{`${quotationData?.data?.reference_number} v${version.version}`}</Text>
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
                                            <Form.Item label="Quotation Date">
                                                <Text>{moment(version.issue_date).format('YYYY-MM-DD')}</Text>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Expiry Date">
                                                <Text>{moment(version.valid_until).format('YYYY-MM-DD')}</Text>
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

                                    <Row gutter={16}>
                                        <Col span={16}>
                                            <Form.Item label="Signature">
                                                <img src={quotationData?.data?.signature?.signature_image} alt="Signature" style={{ maxWidth: '200px', marginTop: '10px' }} />
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

                                    <Divider orientation="left" orientationMargin="0">
                                        Appendices
                                    </Divider>

                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={version.appendices}
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

                        {quotationData?.data?.invoices?.length > 0 && (
                            <TabPane tab="Invoices" key="invoices">
                                <Table
                                    dataSource={quotationData?.data?.invoices}
                                    columns={invoiceColumns}
                                    rowKey="id"
                                    pagination={false}
                                />
                            </TabPane>
                        )}

                        <TabPane tab="Change History" key="status-changes">
                            <Timeline>
                                {quotationData?.data?.status_changes.length === 0 ? (
                                    <Timeline.Item>No status changes recorded.</Timeline.Item>
                                ) : (
                                    quotationData?.data?.status_changes.map((statusChange: any, index: number) => (
                                        <Timeline.Item key={index} color={getStatusDotColor(statusChange.new_status)}>
                                            {formatStatusChangeText(statusChange)}
                                        </Timeline.Item>
                                    ))
                                )}
                            </Timeline>
                        </TabPane>
                    </Tabs>
                </Form>
            )}
        </Show>
    );
};

export default QuotationView;
