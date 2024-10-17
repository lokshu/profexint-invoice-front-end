'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { Button, Card, Col, DatePicker, Divider, Dropdown, Form, Input, List, Menu, Modal, Row, Select, Tabs, Typography, Upload, Skeleton } from 'antd';
import {
    LoadingOutlined,
    SettingTwoTone,
    UploadOutlined,
    DownOutlined,
    PlusOutlined,
    DownloadOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import {
    AdjustmentEntry,
    Identity,
    Item,
    PriceAdjustment,
    InvoicePayload
} from '@/types/interfaces';
import { useCustom, useGetIdentity, useNotification } from '@refinedev/core';
import moment from 'moment';
import ProductsServices from '@components/form/product-service-form';
import AdjustmentFields from '@components/form/adjustment-fields';
import { v4 as uuidv4 } from 'uuid';
import { dataProvider } from '@providers/data-provider';
import { useParams, useRouter } from 'next/navigation';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { Dragger } = Upload;
import { saveAs } from 'file-saver';

const emptyItem: Item = {
    item_detail: '',
    quantity: 0,
    unit_price: 0,
    discount: 0,
    total_amount: 0,
    order: 0
}

type Status = 'pending' | 'paid' | 'partial_paid' | 'cancelled';

const statusColors = {
    pending: 'orange',
    paid: 'green',
    partial_paid: 'blue',
    cancelled: 'red',
};

const getStatusColor = (status: Status): string => statusColors[status] || 'black';

const InvoiceEdit = () => {
    const { id } = useParams();
    const router = useRouter();
    const { formProps, form } = useForm();
    const { open } = useNotification();
    const [attachments, setAttachments] = useState<{ id: string, file: UploadFile, description: string }[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentFile, setCurrentFile] = useState<UploadFile | null>(null);
    const [currentDescription, setCurrentDescription] = useState('');
    const [adjustments, setAdjustments] = useState<AdjustmentEntry[]>([]);
    const [adjustmentOptions, setAdjustmentOptions] = useState<PriceAdjustment[]>([]);
    const [items, setItems] = useState<Item[]>([emptyItem]);
    const [activeVersion, setActiveVersion] = useState<number>(0);

    const { data: identity } = useGetIdentity<Identity>();

    const { data: customersData, isLoading } = useCustom({
        url: `customers/dropdown`,
        method: 'get',
    });

    const { data: priceAdjustmentsData, isLoading: isLoadingPriceAdjustments } = useCustom<PriceAdjustment[]>({
        url: `price-adjustments`,
        method: 'get',
    });

    const { data: invoiceData, isLoading: isLoadingInvoiceData, refetch: refetchInvoiceData } = useCustom({
        url: `invoices/${id}`,
        method: 'get'
    });

    const { data: paymentTermsData, isLoading: isLoadingPaymentTerms } = useCustom({
        url: `payment-terms/dropdown`,
        method: 'get',
    });


    useEffect(() => {
        console.log('invoice data loaded!!!!!')
        if (invoiceData) {
            console.log('invoice data loaded!!!!!22222')
            const { data } = invoiceData;
            const latestVersion = data.versions[0]; // Get the latest version

            form.setFieldsValue({
                invoice: {
                    customer: data.customer,
                    reference_number: data.reference_number,
                    issue_date: moment(latestVersion.issue_date),
                    expiry_date: moment(latestVersion.valid_until),
                    customer_notes: latestVersion.customer_notes,
                    terms_conditions: latestVersion.terms_conditions,
                    payment_term: latestVersion.payment_term,
                    status: latestVersion.status,
                    quotation: data.quotation,
                }
            });

            // Calculate total_amount for each item and set items
            const itemsWithTotalAmount = latestVersion.items.map((item: Item) => ({
                ...item,
                total_amount: item.quantity * item.unit_price
            }));
            setItems(itemsWithTotalAmount);

            const formattedAdjustments = latestVersion.adjustments.map((adj: any) => ({
                price_adjustment: adj.price_adjustment.id,
                amount: parseFloat(adj.amount),
                order: adj.order
            }));

            setAdjustments(formattedAdjustments);

            setAttachments(latestVersion.attachments.map((file: any) => ({
                id: file.id,
                file: { uid: file.id, name: file.original_filename, url: file.file } as UploadFile,
                description: file.description,
            })));
            setActiveVersion(0); // Default to the latest version
        }
    }, [invoiceData, form]);

    const { subtotalPrice, totalPrice } = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price) + Number(item.discount || 0)), 0);
        const adjustmentsTotal = adjustments.reduce((acc, adj) => acc + Number(adj.amount || 0), 0);
        const total = subtotal + adjustmentsTotal;

        return { subtotalPrice: subtotal || 0, totalPrice: total || 0 };
    }, [items, adjustments]);


    const invoiceNumberSuffix = (
        isLoadingInvoiceData ? <LoadingOutlined style={{ color: 'rgba(0,0,0,.45)' }} spin /> : <SettingTwoTone style={{ fontSize: 16 }} />
    );

    useEffect(() => {
        if (priceAdjustmentsData) {
            setAdjustmentOptions(priceAdjustmentsData.data);
        }
    }, [priceAdjustmentsData]);

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

    const onFileChange = (info: UploadChangeParam<UploadFile>): void => {
        setCurrentFile(info.file);
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

    const removeAttachment = (file: UploadFile) => {
        setAttachments(attachments.filter(att => att.file.uid !== file.uid));
    };

    const handleSubmit = async (values: any, saveOption: string) => {
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
                    oldId: adj.price_adjustment // Keep oldId to update later
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

        if (!invoiceData?.data.id) {
            if (open) {
                open({
                    message: 'Invoice not found. Please try again.',
                    type: 'error',
                    description: 'Error saving invoice',
                });
            }
            return;
        }

        try {
            if (saveOption === 'new') {
                await dataProvider.create({
                    resource: 'invoice-versions',
                    variables: {
                        ...payload,
                        invoice: invoiceData?.data.id,
                    },
                });
            } else {
                await dataProvider.update({
                    resource: 'invoice-versions',
                    id: invoiceData?.data.id,
                    variables: {
                        ...payload,
                        version: invoiceData?.data.versions[activeVersion].version,
                    },
                });
            }

            if (open) {
                open({
                    message: 'Invoice saved successfully!',
                    type: 'success',
                    description: 'Success',
                });
            }

            await refetchInvoiceData();
            setActiveVersion(invoiceData.data.versions.length - 1);

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
                        description: 'Error saving invoice',
                    });
                }
            } else {
                if (open) {
                    open({
                        message: 'Failed to save the invoice. Please try again.',
                        type: 'error',
                        description: 'Error saving invoice',
                    });
                }
            }
        }
    };

    const handleTabChange = (key: string) => {
        const versionIndex = parseInt(key, 10);
        if (invoiceData) {
            const selectedVersion = invoiceData.data.versions[versionIndex];

            form.setFieldsValue({
                invoice: {
                    issue_date: moment(selectedVersion.issue_date),
                    expiry_date: moment(selectedVersion.valid_until),
                    customer_notes: selectedVersion.customer_notes,
                    terms_conditions: selectedVersion.terms_conditions,
                    status: selectedVersion.status,
                }
            });
            setItems(selectedVersion.items);

            const formattedAdjustments = selectedVersion.adjustments.map((adj: any) => ({
                price_adjustment: adj.price_adjustment.id,
                amount: parseFloat(adj.amount),
                order: adj.order
            }));

            setAdjustments(formattedAdjustments);

            setAttachments(selectedVersion.attachments.map((file: any) => ({
                id: file.id,
                file: { uid: file.id, name: file.original_filename, url: file.file } as UploadFile,
                description: file.description,
            })));
            setActiveVersion(versionIndex);
        }
    };

    const saveMenu = (
        <Menu onClick={({ key }) => handleSubmit(form.getFieldsValue(), key)}>
            <Menu.Item key="current">Save to Current Version</Menu.Item>
            <Menu.Item key="new">Save as New Version</Menu.Item>
        </Menu>
    );

    return (
        <Edit
            saveButtonProps={{ style: { display: 'none' } }}
            title={'Edit Invoice'}
        >
            {isLoadingInvoiceData ? (
                <Skeleton active />
            ) : (
                <Form {...formProps} layout="horizontal" labelCol={{ span: 6 }} form={form}
                      onFinish={(values) => handleSubmit(values, 'current')}
                      onFinishFailed={({ errorFields }) => console.log(errorFields)}>
                    <Row gutter={16}>
                        {/* Customer Dropdown */}
                        <Col span={10}>
                            <Form.Item
                                label="Customer"
                                name={['invoice', 'customer']}
                                rules={[{ required: true, message: 'Please select a customer!' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Select a customer"
                                    optionLabelProp="label"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option?.children
                                            ? React.isValidElement(option.children)
                                                ? false
                                                : option.children.toString().toLowerCase().includes(input.toLowerCase())
                                            : false
                                    }
                                    loading={isLoading}
                                >
                                    {customersData?.data?.map((customer: any) => (
                                        <Option key={customer.id} value={customer.id} label={customer.display_name}>
                                            <div>
                                                <div>{customer.display_name}</div>
                                                <div style={{
                                                    fontSize: 'smaller',
                                                    color: '#888'
                                                }}>{customer.company_name}</div>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Quotation Reference Number */}
                    {invoiceData?.data?.quotation && invoiceData?.data?.quotation_reference_number && (
                    <Row gutter={16}>
                        <Col span={10}>
                            <Form.Item label="Quotation#">
                                {/*<a href={`/quotations/${invoiceData.data.quotation}`}*/}
                                {/*   style={{marginLeft: '8px'}}>*/}
                                {/*    {invoiceData.data.quotation_reference_number}*/}
                                {/*</a>*/}
                                <Button type="link" onClick={() => router.push(`/quotations/${invoiceData.data.quotation}`)}>
                                    {invoiceData.data.quotation_reference_number}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                    )}

                    {/* Hidden Quotation ID Field */}
                    <Form.Item name={['invoice', 'quotation']} hidden>
                        <Input type="hidden" />
                    </Form.Item>

                    {/* Invoice Number*/}
                    <Row gutter={16}>
                        <Col span={10}>
                            <Form.Item
                                label="Invoice#"
                                name={['invoice', 'reference_number']}
                                rules={[{ required: true, message: 'Please enter an invoice number!' }]}
                            >
                                <Input suffix={invoiceNumberSuffix} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Version Tabs */}
                    <Tabs activeKey={activeVersion.toString()} onChange={handleTabChange}>
                        {invoiceData?.data?.versions.map((version: any, index: number) => (
                            <TabPane tab={`Version ${version.version}`} key={index.toString()}>
                                {/* Invoice issue date and expiry date */}
                                <Row gutter={16}>
                                    <Col span={10}>
                                        <Form.Item
                                            label="Invoice Date"
                                            name={['invoice', 'issue_date']}
                                            rules={[{ required: true, message: 'Please enter an invoice date!' }]}
                                        >
                                            <DatePicker placeholder="Select a date" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                        <Form.Item
                                            labelCol={{ span: 8 }}
                                            wrapperCol={{ span: 12 }}
                                            label="Expiry Date"
                                            name={['invoice', 'expiry_date']}
                                            rules={[{ required: true, message: 'Please enter an expiry date!' }]}
                                        >
                                            <DatePicker placeholder="Select a date" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={10}>
                                        <Form.Item
                                            label="Payment Term"
                                            name={['invoice', 'payment_term']}
                                            rules={[{ required: true, message: 'Please select a payment term!' }]}
                                        >
                                            <Select
                                                placeholder="Select a payment term"
                                                loading={isLoadingPaymentTerms}
                                            >
                                                {paymentTermsData?.data?.map((term: any) => (
                                                    <Option key={term.id} value={term.id}>
                                                        {term.term_name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* Status Field */}
                                <Row gutter={16}>
                                    <Col span={10}>
                                        <Form.Item
                                            label="Status"
                                            name={['invoice', 'status']}
                                            rules={[{ required: true, message: 'Please select a status!' }]}
                                        >
                                            <Select placeholder="Select a status">
                                                {(['pending', 'paid', 'partial_paid', 'cancelled'] as Status[]).map(status => (
                                                    <Option key={status} value={status} style={{ color: getStatusColor(status) }}>
                                                        <span style={{ color: getStatusColor(status) }}>
                                                            {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                        </span>
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* Products and Services Form Fields */}
                                <ProductsServices items={items} setItems={setItems} isLoading={false} />

                                <Divider />

                                {/* Subtotal and Total Price Display */}
                                <Row justify="end" style={{ marginTop: 20, marginRight: 30 }}>
                                    <Col span={10}>
                                        <Card bordered={false} style={{ width: '100%', backgroundColor: '#f8f8fa' }}>
                                            {/* Subtotal */}
                                            <Row>
                                                <Col span={12}>
                                                    <Text strong>Sub Total:</Text>
                                                </Col>
                                                <Col span={12} style={{ textAlign: 'right' }}>
                                                    <Text strong>{`$${subtotalPrice.toFixed(2)}`}</Text>
                                                </Col>
                                            </Row>

                                            <Divider />

                                            {/* Adjustments */}
                                            <AdjustmentFields adjustments={adjustments} setAdjustments={setAdjustments} adjustmentOptions={adjustmentOptions} setAdjustmentOptions={setAdjustmentOptions} isLoading={isLoading} form={form} />

                                            <Divider />

                                            {/* Total */}
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

                                {/* Extra Details */}
                                <Divider />

                                {/* Customer Notes */}
                                <Row gutter={16}>
                                    <Col span={14}>
                                        <Form.Item
                                            label="Customer Notes"
                                            name={['invoice', 'customer_notes']}
                                        >
                                            <Input.TextArea rows={4} placeholder="Enter any notes related to the customer" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* Terms and Conditions */}
                                <Row>
                                    <Col span={14}>
                                        <Form.Item
                                            label="Terms and Conditions"
                                            name={['invoice', 'terms_conditions']}
                                        >
                                            <Input.TextArea rows={4} placeholder="Enter terms and conditions" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {/* Attachments */}
                                <Row gutter={16}>
                                    <Col span={14}>
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
                                                        <Button key={`download-${index}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => downloadAttachment(attachment.id, attachment.file.name)} />,
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
                                    </Col>
                                </Row>
                            </TabPane>
                        ))}
                    </Tabs>

                    <Row justify="end" style={{ marginTop: 16 }}>
                        <Dropdown overlay={saveMenu}>
                            <Button type="primary" icon={<DownOutlined />}>
                                Save Options
                            </Button>
                        </Dropdown>
                    </Row>
                </Form>
            )}

            <Modal title="Upload Attachment" visible={isModalVisible} onOk={handleFileUpload} onCancel={handleCancel}>
                <Dragger beforeUpload={file => { onFileChange({ file, fileList: [] }); return false; }} showUploadList={false}>
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
        </Edit>
    );
};

export default InvoiceEdit;
