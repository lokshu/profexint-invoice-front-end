"use client";

import { Show, useForm } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions, Typography, Row, Col, Tabs } from "antd";
import React from "react";
import countryCodes from '@/data/country-code.json'; // Assuming this might be used for displaying phone prefixes

const { TabPane } = Tabs;
const { Link, Text } = Typography;

export default function CustomerView() {
    const { form } = useForm();
    const { queryResult } = useShow();
    const customerData = queryResult?.data?.data;

    // Function to find country emoji by dial code
    const getCountryEmojiByDialCode = (dialCode: string) => {
        const country = countryCodes.find(country => country.dial_code === dialCode);
        return country ? country.emoji : '';
    };

    return (
        <Show title="View Customer" canDelete={false}>
            <Descriptions layout="horizontal" bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}>
                <Descriptions.Item label="Account Status">
                    <Text>{customerData?.is_active ? 'Active' : 'Inactive'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Company Name">
                    <Text>{customerData?.company_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Display Name">
                    <Text>{customerData?.display_name}</Text>
                </Descriptions.Item>
            </Descriptions>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Contact" key="1">
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Salutation">
                            <Text>{customerData?.primary_contact?.salutation}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="First Name">
                            <Text>{customerData?.primary_contact?.first_name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Name">
                            <Text>{customerData?.primary_contact?.last_name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <Text>{customerData?.primary_contact?.email}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Work Phone">
                            <Text>{customerData?.primary_contact?.work_phone && `${getCountryEmojiByDialCode(customerData?.primary_contact?.phonePrefix)} ${customerData?.primary_contact?.work_phone}`}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mobile Phone">
                            <Text>{customerData?.primary_contact?.mobile_phone && `${getCountryEmojiByDialCode(customerData?.primary_contact?.phonePrefix)} ${customerData?.primary_contact?.mobile_phone}`}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Fax">
                            <Text>{customerData?.primary_contact?.fax && `${getCountryEmojiByDialCode(customerData?.primary_contact?.phonePrefix)} ${customerData?.primary_contact?.fax}`}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </TabPane>
                <TabPane tab="Address" key="2">
                    <Row gutter={16}>
                        <Col span={12}>
                            <h3>Billing Address</h3>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Address Line 1">
                                    <Text>{customerData?.billing_address?.address_line1}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Address Line 2">
                                    <Text>{customerData?.billing_address?.address_line2}</Text>
                                </Descriptions.Item>
                                {/* Repeat for other billing address fields */}
                            </Descriptions>
                        </Col>
                        <Col span={12}>
                            <h3>Shipping Address</h3>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Address Line 1">
                                    <Text>{customerData?.shipping_address?.address_line1}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Address Line 2">
                                    <Text>{customerData?.shipping_address?.address_line2}</Text>
                                </Descriptions.Item>
                                {/* Repeat for other shipping address fields */}
                            </Descriptions>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </Show>
    );
};
