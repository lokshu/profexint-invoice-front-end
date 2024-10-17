// 'use client';
//
// import { Create, useForm } from '@refinedev/antd';
// import { UploadFile } from 'antd/lib/upload/interface';
// import {
//     Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Tabs, Typography, Upload, List
// } from 'antd';
// import { DeleteOutlined, DownloadOutlined, PlusOutlined, UploadOutlined, LoadingOutlined, SettingTwoTone } from '@ant-design/icons';
// import {
//     AdjustmentEntry, Identity, Item, LatestNumberResponse, PriceAdjustment, QuotationPayload, UserProfile, UserSignatureDropDown
// } from '@/types/interfaces';
// import React, { useEffect, useMemo, useState } from 'react';
// import { useCustom, useGetIdentity, useNotification } from '@refinedev/core';
// import moment from 'moment';
// import ProductsServices from '@components/form/product-service-form';
// import AdjustmentFields from '@components/form/adjustment-fields';
// import { v4 as uuidv4 } from 'uuid';
// import { dataProvider } from '@providers/data-provider';
//
// const { Option } = Select;
// const { TabPane } = Tabs;
// const { Dragger } = Upload;
// import { useRouter } from 'next/navigation';
//
// const emptyItem: Item = {
//     item_detail: '',
//     quantity: 0,
//     unit_price: 0,
//     discount: 0,
//     total_amount: 0,
//     order: 0
// }
//
// const { Text, Title } = Typography;
//
// const QuotationCreate = () => {
//     const { formProps, saveButtonProps, form } = useForm();
//     const { open } = useNotification();
//     const [attachments, setAttachments] = useState<{ id: string, file: UploadFile, description: string }[]>([]);
//     const [appendices, setAppendices] = useState<{ id: string, file: UploadFile, description: string }[]>([]);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [currentFile, setCurrentFile] = useState<UploadFile | null>(null);
//     const [currentDescription, setCurrentDescription] = useState('');
//     const [adjustments, setAdjustments] = useState<AdjustmentEntry[]>([]);
//     const [adjustmentOptions, setAdjustmentOptions] = useState<PriceAdjustment[]>([]);
//     const [items, setItems] = useState<Item[]>([emptyItem]);
//     const [defaultSignature, setDefaultSignature] = useState<string | undefined>(undefined);
//     const [uploadType, setUploadType] = useState<'attachment' | 'appendix'>('attachment');
//     const router = useRouter();
//
//     const { data: identity } = useGetIdentity<Identity>();
//     const { data: customersData, isLoading } = useCustom({
//         url: `customers/dropdown`,
//         method: 'get',
//     });
//     const { data: priceAdjustmentsData, isLoading: isLoadingPriceAdjustments } = useCustom<PriceAdjustment[]>({
//         url: `price-adjustments`,
//         method: 'get',
//     });
//     const { data: latestNumberData, isLoading: isLoadingLatestNumber } = useCustom<LatestNumberResponse>({
//         url: `latest-number/?document_type=QUOTATION&user_id=${identity?.id}`,
//         method: 'get'
//     });
//     const { data: signatureDropdownData, isLoading: isLoadingSignatureDropdown } = useCustom<UserSignatureDropDown[]>({
//         url: 'user-signatures/dropdown',
//         method: 'get'
//     });
//     const { data: userProfileData, isLoading: isLoadingUserProfile } = useCustom<UserProfile>({
//         url: 'user-profile',
//         method: 'get'
//     });
//
//     const { subtotalPrice, totalPrice } = useMemo(() => {
//         const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price) + Number(item.discount || 0)), 0);
//         const adjustmentsTotal = adjustments.reduce((acc, adj) => acc + Number(adj.amount || 0), 0);
//         const total = subtotal + adjustmentsTotal;
//
//         return { subtotalPrice: subtotal || 0, totalPrice: total || 0 };
//     }, [items, adjustments]);
//
//     const initialValues = {
//         quotation: {
//             issue_date: moment()
//         },
//     };
//
//     const quotationNumberSuffix = (
//         isLoadingLatestNumber ? <LoadingOutlined style={{ color: 'rgba(0,0,0,.45)' }} spin /> : <SettingTwoTone
//             style={{ fontSize: 16 }}
//         />
//     );
//
//     useEffect(() => {
//         if (priceAdjustmentsData) {
//             setAdjustmentOptions(priceAdjustmentsData.data);
//         }
//     }, [priceAdjustmentsData]);
//
//     useEffect(() => {
//         if (latestNumberData && latestNumberData.data.latest_number) {
//             form.setFieldsValue({
//                 quotation: {
//                     reference_number: latestNumberData.data.latest_number
//                 }
//             });
//         }
//     }, [latestNumberData, form]);
//
//     useEffect(() => {
//         if (userProfileData) {
//             form.setFieldsValue({
//                 quotation: {
//                     signature: userProfileData.data.default_quotation_signature
//                 }
//             });
//             setDefaultSignature(userProfileData.data.default_quotation_signature);
//         }
//     }, [userProfileData, form]);
//
//     const showUploadModal = (type: 'attachment' | 'appendix') => {
//         setUploadType(type);
//         setIsModalVisible(true);
//     };
//
//     const handleFileUpload = async () => {
//         if (currentFile) {
//             const formData = new FormData();
//             const referenceNumber = form.getFieldValue(['quotation', 'reference_number']);
//             formData.append('file', currentFile as unknown as Blob);
//             formData.append('description', currentDescription);
//             formData.append('document_type', uploadType === 'attachment' ? 'quotation' : 'appendix');
//             formData.append('reference_number', referenceNumber);
//             formData.append('original_filename', currentFile.name);
//
//             try {
//                 const { data } = await dataProvider.create({
//                     resource: 'document-attachments/upload',
//                     variables: formData,
//                 });
//
//                 if (typeof data.id === 'string') {
//                     const newFile = { id: data.id, file: currentFile, description: currentDescription };
//                     if (uploadType === 'attachment') {
//                         setAttachments([...attachments, newFile]);
//                     } else {
//                         setAppendices([...appendices, newFile]);
//                     }
//                     setCurrentFile(null);
//                     setCurrentDescription('');
//                     setIsModalVisible(false);
//
//                     if (open) {
//                         open({
//                             message: 'File uploaded successfully!',
//                             type: 'success',
//                         });
//                     }
//                 } else {
//                     throw new Error('File upload failed: Invalid ID returned');
//                 }
//             } catch (error) {
//                 if (open) {
//                     open({
//                         message: 'Failed to upload the file. Please try again.',
//                         type: 'error',
//                     });
//                 }
//             }
//         }
//     };
//
//
//     const handleCancel = () => {
//         setIsModalVisible(false);
//     };
//
//     const onFileChange = (info: UploadFile): void => {
//         const isJpgOrPng = info.type === 'image/jpeg' || info.type === 'image/png';
//         if (uploadType === 'appendix' && !isJpgOrPng) {
//             if (open) {
//                 open({
//                     message: 'You can only upload JPG/PNG file!',
//                     type: 'error',
//                 });
//             }
//             return;
//         }
//         setCurrentFile(info);
//     };
//     //
//     // const onFileChange = (info: UploadFile): void => {
//     //     setCurrentFile(info);
//     // };
//
//     const removeAttachment = (file: UploadFile) => {
//         setAttachments(attachments.filter(att => att.file.uid !== file.uid));
//     };
//
//     const removeAppendix = (file: UploadFile) => {
//         setAppendices(appendices.filter(app => app.file.uid !== file.uid));
//     };
//
//     const handleSubmit = async (values: any) => {
//         if (items.length === 0) {
//             if (open) {
//                 open({
//                     message: 'Please add at least one item to the quotation.',
//                     type: 'error',
//                     description: 'Validation Error',
//                 });
//             }
//             return;
//         }
//
//         if (items.some(item => item.quantity <= 0 || item.unit_price <= 0)) {
//             if (open) {
//                 open({
//                     message: 'Please check your items for valid quantities and prices.',
//                     type: 'error',
//                     description: 'Validation Error',
//                 });
//             }
//             return;
//         }
//
//         if (adjustments.some(adj => adj.amount == 0)) {
//             if (open) {
//                 open({
//                     message: 'Please check your adjustments for valid amounts.',
//                     type: 'error',
//                     description: 'Validation Error',
//                 });
//             }
//             return;
//         }
//
//         const issueDate = moment.isMoment(values.quotation.issue_date)
//             ? values.quotation.issue_date
//             : moment(values.quotation.issue_date, 'YYYY-MM-DD');
//
//         const expiryDate = moment.isMoment(values.quotation.expiry_date)
//             ? values.quotation.expiry_date
//             : moment(values.quotation.expiry_date.toDate());
//
//         if (!expiryDate.isValid() || !issueDate.isValid()) {
//             console.error('Invalid dates provided');
//             return;
//         }
//
//         if (expiryDate.isSameOrBefore(issueDate)) {
//             if (open) {
//                 open({
//                     message: 'The expiry date must be later than the issue date.',
//                     type: 'error',
//                     description: 'Validation Error',
//                 });
//             }
//             return;
//         }
//
//         const formattedIssueDate = issueDate.format('YYYY-MM-DD');
//         const formattedExpiryDate = expiryDate.format('YYYY-MM-DD');
//
//         const newAdjustments = adjustments
//             .filter(adj => adj.price_adjustment?.startsWith('new-'))
//             .map(adj => {
//                 const newName = adjustmentOptions.find(option => option.id === adj.price_adjustment)?.name || 'New Adjustment';
//                 const newUUID = uuidv4();
//                 return {
//                     id: newUUID,
//                     name: newName,
//                     oldId: adj.price_adjustment
//                 };
//             });
//
//         const updatedAdjustments = adjustments.map(adj => {
//             const foundNewAdj = newAdjustments.find(newAdj => newAdj.oldId === adj.price_adjustment);
//             if (foundNewAdj) {
//                 return { ...adj, price_adjustment: foundNewAdj.id };
//             }
//             return adj;
//         });
//
//         const payload: QuotationPayload = {
//             ...values.quotation,
//             issue_date: formattedIssueDate,
//             expiry_date: formattedExpiryDate,
//             items,
//             adjustments: updatedAdjustments,
//             new_adjustments: newAdjustments.map(adj => ({
//                 id: adj.id,
//                 name: adj.name
//             })),
//             attachments: attachments.map(att => (att.id)),
//             appendices: appendices.map(app => (app.id)),
//         };
//
//         try {
//             const { data } = await dataProvider.create({
//                 resource: 'quotations',
//                 variables: payload,
//             });
//
//             if (open) {
//                 open({
//                     message: 'Quotation created successfully!',
//                     type: 'success',
//                     description: 'Success',
//                 });
//             }
//
//             console.log(data)
//
//             // Redirect to the newly created quotation
//             router.push(`/quotations/${data.quotation}`);
//         } catch (error) {
//             if (error instanceof Response) {
//                 const errorData = await error.json();
//                 const errorMessages = Object.entries(errorData).map(([key, value]) => {
//                     if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
//                         return `${key}: ${value.join(', ')}`;
//                     }
//                     return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`;
//                 }).join('\n');
//                 if (open) {
//                     open({
//                         message: errorMessages,
//                         type: 'error',
//                         description: 'Error creating quotation',
//                     });
//                 }
//             } else {
//                 if (open) {
//                     open({
//                         message: 'Failed to create the quotation. Please try again.',
//                         type: 'error',
//                         description: 'Error creating quotation',
//                     });
//                 }
//             }
//         }
//     };
//
//     return (
//         <Create saveButtonProps={saveButtonProps} title={'New Quotation'}>
//             <Form {...formProps} layout="horizontal" labelCol={{ span: 6 }} form={form} initialValues={initialValues} onFinish={handleSubmit}>
//                 <Row gutter={16}>
//                     <Col span={10}>
//                         <Form.Item label="Customer" name={['quotation', 'customer']} rules={[{ required: true, message: 'Please select a customer!' }]}>
//                             <Select showSearch placeholder="Select a customer" optionLabelProp="label" optionFilterProp="children" filterOption={(input, option) =>
//                                 option?.children
//                                     ? React.isValidElement(option.children)
//                                         ? false
//                                         : option.children.toString().toLowerCase().includes(input.toLowerCase())
//                                     : false
//                             } loading={isLoading}>
//                                 {customersData?.data?.map((customer: any) => (
//                                     <Option key={customer.id} value={customer.id} label={customer.display_name}>
//                                         <div>
//                                             <div>{customer.display_name}</div>
//                                             <div style={{ fontSize: 'smaller', color: '#888' }}>{customer.company_name}</div>
//                                         </div>
//                                     </Option>
//                                 ))}
//                             </Select>
//                         </Form.Item>
//                     </Col>
//                 </Row>
//
//                 <Divider />
//
//                 <Row gutter={16}>
//                     <Col span={10}>
//                         <Form.Item label="Quotation#" name={['quotation', 'reference_number']} rules={[{ required: true, message: 'Please enter a quotation number!' }]}>
//                             <Input suffix={quotationNumberSuffix} />
//                         </Form.Item>
//                     </Col>
//                 </Row>
//
//                 <Row gutter={16}>
//                     <Col span={10}>
//                         <Form.Item label="Quotation Date" name={['quotation', 'issue_date']} rules={[{ required: true, message: 'Please enter a quotation date!' }]}>
//                             <DatePicker placeholder="Select a date" />
//                         </Form.Item>
//                     </Col>
//                     <Col span={10}>
//                         <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} label="Expiry Date" name={['quotation', 'expiry_date']} rules={[{ required: true, message: 'Please enter an expiry date!' }]}>
//                             <DatePicker placeholder="Select a date" />
//                         </Form.Item>
//                     </Col>
//                 </Row>
//
//                 <ProductsServices items={items} setItems={setItems} isLoading={false} />
//
//                 <Divider />
//
//                 <Row justify="end" style={{ marginTop: 20, marginRight: 30 }}>
//                     <Col span={10}>
//                         <Card bordered={false} style={{ width: '100%', backgroundColor: '#f8f8fa' }}>
//                             <Row>
//                                 <Col span={12}>
//                                     <Text strong>Sub Total:</Text>
//                                 </Col>
//                                 <Col span={12} style={{ textAlign: 'right' }}>
//                                     <Text strong>{`$${subtotalPrice.toFixed(2)}`}</Text>
//                                 </Col>
//                             </Row>
//                             <Divider />
//                             <AdjustmentFields adjustments={adjustments} setAdjustments={setAdjustments} adjustmentOptions={adjustmentOptions} setAdjustmentOptions={setAdjustmentOptions} isLoading={isLoading} form={form} />
//                             <Divider />
//                             <Row>
//                                 <Col span={12}>
//                                     <Title level={3}>Total:</Title>
//                                 </Col>
//                                 <Col span={12} style={{ textAlign: 'right' }}>
//                                     <Title level={3}>{`$${totalPrice.toFixed(2)}`}</Title>
//                                 </Col>
//                             </Row>
//                         </Card>
//                     </Col>
//                 </Row>
//
//                 <Tabs defaultActiveKey="1">
//                     <TabPane tab="Extra Details" key="1">
//                         <Row gutter={16}>
//                             <Col span={14}>
//                                 <Form.Item label="Customer Notes" name={['quotation', 'customer_notes']}>
//                                     <Input.TextArea rows={4} placeholder="Enter any notes related to the customer" />
//                                 </Form.Item>
//                             </Col>
//                         </Row>
//                         <Row gutter={16}>
//                             <Col span={14}>
//                                 <Form.Item label="Terms and Conditions" name={['quotation', 'terms_conditions']}>
//                                     <Input.TextArea rows={4} placeholder="Enter terms and conditions" />
//                                 </Form.Item>
//                             </Col>
//                         </Row>
//                         <Row gutter={16}>
//                             <Col span={14}>
//                                 <Form.Item label="Quotation Signature" name={['quotation', 'signature']} rules={[{ required: true, message: 'Please select a signature!' }]}>
//                                     <Select placeholder="Select a signature" defaultValue={defaultSignature} loading={isLoadingSignatureDropdown}>
//                                         {signatureDropdownData?.data?.map((signature: UserSignatureDropDown) => (
//                                             <Option key={signature.id} value={signature.id}>
//                                                 {signature.signature_name}
//                                             </Option>
//                                         ))}
//                                     </Select>
//                                 </Form.Item>
//                             </Col>
//                         </Row>
//                     </TabPane>
//
//                     <TabPane tab="Attachments" key="2">
//                         <Button type="primary" icon={<PlusOutlined />} onClick={() => showUploadModal('attachment')} style={{ marginBottom: 16 }}>
//                             Add Attachment
//                         </Button>
//                         <List
//                             itemLayout="horizontal"
//                             dataSource={attachments}
//                             renderItem={(attachment, index) => (
//                                 <List.Item
//                                     key={index}
//                                     actions={[
//                                         <Button key={`download-${index}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => {
//                                             const blob = new Blob([attachment.file.originFileObj as BlobPart], { type: attachment.file.type });
//                                             const link = document.createElement('a');
//                                             link.href = URL.createObjectURL(blob);
//                                             link.download = attachment.file.name;
//                                             document.body.appendChild(link);
//                                             link.click();
//                                             document.body.removeChild(link);
//                                         }} />,
//                                         <Button key={`delete-${index}`} type="link" icon={<DeleteOutlined />} style={{ color: 'red' }} onClick={() => removeAttachment(attachment.file)} />
//                                     ]}
//                                 >
//                                     <List.Item.Meta
//                                         title={attachment.file.name}
//                                         description={attachment.description}
//                                     />
//                                 </List.Item>
//                             )}
//                         />
//                     </TabPane>
//
//                     <TabPane tab="Appendices" key="3">
//                         <Button type="primary" icon={<PlusOutlined />} onClick={() => showUploadModal('appendix')} style={{ marginBottom: 16 }}>
//                             Add Appendix
//                         </Button>
//                         <List
//                             itemLayout="horizontal"
//                             dataSource={appendices}
//                             renderItem={(appendix, index) => (
//                                 <List.Item
//                                     key={index}
//                                     actions={[
//                                         <Button key={`download-${index}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => {
//                                             const blob = new Blob([appendix.file.originFileObj as BlobPart], { type: appendix.file.type });
//                                             const link = document.createElement('a');
//                                             link.href = URL.createObjectURL(blob);
//                                             link.download = appendix.file.name;
//                                             document.body.appendChild(link);
//                                             link.click();
//                                             document.body.removeChild(link);
//                                         }} />,
//                                         <Button key={`delete-${index}`} type="link" icon={<DeleteOutlined />} style={{ color: 'red' }} onClick={() => removeAppendix(appendix.file)} />
//                                     ]}
//                                 >
//                                     <List.Item.Meta
//                                         title={appendix.file.name}
//                                         description={appendix.description}
//                                     />
//                                 </List.Item>
//                             )}
//                         />
//                     </TabPane>
//                 </Tabs>
//             </Form>
//
//             {/*<Modal title="Upload Attachment" visible={isModalVisible} onOk={handleFileUpload} onCancel={handleCancel}>*/}
//             {/*    <Dragger beforeUpload={file => { onFileChange(file); return false; }} showUploadList={false}>*/}
//             {/*        <p className="ant-upload-drag-icon">*/}
//             {/*            <UploadOutlined />*/}
//             {/*        </p>*/}
//             {/*        <p className="ant-upload-text">Click or drag file to this area to upload</p>*/}
//             {/*    </Dragger>*/}
//             {/*    {currentFile && (*/}
//             {/*        <div style={{ marginTop: 16 }}>*/}
//             {/*            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>*/}
//             {/*                <Text strong style={{ marginRight: 8 }}>Selected file:</Text>*/}
//             {/*                <Text code>{currentFile.name}</Text>*/}
//             {/*            </div>*/}
//             {/*            <Input.TextArea rows={4} placeholder="Enter description" value={currentDescription} onChange={e => setCurrentDescription(e.target.value)} style={{ marginTop: 16 }} />*/}
//             {/*        </div>*/}
//             {/*    )}*/}
//             {/*</Modal>*/}
//
//             <Modal title="Upload File" visible={isModalVisible} onOk={handleFileUpload} onCancel={handleCancel}>
//                 <Dragger beforeUpload={file => { onFileChange(file); return false; }} showUploadList={false}>
//                     <p className="ant-upload-drag-icon">
//                         <UploadOutlined />
//                     </p>
//                     <p className="ant-upload-text">Click or drag file to this area to upload</p>
//                 </Dragger>
//                 {currentFile && (
//                     <div style={{ marginTop: 16 }}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <Text strong style={{ marginRight: 8 }}>Selected file:</Text>
//                             <Text code>{currentFile.name}</Text>
//                         </div>
//                         <Input.TextArea rows={4} placeholder="Enter description" value={currentDescription} onChange={e => setCurrentDescription(e.target.value)} style={{ marginTop: 16 }} />
//                     </div>
//                 )}
//             </Modal>
//         </Create>
//     );
// };
//
// export default QuotationCreate;
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Create, useForm } from '@refinedev/antd';
import { UploadFile } from 'antd/lib/upload/interface';
import {
    Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row, Select, Tabs, Typography, Upload, List
} from 'antd';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, UploadOutlined, LoadingOutlined, SettingTwoTone } from '@ant-design/icons';
import {
    AdjustmentEntry, Identity, Item, LatestNumberResponse, PriceAdjustment, QuotationPayload, UserProfile, UserSignatureDropDown
} from '@/types/interfaces';
import { useCustom, useGetIdentity, useNotification } from '@refinedev/core';
import moment from 'moment';
import ProductsServices from '@components/form/product-service-form';
import AdjustmentFields from '@components/form/adjustment-fields';
import { v4 as uuidv4 } from 'uuid';
import { dataProvider } from '@providers/data-provider';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';

const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;
const { Text, Title } = Typography;

const emptyItem: Item = {
    item_detail: '',
    quantity: 0,
    unit_price: 0,
    discount: 0,
    total_amount: 0,
    order: 0
}

const QuotationCreate = () => {
    const { formProps, saveButtonProps, form } = useForm();
    const { open } = useNotification();
    const [attachments, setAttachments] = useState<{ id: string, file: UploadFile, description: string }[]>([]);
    const [appendices, setAppendices] = useState<{ id: string, file: UploadFile, description: string }[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAppendixModalVisible, setIsAppendixModalVisible] = useState(false);
    const [currentFile, setCurrentFile] = useState<UploadFile | null>(null);
    const [currentDescription, setCurrentDescription] = useState('');
    const [adjustments, setAdjustments] = useState<AdjustmentEntry[]>([]);
    const [adjustmentOptions, setAdjustmentOptions] = useState<PriceAdjustment[]>([]);
    const [items, setItems] = useState<Item[]>([emptyItem]);
    const [defaultSignature, setDefaultSignature] = useState<string | undefined>(undefined);
    const [uploadType, setUploadType] = useState<'attachment' | 'appendix'>('attachment');
    const router = useRouter();

    const { data: identity } = useGetIdentity<Identity>();
    const { data: customersData, isLoading } = useCustom({
        url: `customers/dropdown`,
        method: 'get',
    });
    const { data: priceAdjustmentsData, isLoading: isLoadingPriceAdjustments } = useCustom<PriceAdjustment[]>({
        url: `price-adjustments`,
        method: 'get',
    });
    const { data: latestNumberData, isLoading: isLoadingLatestNumber } = useCustom<LatestNumberResponse>({
        url: `latest-number/?document_type=QUOTATION&user_id=${identity?.id}`,
        method: 'get'
    });
    const { data: signatureDropdownData, isLoading: isLoadingSignatureDropdown } = useCustom<UserSignatureDropDown[]>({
        url: 'user-signatures/dropdown',
        method: 'get'
    });
    const { data: userProfileData, isLoading: isLoadingUserProfile } = useCustom<UserProfile>({
        url: 'user-profile',
        method: 'get'
    });

    const { subtotalPrice, totalPrice } = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price) + Number(item.discount || 0)), 0);
        const adjustmentsTotal = adjustments.reduce((acc, adj) => acc + Number(adj.amount || 0), 0);
        const total = subtotal + adjustmentsTotal;

        return { subtotalPrice: subtotal || 0, totalPrice: total || 0 };
    }, [items, adjustments]);

    const initialValues = {
        quotation: {
            issue_date: moment()
        },
    };

    const quotationNumberSuffix = (
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
                quotation: {
                    reference_number: latestNumberData.data.latest_number
                }
            });
        }
    }, [latestNumberData, form]);

    useEffect(() => {
        if (userProfileData) {
            form.setFieldsValue({
                quotation: {
                    signature: userProfileData.data.default_quotation_signature
                }
            });
            setDefaultSignature(userProfileData.data.default_quotation_signature);
        }
    }, [userProfileData, form]);

    const showUploadModal = (type: 'attachment' | 'appendix') => {
        setUploadType(type);
        if (type === 'attachment') {
            setIsModalVisible(true);
        } else {
            setIsAppendixModalVisible(true);
        }
    };

    const handleFileUpload = async () => {
        if (currentFile) {
            const formData = new FormData();
            const referenceNumber = form.getFieldValue(['quotation', 'reference_number']);
            formData.append('file', currentFile as unknown as Blob);
            formData.append('description', currentDescription);
            formData.append('document_type', uploadType === 'attachment' ? 'quotation' : 'appendix');
            formData.append('reference_number', referenceNumber);
            formData.append('original_filename', currentFile.name);

            try {
                const { data } = await dataProvider.create({
                    resource: 'document-attachments/upload',
                    variables: formData,
                });

                if (typeof data.id === 'string') {
                    const newFile = { id: data.id, file: currentFile, description: currentDescription };
                    if (uploadType === 'attachment') {
                        setAttachments([...attachments, newFile]);
                    } else {
                        setAppendices([...appendices, newFile]);
                    }
                    setCurrentFile(null);
                    setCurrentDescription('');
                    setIsModalVisible(false);
                    setIsAppendixModalVisible(false);

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
        setIsAppendixModalVisible(false);
    };

    const onFileChange = (info: UploadFile): void => {
        const isJpgOrPng = info.type === 'image/jpeg' || info.type === 'image/png';
        if (uploadType === 'appendix' && !isJpgOrPng) {
            if (open) {
                open({
                    message: 'You can only upload JPG/PNG file!',
                    type: 'error',
                });
            }
            return;
        }
        setCurrentFile(info);
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

            const blob = new Blob([response.data as ArrayBuffer], { type: 'application/octet-stream' });
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

    const removeAttachment = (file: UploadFile, documentType: string) => {
        if (documentType === 'attachment') {
            setAttachments(attachments.filter(att => att.file.uid !== file.uid));
        } else {
            setAppendices(appendices.filter(app => app.file.uid !== file.uid));
        }
    };

    const handleSubmit = async (values: any) => {
        if (items.length === 0) {
            if (open) {
                open({
                    message: 'Please add at least one item to the quotation.',
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

        const issueDate = moment.isMoment(values.quotation.issue_date)
            ? values.quotation.issue_date
            : moment(values.quotation.issue_date.toDate());

        const expiryDate = moment.isMoment(values.quotation.expiry_date)
            ? values.quotation.expiry_date
            : moment(values.quotation.expiry_date.toDate());

        if (!expiryDate.isValid() || !issueDate.isValid()) {
            if (open) {
                open({
                    message: 'Invalid dates provided.',
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

        const payload: QuotationPayload = {
            ...values.quotation,
            issue_date: formattedIssueDate,
            expiry_date: formattedExpiryDate,
            items,
            adjustments: updatedAdjustments,
            new_adjustments: newAdjustments.map(adj => ({
                id: adj.id,
                name: adj.name
            })),
            attachments: attachments.map(att => (att.id)),
            appendices: appendices.map(app => (app.id)),
        };

        try {
            const { data } = await dataProvider.create({
                resource: 'quotations',
                variables: payload,
            });

            if (open) {
                open({
                    message: 'Quotation created successfully!',
                    type: 'success',
                    description: 'Success',
                });
            }

            console.log(data)

            // Redirect to the newly created quotation
            router.push(`/quotations/${data.quotation}`);
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
                        description: 'Error creating quotation',
                    });
                }
            } else {
                if (open) {
                    open({
                        message: 'Failed to create the quotation. Please try again.',
                        type: 'error',
                        description: 'Error creating quotation',
                    });
                }
            }
        }
    };

    return (
        <Create saveButtonProps={saveButtonProps} title={'New Quotation'}>
            <Form {...formProps} layout="horizontal" labelCol={{ span: 6 }} form={form} initialValues={initialValues} onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={10}>
                        <Form.Item label="Customer" name={['quotation', 'customer']} rules={[{ required: true, message: 'Please select a customer!' }]}>
                            <Select showSearch placeholder="Select a customer" optionLabelProp="label" optionFilterProp="children" filterOption={(input, option) =>
                                option?.children? React.isValidElement(option.children)
                                        ? false
                                        : option.children.toString().toLowerCase().includes(input.toLowerCase())
                                    : false
                            } loading={isLoading}>
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
                        <Form.Item label="Quotation#" name={['quotation', 'reference_number']} rules={[{ required: true, message: 'Please enter a quotation number!' }]}>
                            <Input suffix={quotationNumberSuffix} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={10}>
                        <Form.Item label="Quotation Date" name={['quotation', 'issue_date']} rules={[{ required: true, message: 'Please enter a quotation date!' }]}>
                            <DatePicker placeholder="Select a date" />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} label="Expiry Date" name={['quotation', 'expiry_date']} rules={[{ required: true, message: 'Please enter an expiry date!' }]}>
                            <DatePicker placeholder="Select a date" />
                        </Form.Item>
                    </Col>
                </Row>

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
                            <AdjustmentFields adjustments={adjustments} setAdjustments={setAdjustments} adjustmentOptions={adjustmentOptions} setAdjustmentOptions={setAdjustmentOptions} isLoading={isLoading} form={form} />
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
                                <Form.Item label="Customer Notes" name={['quotation', 'customer_notes']}>
                                    <Input.TextArea rows={4} placeholder="Enter any notes related to the customer" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={14}>
                                <Form.Item label="Terms and Conditions" name={['quotation', 'terms_conditions']}>
                                    <Input.TextArea rows={4} placeholder="Enter terms and conditions" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={14}>
                                <Form.Item label="Quotation Signature" name={['quotation', 'signature']} rules={[{ required: true, message: 'Please select a signature!' }]}>
                                    <Select placeholder="Select a signature" defaultValue={defaultSignature} loading={isLoadingSignatureDropdown}>
                                        {signatureDropdownData?.data?.map((signature: UserSignatureDropDown) => (
                                            <Option key={signature.id} value={signature.id}>
                                                {signature.signature_name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="Attachments" key="2">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showUploadModal('attachment')} style={{ marginBottom: 16 }}>
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
                                        <Button key={`delete-${index}`} type="link" icon={<DeleteOutlined />} style={{ color: 'red' }} onClick={() => removeAttachment(attachment.file, 'attachment')} />
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

                    <TabPane tab="Appendices" key="3">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showUploadModal('appendix')} style={{ marginBottom: 16 }}>
                            Add Appendix
                        </Button>
                        <List
                            itemLayout="horizontal"
                            dataSource={appendices}
                            renderItem={(appendix, index) => (
                                <List.Item
                                    key={index}
                                    actions={[
                                        <Button key={`download-${index}`} type="link" icon={<DownloadOutlined />} style={{ color: 'green' }} onClick={() => downloadAttachment(appendix.id, appendix.file.name)} />,
                                        <Button key={`delete-${index}`} type="link" icon={<DeleteOutlined />} style={{ color: 'red' }} onClick={() => removeAttachment(appendix.file, 'appendix')} />
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={appendix.file.name}
                                        description={appendix.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </TabPane>
                </Tabs>
            </Form>

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

            <Modal title="Upload Appendix" visible={isAppendixModalVisible} onOk={handleFileUpload} onCancel={handleCancel}>
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

export default QuotationCreate;
