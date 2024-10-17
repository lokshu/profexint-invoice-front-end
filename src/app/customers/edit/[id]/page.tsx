'use client';

import {Edit, useForm} from '@refinedev/antd';
import {Col, Form, Input, Row, Select, Spin, Switch, Tabs, Typography} from 'antd';
import React, {useEffect, useState} from 'react';
import countryCodes from '@/data/country-code.json';
import countryCodesSortByName from '@/data/country-code-sort-by-name.json';
import {ArrowDownOutlined} from '@ant-design/icons';
import {phoneNumberValidator} from '@/utilities/validators';

const {Option} = Select;
const {TabPane} = Tabs;
const {Link} = Typography;

const CustomerEdit = () => {
    const {formProps, saveButtonProps, form, queryResult, formLoading} = useForm();

    /**
     * Function to copy billing address to shipping address
     */
    const copyBillingToShipping = () => {
        const billingAddress = form.getFieldValue('billing_address');
        form.setFieldsValue({shipping_address: billingAddress});
    };

    // Prefix selectors for work phone
    const workPhonePrefixSelector = (
        <Form.Item name={['primary_contact', 'work_phone_country_code']} noStyle>
            <Select showSearch style={{width: 120}} defaultValue="+852">
                {countryCodes.map(({dial_code, emoji}, index) => (
                    <Option key={`${dial_code}-${index}`} value={dial_code}>{`${dial_code} ${emoji}`}</Option>
                ))}
            </Select>
        </Form.Item>
    );

    // Prefix selectors for mobile phone
    const mobilePhonePrefixSelector = (
        <Form.Item name={['primary_contact', 'mobile_phone_country_code']} noStyle>
            <Select showSearch style={{width: 120}} defaultValue="+852">
                {countryCodes.map(({dial_code, emoji}, index) => (
                    <Option key={`${dial_code}-${index}`} value={dial_code}>{`${dial_code} ${emoji}`}</Option>
                ))}
            </Select>
        </Form.Item>
    );

    // Prefix selectors for fax
    const faxPrefixSelector = (
        <Form.Item name={['primary_contact', 'fax_country_code']} noStyle>
            <Select showSearch style={{width: 120}} defaultValue="+852">
                {countryCodes.map(({dial_code, emoji}, index) => (
                    <Option key={`${dial_code}-${index}`} value={dial_code}>{`${dial_code} ${emoji}`}</Option>
                ))}
            </Select>
        </Form.Item>
    );

    // Show loading spinner if form is loading
    if (formLoading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Edit saveButtonProps={saveButtonProps} title="Edit Customer">
            <Form {...formProps} layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 10}}>
                {/* Account status switch */}
                <Form.Item
                    label="Account Status"
                    name={'is_active'}
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive"/>
                </Form.Item>

                {/* Company name */}
                <Form.Item
                    label="Company Name"
                    name={'company_name'}
                >
                    <Input/>
                </Form.Item>

                {/* Display name */}
                <Form.Item
                    label="Display Name"
                    name={'display_name'}
                    rules={[{required: true, message: 'Display Name is required'}]}
                >
                    <Input/>
                </Form.Item>

                {/* Primary contact fields */}
                {/* Salutation */}
                <Form.Item label="Salutation" name={['primary_contact', 'salutation']}>
                    <Select allowClear>
                        <Option value="Mr">Mr</Option>
                        <Option value="Ms">Ms</Option>
                        <Option value="Mrs">Mrs</Option>
                        <Option value="Miss">Miss</Option>
                        <Option value="Dr">Dr</Option>
                    </Select>
                </Form.Item>

                {/* First Name */}
                <Form.Item
                    label="First Name"
                    name={['primary_contact', 'first_name']}
                >
                    <Input/>
                </Form.Item>

                {/* Last Name */}
                <Form.Item
                    label="Last Name"
                    name={['primary_contact', 'last_name']}
                >
                    <Input/>
                </Form.Item>

                {/* Email */}
                <Form.Item
                    label="Email"
                    name={['primary_contact', 'email']}
                    rules={[{type: 'email', message: 'Please enter a valid email'}]}
                >
                    <Input/>
                </Form.Item>

                {/* Work Phone */}
                <Form.Item
                    label="Work Phone"
                    name={['primary_contact', 'work_phone']}
                    rules={[
                        {
                            message: 'Please input a work phone number!',
                        },
                        phoneNumberValidator
                    ]}
                >
                    <Input addonBefore={workPhonePrefixSelector} style={{width: '100%'}}/>
                </Form.Item>

                {/* Mobile Phone */}
                <Form.Item
                    label="Mobile Phone"
                    name={['primary_contact', 'mobile_phone']}
                    rules={[
                        {
                            message: 'Please input a mobile phone number!',
                        },
                        phoneNumberValidator
                    ]}
                >
                    <Input addonBefore={mobilePhonePrefixSelector} style={{width: '100%'}}/>
                </Form.Item>

                {/* Fax */}
                <Form.Item
                    label="Fax"
                    name={['primary_contact', 'fax']}
                    rules={[
                        {
                            message: 'Please input a fax number!',
                        },
                        phoneNumberValidator
                    ]}
                >
                    <Input addonBefore={faxPrefixSelector} style={{width: '100%'}}/>
                </Form.Item>

                {/* Tabs */}
                <Tabs defaultActiveKey="1">
                    {/* Address tab */}
                    <TabPane tab="Address" key="1">
                        <Row gutter={16}>
                            {/* Billing address */}
                            <Col span={12}>
                                <h3>Billing Address</h3>
                                {/* Attention */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Attention"
                                    name={['billing_address', 'attention']}
                                >
                                    <Input/>
                                </Form.Item>

                                {/* Country */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    name={['billing_address', 'country']}
                                    label="Country"
                                >
                                    <Select showSearch placeholder="Select a country">
                                        {countryCodesSortByName.map(({name, code}) => (
                                            <Option key={code} value={name}>{name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                {/* Address Line 1 */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Address Line 1"
                                    name={['billing_address', 'address_line1']}
                                >
                                    <Input.TextArea autoSize={{minRows: 2, maxRows: 6}}/>
                                </Form.Item>

                                {/* Address Line 2 */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Address Line 2"
                                    name={['billing_address', 'address_line2']}
                                >
                                    <Input.TextArea autoSize={{minRows: 2, maxRows: 6}}/>
                                </Form.Item>

                                {/* City */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="City"
                                    name={['billing_address', 'city']}
                                >
                                    <Input/>
                                </Form.Item>

                                {/* State */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="State"
                                    name={['billing_address', 'state']}
                                >
                                    <Input/>
                                </Form.Item>

                                {/* Zip Code */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Zip Code"
                                    name={['billing_address', 'zip_code']}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>

                            {/* Shipping address */}
                            <Col span={12}>
                                {/* Shipping address header and copy billing address link */}
                                <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px'}}>
                                    <h3 style={{margin: 0}}>Shipping Address</h3>
                                    <Link onClick={copyBillingToShipping}
                                          style={{marginLeft: '8px', display: 'flex', alignItems: 'center'}}>
                                        (
                                        <ArrowDownOutlined style={{marginRight: '4px'}}/>
                                        Copy billing address
                                        <ArrowDownOutlined style={{marginRight: '4px'}}/>
                                        )
                                    </Link>
                                </div>

                                {/* Attention */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Attention"
                                    name={['shipping_address', 'attention']}
                                >
                                    <Input/>
                                </Form.Item>

                                {/* Country */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    name={['shipping_address', 'country']}
                                    label="Country"
                                >
                                    <Select showSearch placeholder="Select a country">
                                        {countryCodesSortByName.map(({name, code}) => (
                                            <Option key={code} value={name}>{name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                {/* Address Line 1 */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Address Line 1"
                                    name={['shipping_address', 'address_line1']}
                                >
                                    <Input.TextArea autoSize={{minRows: 2, maxRows: 6}}/>
                                </Form.Item>

                                {/* Address Line 2 */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Address Line 2"
                                    name={['shipping_address', 'address_line2']}
                                >
                                    <Input.TextArea autoSize={{minRows: 2, maxRows: 6}}/>
                                </Form.Item>

                                {/* City */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="City"
                                    name={['shipping_address', 'city']}
                                >
                                    <Input/>
                                </Form.Item>

                                {/* State */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="State"
                                    name={['shipping_address', 'state']}
                                >
                                    <Input/>
                                </Form.Item>

                                {/* Zip Code */}
                                <Form.Item
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 12}}
                                    label="Zip Code"
                                    name={['shipping_address', 'zip_code']}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </Form>
        </Edit>
    );
};

export default CustomerEdit;
