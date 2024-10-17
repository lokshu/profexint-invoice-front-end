import { Modal, Form, Input, DatePicker, Select, Button, Upload, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { dataProvider } from '@providers/data-provider';
import { Identity } from '@/types/interfaces';
import { useCustom, useGetIdentity } from '@refinedev/core';

type PaymentFormModalProps = {
    visible: boolean;
    onClose: () => void;
    invoiceId: string;
    invoiceVersionId: number;
    refetchPayments: () => void;
    refetchInvoice: () => void;
};

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

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ visible, onClose, invoiceId, invoiceVersionId, refetchPayments, refetchInvoice }) => {
    const [form] = Form.useForm();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [invoiceTotal, setInvoiceTotal] = useState<number>(0);

    const { data: identity } = useGetIdentity<Identity>();
    const { data: paymentNumberData, isLoading: isLoadingPaymentNumber } = useCustom({
        url: `latest-number/?document_type=RECEIPT&user_id=${identity?.id}`,
        method: 'get',
    });

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            const response = await dataProvider.getList<PaymentMethod>({ resource: 'payment-methods/dropdown' });
            setPaymentMethods(response.data);
        };

        const fetchAccounts = async () => {
            const response = await dataProvider.getList<Account>({ resource: 'accounts/dropdown' });
            setAccounts(response.data);
        };

        const fetchInvoiceDetails = async () => {
            const response = await dataProvider.getOne({
                resource: 'invoices',
                id: invoiceId,
            });
            setInvoiceNumber(response.data.reference_number);
            const latestVersion = response.data.versions[0];
            setInvoiceTotal(latestVersion.total_price);
            form.setFieldsValue({ amount: latestVersion.total_price });
        };

        fetchPaymentMethods();
        fetchAccounts();
        fetchInvoiceDetails();
    }, [invoiceId, form]);

    const handleUpload = async (options: any) => {
        const { onSuccess, onError, file } = options;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', 'payment');
        formData.append('reference_number', invoiceId);

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
        console.log(invoiceVersionId)
        const { documents, payment_date, ...rest } = values;
        const payload = {
            invoice: invoiceId,
            invoice_version: invoiceVersionId,
            invoice_number: invoiceNumber,
            payment_number: paymentNumberData?.data.latest_number,
            payment_date: payment_date ? payment_date.format('YYYY-MM-DD') : null,
            ...rest,
            documents: uploadedAttachments.map(attachment => attachment.id),
        };

        await dataProvider.create({
            resource: 'payments',
            variables: payload,
        });

        form.resetFields();
        refetchPayments();
        refetchInvoice();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            title="Record Payment"
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} onFinish={handleFinish} layout="vertical">
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
                        {paymentMethods.map((method) => (
                            <Select.Option key={method.id} value={method.id}>
                                {method.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="deposit_to" label="Deposit To">
                    <Select>
                        {accounts.map((account) => (
                            <Select.Option key={account.id} value={account.id}>
                                {account.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="reference_number" label="Reference Number">
                    <Input />
                </Form.Item>
                <Form.Item name="notes" label="Notes">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item name="documents" label="Upload Documents">
                    <Upload.Dragger
                        name="files"
                        multiple={true}
                        customRequest={handleUpload}
                    >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Save Payment
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentFormModal;
