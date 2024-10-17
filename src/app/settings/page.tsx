'use client';

import React, { useState, useEffect } from 'react';
import {Form, Input, Button, Card, Row, Col, Tabs, Skeleton, notification, Modal, Divider, Table, Select, Upload} from 'antd';
import { useCustom, useCustomMutation } from '@refinedev/core';
import {SaveOutlined, PlusOutlined, EditOutlined, UploadOutlined} from '@ant-design/icons';
const { TabPane } = Tabs;
import { PaymentTerm, UserSignatureDropDown } from '@/types/interfaces';
import UserSignatureModal from './user-signature-modal';
import ChangePasswordModal from './change-password-modal';
import PaymentTermModal from './payment-term-modal';
import AccountModal from './account-modal';
import AccountTypeModal from './account-type-modal';
import PaymentMethodModal from './payment-method-modal';


const SettingsPage: React.FC = () => {
    const [userForm] = Form.useForm();
    const [paymentTermsForm] = Form.useForm();
    const [signatureForm] = Form.useForm();
    const [activeTabKey, setActiveTabKey] = useState('user-info');
    const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
    const [isPaymentTermModalVisible, setIsPaymentTermModalVisible] = useState(false);
    const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
    const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
    const [isAccountTypeModalVisible, setIsAccountTypeModalVisible] = useState(false);
    const [isPaymentMethodModalVisible, setIsPaymentMethodModalVisible] = useState(false);
    const [editingPaymentTerm, setEditingPaymentTerm] = useState<PaymentTerm | null>(null);
    const [editingSignature, setEditingSignature] = useState<any | null>(null);
    const [editingAccount, setEditingAccount] = useState<any | null>(null);
    const [editingAccountType, setEditingAccountType] = useState<any | null>(null);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<any | null>(null);
    const [paymentTermsPagination, setPaymentTermsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [signaturesPagination, setSignaturesPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [accountsPagination, setAccountsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [accountTypesPagination, setAccountTypesPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [paymentMethodsPagination, setPaymentMethodsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [companyProfileForm] = Form.useForm();

    const handleTabChange = (key: string) => {
        setActiveTabKey(key);
    };

    const { data: userInfo, isLoading: isLoadingUserInfo, refetch: refetchUserInfo } = useCustom({
        url: activeTabKey === 'user-info' ? 'user-profile' : '',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'user-info',
        },
    });

    const { data: paymentTerms, isLoading: isLoadingPaymentTerms, refetch: refetchPaymentTerms } = useCustom({
        url: activeTabKey === 'payment-terms' ? 'payment-terms' : '',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'payment-terms',
        },
    });

    const { data: signatures, isLoading: isLoadingSignatures, refetch: refetchSignatures } = useCustom({
        url: activeTabKey === 'signature' ? 'user-signatures' : '',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'signature',
        },
    });

    const { data: signatureDropdownData, isLoading: isLoadingSignatureDropdown } = useCustom({
        url: 'user-signatures/dropdown',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'user-info',
        },
    });

    const { data: companyProfile, isLoading: isLoadingCompanyProfile, refetch: refetchCompanyProfile } = useCustom({
        url: activeTabKey === 'company-profile' ? 'company-profile' : '',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'company-profile',
        },
    });

    const { data: currencyList, isLoading: isLoadingCurrencyList } = useCustom({
        url: 'currencies/dropdown',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'company-profile',
        },
    });

    const { data: accounts, isLoading: isLoadingAccounts, refetch: refetchAccounts } = useCustom({
        url: activeTabKey === 'account' ? 'accounts' : '',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'account',
        },
    });

    const { data: accountTypes, isLoading: isLoadingAccountTypes, refetch: refetchAccountTypes } = useCustom({
        url: activeTabKey === 'account-types' ? 'account-types' : '',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'account-types',
        },
    });

    const { data: paymentMethods, isLoading: isLoadingPaymentMethods, refetch: refetchPaymentMethods } = useCustom({  // Fetch payment methods
        url: activeTabKey === 'payment-methods' ? 'payment-methods' : '',
        method: 'get',
        queryOptions: {
            enabled: activeTabKey === 'payment-methods',
        },
    });

    useEffect(() => {
        if (companyProfile && activeTabKey === 'company-profile') {
            const data = companyProfile.data;
            if (data.logo && typeof data.logo === 'string') {
                data.logo = [{
                    uid: '-1',
                    name: 'logo.png',
                    status: 'done',
                    url: data.logo,
                }];
            }
            companyProfileForm.setFieldsValue(data);
        }
    }, [companyProfile, activeTabKey, companyProfileForm]);

    useEffect(() => {
        if (userInfo && activeTabKey === 'user-info') {
            userForm.setFieldsValue(userInfo.data);
        }
    }, [userInfo, activeTabKey, userForm]);

    useEffect(() => {
        if (paymentTerms && activeTabKey === 'payment-terms') {
            paymentTermsForm.setFieldsValue(paymentTerms.data);
        }
    }, [paymentTerms, activeTabKey, paymentTermsForm]);

    useEffect(() => {
        if (signatures && activeTabKey === 'signature') {
            signatureForm.setFieldsValue(signatures.data);
        }
    }, [signatures, activeTabKey, signatureForm])

    const { mutate: updateUserInfo } = useCustomMutation();
    const { mutate: updatePassword } = useCustomMutation();
    const { mutate: createPaymentTerm } = useCustomMutation();
    const { mutate: updatePaymentTerm } = useCustomMutation();
    const { mutate: createSignature } = useCustomMutation();
    const { mutate: updateSignature } = useCustomMutation();
    const { mutate: updateCompanyProfile } = useCustomMutation();
    const { mutate: createAccount } = useCustomMutation();
    const { mutate: updateAccount } = useCustomMutation();
    const { mutate: createAccountType } = useCustomMutation();
    const { mutate: updateAccountType } = useCustomMutation();
    const { mutate: createPaymentMethod } = useCustomMutation();
    const { mutate: updatePaymentMethod } = useCustomMutation();

    const handleSaveUserInfo = (values: any) => {
        updateUserInfo({
            url: 'user-profile',
            method: 'put',
            values: {
                ...values
            }
        }, {
            onSuccess: () => {
                notification.success({ message: 'User information updated successfully!' });
                refetchUserInfo();
            },
            onError: () => {
                notification.error({ message: 'Failed to update user information.' });
            },
        });
    };

    const handleSavePaymentTerm = (values: any) => {
        const action = editingPaymentTerm ? updatePaymentTerm : createPaymentTerm;
        const url = editingPaymentTerm ? `payment-terms/${editingPaymentTerm.id}` : 'payment-terms';

        action({
            url,
            method: editingPaymentTerm ? 'put' : 'post',
            values: {
                ...values
            }
        }, {
            onSuccess: () => {
                notification.success({ message: `Payment term ${editingPaymentTerm ? 'updated' : 'created'} successfully!` });
                setIsPaymentTermModalVisible(false);
                setEditingPaymentTerm(null);
                refetchPaymentTerms();
            },
            onError: () => {
                notification.error({ message: `Failed to ${editingPaymentTerm ? 'update' : 'create'} payment term.` });
            },
        });
    };

    const handleSaveSignature = (values: any) => {
        const action = editingSignature ? updateSignature : createSignature;
        const url = editingSignature ? `user-signatures/${editingSignature.id}` : 'user-signatures';
        const formData = new FormData();

        Object.keys(values).forEach(key => {
            // Do not include the signature_image to the payload if the signature_image is not changed
            if (!(editingSignature && key === 'signature_image' && values.signature_image === undefined)) {
                formData.append(key, values[key]);
            }
        });

        action({
            url,
            method: editingSignature ? 'put' : 'post',
            values: formData,
        }, {
            onSuccess: () => {
                notification.success({ message: `Signature ${editingSignature ? 'updated' : 'created'} successfully!` });
                setIsSignatureModalVisible(false);
                setEditingSignature(null);
                refetchSignatures();
            },
            onError: () => {
                notification.error({ message: `Failed to ${editingSignature ? 'update' : 'create'} signature.` });
            },
        });
    };

    const handleSaveCompanyProfile = async (values: any) => {
        const formData = new FormData();

        const dataURLtoFile = (dataurl: string, filename: string) => {
            let arr = dataurl.split(',');
            let mimeMatch = arr[0].match(/:(.*?);/);
            if (!mimeMatch) {
                throw new Error('Invalid data URL');
            }
            let mime = mimeMatch[1];
            let bstr = atob(arr[1]);
            let n = bstr.length;
            let u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        };

        for (const key of Object.keys(values)) {
            if (key === 'logo' && values.logo.length > 0) {
                // If the logo is a data URL, convert it to a file
                if (values.logo[0].url && values.logo[0].url.startsWith('data:image')) {
                    try {
                        const file = dataURLtoFile(values.logo[0].url, 'logo.png');
                        formData.append(key, file);
                    } catch (error) {
                        notification.error({ message: 'Failed to process logo image.' });
                        return;
                    }
                } else if (values.logo[0].originFileObj) {
                    formData.append(key, values.logo[0].originFileObj);
                }
            } else {
                formData.append(key, values[key]);
            }
        }

        updateCompanyProfile({
            url: 'company-profile',
            method: 'put',
            values: formData,
        }, {
            onSuccess: () => {
                notification.success({ message: 'Company profile updated successfully!' });
                refetchCompanyProfile();
            },
            onError: () => {
                notification.error({ message: 'Failed to update company profile.' });
            },
        });
    };

    const handleSaveAccount = (values: any) => {
        const action = editingAccount ? updateAccount : createAccount;
        const url = editingAccount ? `accounts/${editingAccount.id}` : 'accounts';

        action({
            url,
            method: editingAccount ? 'put' : 'post',
            values: {
                ...values
            }
        }, {
            onSuccess: () => {
                notification.success({ message: `Account ${editingAccount ? 'updated' : 'created'} successfully!` });
                setIsAccountModalVisible(false);
                setEditingAccount(null);
                refetchAccounts();
            },
            onError: () => {
                notification.error({ message: `Failed to ${editingAccount ? 'update' : 'create'} account.` });
            },
        });
    };

    const handleSaveAccountType = (values: any) => {
        const action = editingAccountType ? updateAccountType : createAccountType;
        const url = editingAccountType ? `account-types/${editingAccountType.id}` : 'account-types';

        action({
            url,
            method: editingAccountType ? 'put' : 'post',
            values: {
                ...values
            }
        }, {
            onSuccess: () => {
                notification.success({ message: `Account type ${editingAccountType ? 'updated' : 'created'} successfully!` });
                setIsAccountTypeModalVisible(false);
                setEditingAccountType(null);
                refetchAccountTypes();
            },
            onError: () => {
                notification.error({ message: `Failed to ${editingAccountType ? 'update' : 'create'} account type.` });
            },
        });
    };

    const handleSavePaymentMethod = (values: any) => {
        const action = editingPaymentMethod ? updatePaymentMethod : createPaymentMethod;
        const url = editingPaymentMethod ? `payment-methods/${editingPaymentMethod.id}` : 'payment-methods';

        action({
            url,
            method: editingPaymentMethod ? 'put' : 'post',
            values: {
                ...values
            }
        }, {
            onSuccess: () => {
                notification.success({ message: `Payment method ${editingPaymentMethod ? 'updated' : 'created'} successfully!` });
                setIsPaymentMethodModalVisible(false);
                setEditingPaymentMethod(null);
                refetchPaymentMethods();
            },
            onError: () => {
                notification.error({ message: `Failed to ${editingPaymentMethod ? 'update' : 'create'} payment method.` });
            },
        });
    };


    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const handleCreatePaymentTerm = () => {
        setEditingPaymentTerm(null);
        setIsPaymentTermModalVisible(true);
    };

    const handleEditPaymentTerm = (record: any) => {
        setEditingPaymentTerm(record);
        setIsPaymentTermModalVisible(true);
    };

    const handlePaymentTermsTableChange = (pagination: any) => {
        setPaymentTermsPagination(pagination);
    };

    const handleCreateSignature = () => {
        setEditingSignature(null);
        setIsSignatureModalVisible(true);
    };

    const handleEditSignature = (record: any) => {
        setEditingSignature(record);
        setIsSignatureModalVisible(true);
    };

    const handleSignaturesTableChange = (pagination: any) => {
        setSignaturesPagination(pagination);
    };

    const handleCreateAccount = () => {
        setEditingAccount(null);
        setIsAccountModalVisible(true);
    };

    const handleEditAccount = (record: any) => {
        setEditingAccount(record);
        setIsAccountModalVisible(true);
    };

    const handleAccountsTableChange = (pagination: any) => {
        setAccountsPagination(pagination);
    };

    const handleCreateAccountType = () => {
        setEditingAccountType(null);
        setIsAccountTypeModalVisible(true);
    };

    const handleEditAccountType = (record: any) => {
        setEditingAccountType(record);
        setIsAccountTypeModalVisible(true);
    };

    const handleAccountTypesTableChange = (pagination: any) => {
        setAccountTypesPagination(pagination);
    };

    const handleCreatePaymentMethod = () => {
        setEditingPaymentMethod(null);
        setIsPaymentMethodModalVisible(true);
    };

    const handleEditPaymentMethod = (record: any) => {
        setEditingPaymentMethod(record);
        setIsPaymentMethodModalVisible(true);
    };

    const handlePaymentMethodsTableChange = (pagination: any) => {
        setPaymentMethodsPagination(pagination);
    };

    const handleChangePassword = (values: any) => {
        updatePassword({
            url: 'change-password',
            method: 'post',
            values: {
                current_password: values.currentPassword,
                new_password: values.newPassword,
            }
        }, {
            onSuccess: () => {
                notification.success({ message: 'Password changed successfully!' });
                setIsChangePasswordModalVisible(false);
            },
            onError: (error) => {

            },
        });
    };

    const paymentTermColumns = [
        {
            title: 'Term Name',
            dataIndex: 'term_name',
            key: 'term_name',
        },
        {
            title: 'Days Due',
            dataIndex: 'days_due',
            key: 'days_due',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: PaymentTerm) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEditPaymentTerm(record)} />
            ),
        },
    ];

    const signatureColumns = [
        {
            title: 'Signature Name',
            dataIndex: 'signature_name',
            key: 'signature_name',
        },
        {
            title: 'Signature Image',
            dataIndex: 'signature_image',
            key: 'signature_image',
            render: (text: string) => <img src={text} alt="Signature Thumbnail" />,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEditSignature(record)} />
            ),
        },
    ];

    const accountColumns = [
        {
            title: 'Account Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Account Code',
            dataIndex: 'account_code',
            key: 'account_code',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEditAccount(record)} />
            ),
        },
    ];

    const accountTypeColumns = [
        {
            title: 'Account Type Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEditAccountType(record)} />
            ),
        },
    ];

    const paymentMethodColumns = [
        {
            title: 'Payment Method Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEditPaymentMethod(record)} />
            ),
        },
    ];

    return (
        <Card>
            <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
                <TabPane tab="User Information" key="user-info">
                    {isLoadingUserInfo ? (
                        <Skeleton active />
                    ) : (
                        <Form form={userForm} layout="vertical" onFinish={handleSaveUserInfo}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email' }]}>
                                        <Input placeholder="Enter your email" disabled />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: 'Please enter your first name' }]}>
                                        <Input placeholder="Enter your first name" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: 'Please enter your last name' }]}>
                                        <Input placeholder="Enter your last name" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="job_title" label="Job Title" rules={[{ required: true, message: 'Please enter your job title' }]}>
                                        <Input placeholder="Enter your job title" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="custom_code" label="Custom Code" rules={[{ required: true, message: 'Please enter your custom code' }]}>
                                        <Input placeholder="Enter your custom code" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="default_quotation_signature" label="Default Quotation Signature">
                                        <Select placeholder="Select a signature">
                                            {signatureDropdownData?.data?.map((signature: any) => (
                                                <Select.Option key={signature.id} value={signature.id}>
                                                    {signature.signature_name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Button type="primary" onClick={() => setIsChangePasswordModalVisible(true)} danger>Change Password</Button>
                                </Col>
                            </Row>

                            <Divider />

                            <Row gutter={16}>
                                <Col span={12} offset={12} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit">Save</Button>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </TabPane>
                <TabPane tab="Company Profile" key="company-profile">
                    {isLoadingCompanyProfile ? (
                        <Skeleton active />
                    ) : (
                        <Form form={companyProfileForm} layout="vertical" onFinish={handleSaveCompanyProfile}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="organization_name" label="Organization Name" rules={[{ required: true, message: 'Please enter the organization name' }]}>
                                        <Input placeholder="Enter organization name" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please enter the location' }]}>
                                        <Input placeholder="Enter location" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter the address' }]}>
                                        <Input.TextArea placeholder="Enter address" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="website_url" label="Website URL">
                                        <Input placeholder="Enter website URL" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="phone" label="Phone">
                                        <Input placeholder="Enter phone number" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="email" label="Email">
                                        <Input placeholder="Enter email" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="base_currency" label="Base Currency">
                                        <Select placeholder="Select a currency">
                                            {currencyList?.data?.map((currency: any) => (
                                                <Select.Option key={currency.id} value={currency.id}>
                                                    {currency.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="time_zone" label="Time Zone">
                                        <Input placeholder="Enter time zone" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="date_format" label="Date Format">
                                        <Input placeholder="Enter date format" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="company_id" label="Company ID" rules={[{ required: true, message: 'Please enter the company ID' }]}>
                                        <Input placeholder="Enter company ID" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="logo" label="Logo" valuePropName="fileList" getValueFromEvent={normFile}>
                                        <Upload name="logo" listType="picture" beforeUpload={() => false}>
                                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <Row gutter={16}>
                                <Col span={12} offset={12} style={{ textAlign: 'right' }}>
                                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit">Save</Button>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </TabPane>
                <TabPane tab="Payment Terms" key="payment-terms">
                    {isLoadingPaymentTerms ? (
                        <Skeleton active />
                    ) : (
                        <>
                            <Row justify="end" style={{ marginBottom: 16 }}>
                                <Button type="primary" icon={<PlusOutlined />}  onClick={handleCreatePaymentTerm}>
                                    Create Payment Term
                                </Button>
                            </Row>

                            <Table
                                dataSource={paymentTerms?.data.results || []}
                                columns={paymentTermColumns}
                                rowKey="id"
                                pagination={paymentTermsPagination}
                                onChange={handlePaymentTermsTableChange}
                            />
                        </>
                    )}
                </TabPane>
                <TabPane tab="Signature" key="signature">
                    {isLoadingSignatures ? (
                        <Skeleton active />
                    ) : (
                        <>
                            <Row justify="end" style={{ marginBottom: 16 }}>
                                <Button type="primary" icon={<PlusOutlined />}  onClick={handleCreateSignature}>
                                    Create Signature
                                </Button>
                            </Row>

                            <Table
                                dataSource={signatures?.data.results || []}
                                columns={signatureColumns}
                                rowKey="id"
                                pagination={signaturesPagination}
                                onChange={handleSignaturesTableChange}
                            />
                        </>
                    )}
                </TabPane>
                <TabPane tab="Account" key="account">
                    {isLoadingAccounts ? (
                        <Skeleton active />
                    ) : (
                        <>
                            <Row justify="end" style={{ marginBottom: 16 }}>
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateAccount}>
                                    Create Account
                                </Button>
                            </Row>
                            <Table
                                dataSource={accounts?.data.results || []}
                                columns={accountColumns}
                                rowKey="id"
                                pagination={accountsPagination}
                                onChange={handleAccountsTableChange}
                            />
                        </>
                    )}
                </TabPane>
                <TabPane tab="Account Types" key="account-types">
                    {isLoadingAccountTypes ? (
                        <Skeleton active />
                    ) : (
                        <>
                            <Row justify="end" style={{ marginBottom: 16 }}>
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateAccountType}>
                                    Create Account Type
                                </Button>
                            </Row>
                            <Table
                                dataSource={accountTypes?.data.results || []}
                                columns={accountTypeColumns}
                                rowKey="id"
                                pagination={accountTypesPagination}
                                onChange={handleAccountTypesTableChange}
                            />
                        </>
                    )}
                </TabPane>
                <TabPane tab="Payment Methods" key="payment-methods">
                    {isLoadingPaymentMethods ? (
                        <Skeleton active />
                    ) : (
                        <>
                            <Row justify="end" style={{ marginBottom: 16 }}>
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePaymentMethod}>
                                    Create Payment Method
                                </Button>
                            </Row>
                            <Table
                                dataSource={paymentMethods?.data.results || []}
                                columns={paymentMethodColumns}
                                rowKey="id"
                                pagination={paymentMethodsPagination}
                                onChange={handlePaymentMethodsTableChange}
                            />
                        </>
                    )}
                </TabPane>
            </Tabs>
            <ChangePasswordModal
                visible={isChangePasswordModalVisible}
                onClose={() => setIsChangePasswordModalVisible(false)}
                onSubmit={handleChangePassword}
            />
            <PaymentTermModal
                visible={isPaymentTermModalVisible}
                onClose={() => setIsPaymentTermModalVisible(false)}
                onSubmit={handleSavePaymentTerm}
                initialValues={editingPaymentTerm}
            />
            <UserSignatureModal
                visible={isSignatureModalVisible}
                onClose={() => setIsSignatureModalVisible(false)}
                onSubmit={handleSaveSignature}
                initialValues={editingSignature}
            />
            <AccountModal
                visible={isAccountModalVisible}
                onClose={() => setIsAccountModalVisible(false)}
                onSubmit={handleSaveAccount}
                initialValues={editingAccount}
            />
            <AccountTypeModal
                visible={isAccountTypeModalVisible}
                onClose={() => setIsAccountTypeModalVisible(false)}
                onSubmit={handleSaveAccountType}
                initialValues={editingAccountType}
            />
            <PaymentMethodModal
                visible={isPaymentMethodModalVisible}
                onClose={() => setIsPaymentMethodModalVisible(false)}
                onSubmit={handleSavePaymentMethod}
                initialValues={editingPaymentMethod}
            />
        </Card>
    );
};

export default SettingsPage;
