'use client';

import { Edit, useForm } from '@refinedev/antd';
import { Button, Col, Form, Input, Modal, Select, Typography, notification, Skeleton, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCustom, useShow } from '@refinedev/core';
import { Group, User } from '@/types/interfaces';
import { dataProvider } from '@providers/data-provider';

const { Option } = Select;
const { Link } = Typography;

const UserEdit = () => {
    const { formProps, saveButtonProps, form } = useForm<User>();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();

    const { data: groupsData, isLoading: groupsLoading } = useCustom<Group[]>({
        url: 'groups/dropdown',
        method: 'get',
    });

    const { queryResult } = useShow<User>({
        resource: 'users',
        id: formProps.initialValues?.id,
    });

    useEffect(() => {
        if (groupsData) {
            setGroups(groupsData.data);
        }
    }, [groupsData]);

    useEffect(() => {
        if (queryResult?.data?.data) {
            const userData = queryResult.data.data;
            form.setFieldsValue({
                ...userData,
                group: userData.group,
                is_active: userData.is_active
            });
        }
    }, [queryResult, form]);

    const openSuccessNotification = () => {
        notification.success({
            message: 'Password Reset Successful',
            description: 'The password has been reset successfully.',
            placement: 'topRight',
        });
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        passwordForm.resetFields();
    };

    const handlePasswordReset = async () => {
        try {
            const values = await passwordForm.validateFields();
            const { id } = formProps.initialValues!;
            await dataProvider.update({
                resource: 'reset-password',
                id,
                variables: values,
            });
            setIsModalVisible(false);
            passwordForm.resetFields();
            openSuccessNotification();
        } catch (error) {
            console.error("Failed to reset password:", error);
        }
    };

    return (
        <>
            <Edit saveButtonProps={saveButtonProps} title={'Edit User'}>
                {queryResult.isLoading ? (
                    <Skeleton active />
                ) : (
                    <Form {...formProps} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 10 }} form={form}>
                        {/* Active Status */}
                        <Form.Item label="Active" name={'is_active'} valuePropName="checked">
                            <Switch />
                        </Form.Item>

                        {/* Group */}
                        <Form.Item label="Group" name={'group'} rules={[{ required: true, message: 'Please select a group' }]}>
                            <Select placeholder="Select group" loading={groupsLoading}>
                                {groups.map(group => (
                                    <Option key={group.id} value={group.id}>{group.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Username */}
                        <Form.Item label="Username" name={'username'}>
                            <Input disabled />
                        </Form.Item>

                        {/* Email */}
                        <Form.Item
                            label="Email"
                            name={'email'}
                            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                        >
                            <Input />
                        </Form.Item>

                        {/* First Name */}
                        <Form.Item label="First Name" name={'first_name'}>
                            <Input />
                        </Form.Item>

                        {/* Last Name */}
                        <Form.Item label="Last Name" name={'last_name'}>
                            <Input />
                        </Form.Item>

                        {/* Custom Code */}
                        <Form.Item label="Custom Code" name={['userprofile', 'custom_code']}>
                            <Input placeholder={"Custom code to represent the user e.g. PF"} />
                        </Form.Item>

                        {/* Reset Password Button */}
                        <Form.Item wrapperCol={{ offset: 4, span: 10 }}>
                            <Button type="primary" onClick={showModal} danger>
                                Reset Password
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Edit>

            <Modal title="Reset Password" visible={isModalVisible} onOk={handlePasswordReset} onCancel={handleCancel}>
                <Form form={passwordForm} layout="vertical">
                    {/* New Password */}
                    <Form.Item
                        label="New Password"
                        name={'new_password'}
                        rules={[{ required: true, message: 'New Password is required' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UserEdit;
