'use client';

import { Create, useForm } from '@refinedev/antd';
import { UploadFile } from 'antd/lib/upload/interface';
import {
    Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Tabs, Typography, Upload, List, Skeleton
} from 'antd';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, UploadOutlined, SettingTwoTone, LoadingOutlined } from '@ant-design/icons';
import {
    AdjustmentEntry, Identity, Item, LatestNumberResponse, PriceAdjustment, InvoicePayload
} from '@/types/interfaces';
import React, { useEffect, useMemo, useState } from 'react';
import { useCustom, useGetIdentity, useNotification } from '@refinedev/core';
import moment from 'moment';
import ProductsServices from '@components/form/product-service-form';
import AdjustmentFields from '@components/form/adjustment-fields';
import { v4 as uuidv4 } from 'uuid';
import { dataProvider } from '@providers/data-provider';
import { useRouter, useSearchParams } from 'next/navigation';

const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const emptyItem: Item = {
    item_detail: '',
    quantity: 0,
    unit_price: 0,
    discount: 0,
    total_amount: 0,
    order: 0
}

const { Text, Title } = Typography;

const InvoiceCreate = () => {
    const { formProps, saveButtonProps, form } = useForm();
    const { open } = useNotification();
    const [attachments, setAttachments] = useState<{ id: string, file: UploadFile, description: string }[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentFile, setCurrentFile] = useState<UploadFile | null>(null);
    const [currentDescription, setCurrentDescription] = useState('');
    const [adjustments, setAdjustments] = useState<AdjustmentEntry[]>([]);
    const [adjustmentOptions, setAdjustmentOptions] = useState<PriceAdjustment[]>([]);
    const [items, setItems] = useState<Item[]>([emptyItem]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const key = searchParams.get('key');

    const { data: identity } = useGetIdentity<Identity>();
    const { data: customersData, isLoading: isLoadingCustomers } = useCustom({
        url: `customers/dropdown`,
        method: 'get',
    });
    const { data: priceAdjustmentsData, isLoading: isLoadingPriceAdjustments } = useCustom<PriceAdjustment[]>({
        url: `price-adjustments`,
        method: 'get',
    });
    const { data: latestNumberData, isLoading: isLoadingLatestNumber } = useCustom<LatestNumberResponse>({
        url: `latest-number/?document_type=INVOICE&user_id=${identity?.id}`,
        method: 'get'
    });
    const { data: paymentTermsData, isLoading: isLoadingPaymentTerms } = useCustom({
        url: `payment-terms/dropdown`,
        method: 'get',
    });

    const { subtotalPrice, totalPrice } = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price) + Number(item.discount || 0)), 0);
        const adjustmentsTotal = adjustments.reduce((acc, adj) => acc + Number(adj.amount || 0), 0);
        const total = subtotal + adjustmentsTotal;

        return { subtotalPrice: subtotal || 0, totalPrice: total || 0 };
    }, [items, adjustments]);

    const invoiceNumberSuffix = (
        isLoadingLatestNumber ? <LoadingOutlined style={{ color: 'rgba(0,0,0,.45)' }} spin /> : <SettingTwoTone
            style={{ fontSize: 16 }}
        />
    );

    useEffect(() => {
        if (priceAdjustmentsData) {
            setAdjustmentOptions(priceAdjustmentsData.data);
        }
    }, [priceAdjustmentsData]);

    useEffect(() => {
        if (latestNumberData && latestNumberData.data.latest_number) {
            form.setFieldsValue({
                invoice: {
                    reference_number: latestNumberData.data.latest_number,
                }
            });
        }
    }, [latestNumberData, form]);

    useEffect(() => {
        if (key) {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                const parsedInvoiceData = JSON.parse(storedData);

                // Map adjustments to use price_adjustment id
                const mappedAdjustments = parsedInvoiceData.adjustments.map((adjustment: any) => ({
                    ...adjustment,
                    price_adjustment: adjustment.price_adjustment.id,
                }));

                const mappedItems = parsedInvoiceData.items.map((item: any) => ({
                    ...item,
                    total_amount: parseFloat((item.quantity * parseFloat(String(item.unit_price))).toFixed(2)),
                }));

                form.setFieldsValue({
                    invoice: {
                        issue_date: moment(parsedInvoiceData.issue_date),
                        expiry_date: moment(parsedInvoiceData.valid_until),
                        customer: parsedInvoiceData.customer || null,
                        customer_notes: parsedInvoiceData.customer_notes || '',
                        terms_conditions: parsedInvoiceData.terms_conditions || '',
                        quotation: parsedInvoiceData.quotation,
                        quotation_number: parsedInvoiceData.quotation_number,
                    },
                    items: mappedItems,
                    adjustments: mappedAdjustments,
                    attachments: parsedInvoiceData.attachments.map((attachment: any) => ({
                        id: attachment.id,
                        file: { uid: attachment.id, name: attachment.original_filename, originFileObj: null },
                        description: attachment.description,
                    })),
                });

                setItems(mappedItems);
                setAdjustments(mappedAdjustments);
                // Attachments should not be copied from the quotation
                // setAttachments(parsedInvoiceData.attachments);
            }
        }
    }, [key, form]);

    const showUploadModal = () => {
        setIsModalVisible(true);
    };

    const handleFileUpload = async () => {
        if (currentFile) {
            const formData = new FormData();
            const referenceNumber = form.getFieldValue(['invoice', 'reference_number']);
            formData.append('file', currentFile as unknown as Blob);
            formData.append('description', currentDescription);
            formData.append('document_type', 'invoice');
            formData.append('reference_number', referenceNumber);
            formData.append('original_filename', currentFile.name);

            try {
                const { data } = await dataProvider.create({
                    resource: 'document-attachments/upload',
                    variables: formData,
                });

                if (typeof data.id === 'string') {
                    setAttachments([...attachments, { id: data.id, file: currentFile, description: currentDescription }]);
                    setCurrentFile(null);
                    setCurrentDescription('');
                    setIsModalVisible(false);

                    if (open) {
                        open({
                            message: 'File uploaded successfully!',
                            type: 'success',
                        });
                    }
                } else {
                    throw new Error('File upload failed: Invalid ID returned');
                }
            } catch (error) {
                if (open) {
                    open({
                        message: 'Failed to upload the file. Please try again.',
                        type: 'error',
                    });
                }
            }
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFileChange = (info: UploadFile): void => {
        setCurrentFile(info);
    };

    const removeAttachment = (file: UploadFile) => {
        setAttachments(attachments.filter(att => att.file.uid !== file.uid));
    };

    const handleSubmit = async (values: any) => {
        if (items.length === 0) {
            if (open) {
                open({
                    message: 'Please add at least one item to the invoice.',
                    type: 'error',
                    description: 'Validation Error',
                });
            }
            return;
        }

        if (items.some(item => item.quantity <= 0 || item.unit_price <= 0)) {
            if (open) {
                open({
                    message: 'Please check your items for valid quantities and prices.',
                    type: 'error',
                    description: 'Validation Error',
                });
            }
            return;
        }

        if (adjustments.some(adj => adj.amount == 0)) {
            if (open) {
                open({
                    message: 'Please check your adjustments for valid amounts.',
                    type: 'error',
                    description: 'Validation Error',
                });
            }
            return;
        }

        const issueDate = moment.isMoment(values.invoice.issue_date)
            ? values.invoice.issue_date
            : moment(values.invoice.issue_date.toDate());

        const expiryDate = moment.isMoment(values.invoice.expiry_date)
            ? values.invoice.expiry_date
            : moment(values.invoice.expiry_date.toDate());

        if (!expiryDate.isValid() || !issueDate.isValid()) {
            if (open) {
                open({
                    message: 'Please enter valid dates for the invoice.',
                    type: 'error',
                    description: 'Validation Error',
                });
            }
            return;
        }

        if (expiryDate.isSameOrBefore(issueDate)) {
            if (open) {
                open({
                    message: 'The expiry date must be later than the issue date.',
                    type: 'error',
                    description: 'Validation Error',
                });
            }
            return;
        }

        const formattedIssueDate = issueDate.format('YYYY-MM-DD');
        const formattedExpiryDate = expiryDate.format('YYYY-MM-DD');

        const newAdjustments = adjustments
            .filter(adj => adj.price_adjustment?.startsWith('new-'))
            .map(adj => {
                const newName = adjustmentOptions.find(option => option.id === adj.price_adjustment)?.name || 'New Adjustment';
                const newUUID = uuidv4();
                return {
                    id: newUUID,
                    name: newName,
                    oldId: adj.price_adjustment
                };
            });

        const updatedAdjustments = adjustments.map(adj => {
            const foundNewAdj = newAdjustments.find(newAdj => newAdj.oldId === adj.price_adjustment);
            if (foundNewAdj) {
                return { ...adj, price_adjustment: foundNewAdj.id };
            }
            return adj;
        });

        const payload: InvoicePayload = {
            ...values.invoice,
            issue_date: formattedIssueDate,
            expiry_date: formattedExpiryDate,
            items,
            adjustments: updatedAdjustments,
            new_adjustments: newAdjustments.map(adj => ({
                id: adj.id,
                name: adj.name
            })),
            attachments: attachments.map(att => (att.id)),
        };

        try {
            const { data } = await dataProvider.create({
                resource: 'invoices',
                variables: payload,
            });

            if (open) {
                open({
                    message: 'Invoice created successfully!',
                    type: 'success',
                    description: 'Success',
                });
            }
            // Redirect to the newly created invoice
            router.push(`/invoices/${data.invoice}`);
        } catch (error) {
            if (error instanceof Response) {
                const errorData = await error.json();
                const errorMessages = Object.entries(errorData).map(([key, value]) => {
                    if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
                        return `${key}: ${value.join(', ')}`;
                    }
                    return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`;
                }).join('\n');
                if (open) {
                    open({
                        message: errorMessages,
                        type: 'error',
                        description: 'Error creating invoice',
                    });
                }
            } else {
                if (open) {
                    open({
                        message: 'Failed to create the invoice. Please try again.',
                        type: 'error',
                        description: 'Error creating invoice',
                    });
                }
            }
        }
    };

    return (
        <Create saveButtonProps={saveButtonProps} title={'New Invoice'}>
            {(isLoadingCustomers || isLoadingPriceAdjustments || isLoadingLatestNumber) ? (
                <Skeleton active />
            ) : (
                <Form {...formProps} layout="horizontal" labelCol={{ span: 6 }} form={form} onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={10}>
                            <Form.Item label="Customer" name={['invoice', 'customer']} rules={[{ required: true, message: 'Please select a customer!' }]}>
                                <Select showSearch placeholder="Select a customer" optionLabelProp="label" optionFilterProp="children" filterOption={(input, option) =>
                                    option?.children
                                        ? React.isValidElement(option.children)
                                            ? false
                                            : option.children.toString().toLowerCase().includes(input.toLowerCase())
                                        : false
                                } loading={isLoadingCustomers}>
                                    {customersData?.data?.map((customer: any) => (
                                        <Option key={customer.id} value={customer.id} label={customer.display_name}>
                                            <div>
                                                <div>{customer.display_name}</div>
                                                <div style={{ fontSize: 'smaller', color: '#888' }}>{customer.company_name}</div>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                        <Col span={10}>
                            <Form.Item label="Invoice#" name={['invoice', 'reference_number']} rules={[{ required: true, message: 'Please enter an invoice number!' }]}>
                                <Input suffix={invoiceNumberSuffix} />
                            </Form.Item>
                        </Col>

                        {key && (
                            <Col span={10}>
                                <Form.Item label="Quotation#" name={['invoice', 'quotation_number']}>
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>

                    <Row gutter={16}>
                        <Col span={10}>
                            <Form.Item label="Payment Terms" name={['invoice', 'payment_term']} rules={[{ required: true, message: 'Please select payment terms!' }]}>
                                <Select showSearch placeholder="Select payment terms" optionLabelProp="label" optionFilterProp="children" filterOption={(input, option) =>
                                    option?.children
                                        ? React.isValidElement(option.children)
                                            ? false
                                            : option.children.toString().toLowerCase().includes(input.toLowerCase())
                                        : false
                                } loading={isLoadingPaymentTerms}>
                                    {paymentTermsData?.data?.map((term: any) => (
                                        <Option key={term.id} value={term.id} label={term.term_name}>
                                            {term.term_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={10}>
                            <Form.Item label="Invoice Date" name={['invoice', 'issue_date']} rules={[{ required: true, message: 'Please enter an invoice date!' }]}>
                                <DatePicker placeholder="Select a date" />
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} label="Expiry Date" name={['invoice', 'expiry_date']} rules={[{ required: true, message: 'Please enter an expiry date!' }]}>
                                <DatePicker placeholder="Select a date" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Hidden Field for Quotation */}
                    <Form.Item name={['invoice', 'quotation']} hidden>
                        <Input />
                    </Form.Item>

                    <ProductsServices items={items} setItems={setItems} isLoading={false} />

                    <Divider />

                    <Row justify="end" style={{ marginTop: 20, marginRight: 30 }}>
                        <Col span={10}>
                            <Card bordered={false} style={{ width: '100%', backgroundColor: '#f8f8fa' }}>
                                <Row>
                                    <Col span={12}>
                                        <Text strong>Sub Total:</Text>
                                    </Col>
                                    <Col span={12} style={{ textAlign: 'right' }}>
                                        <Text strong>{`$${subtotalPrice.toFixed(2)}`}</Text>
                                    </Col>
                                </Row>
                                <Divider />
                                <AdjustmentFields adjustments={adjustments} setAdjustments={setAdjustments} adjustmentOptions={adjustmentOptions} setAdjustmentOptions={setAdjustmentOptions} isLoading={isLoadingPriceAdjustments} form={form} />
                                <Divider />
                                <Row>
                                    <Col span={12}>
                                        <Title level={3}>Total:</Title>
                                    </Col>
                                    <Col span={12} style={{ textAlign: 'right' }}>
                                        <Title level={3}>{`$${totalPrice.toFixed(2)}`}</Title>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Extra Details" key="1">
                            <Row gutter={16}>
                                <Col span={14}>
                                    <Form.Item label="Customer Notes" name={['invoice', 'customer_notes']}>
                                        <Input.TextArea rows={4} placeholder="Enter any notes related to the customer" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={14}>
                                    <Form.Item label="Terms and Conditions" name={['invoice', 'terms_conditions']}>
                                        <Input.TextArea rows={4} placeholder="Enter terms and conditions" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="Attachments" key="2">
                            <Button type="primary" icon={<PlusOutlined />} onClick={showUploadModal} style={{ marginBottom: 16 }}>
                                Add Attachment
                            </Button>
                            <List
                                itemLayout="horizontal"
                                dataSource={attachments}
                                renderItem={(attachment, index) => (
                                    <List.Item
                                        key={index}
                                        actions={[
                                            <Button key={`download-${index}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => {
                                                const blob = new Blob([attachment.file.originFileObj as BlobPart], { type: attachment.file.type });
                                                const link = document.createElement('a');
                                                link.href = URL.createObjectURL(blob);
                                                link.download = attachment.file.name;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }} />,
                                            <Button key={`delete-${index}`} type="link" icon={<DeleteOutlined />} style={{ color: 'red' }} onClick={() => removeAttachment(attachment.file)} />
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={attachment.file.name}
                                            description={attachment.description}
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                    </Tabs>
                </Form>
            )}

            <Modal title="Upload Attachment" visible={isModalVisible} onOk={handleFileUpload} onCancel={handleCancel}>
                <Dragger beforeUpload={file => { onFileChange(file); return false; }} showUploadList={false}>
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                </Dragger>
                {currentFile && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ marginRight: 8 }}>Selected file:</Text>
                            <Text code>{currentFile.name}</Text>
                        </div>
                        <Input.TextArea rows={4} placeholder="Enter description" value={currentDescription} onChange={e => setCurrentDescription(e.target.value)} style={{ marginTop: 16 }} />
                    </div>
                )}
            </Modal>
        </Create>
    );
};

export default InvoiceCreate;
