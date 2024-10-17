'use client';

import { Create, useForm } from '@refinedev/antd';
import { Col, Form, Input, Select, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useCustom } from '@refinedev/core';
import { Group } from '@/types/interfaces';

const { Option } = Select;
const { Link } = Typography;

const UserCreate = () => {
    const { formProps, saveButtonProps, form } = useForm();
    const [groups, setGroups] = useState<Group[]>([]);

    const { data: groupsData, isLoading: groupsLoading } = useCustom<Group[]>({
        url: 'groups/dropdown',
        method: 'get',
    });

    useEffect(() => {
        if (groupsData) {
            setGroups(groupsData.data);
        }
    }, [groupsData]);

    return (
        <Create saveButtonProps={saveButtonProps} title={'New User'}>
            <Form {...formProps} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 10 }} form={form}>
                {/* Group */}
                <Form.Item label="Group" name={'group'} rules={[{ required: true, message: 'Please select a group' }]}>
                    <Select placeholder="Select group" loading={groupsLoading}>
                        {groups.map(group => (
                            <Option key={group.id} value={group.name}>{group.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Username */}
                <Form.Item
                    label="Username"
                    name={'username'}
                    rules={[{ required: true, message: 'Username is required' }]}
                >
                    <Input />
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

                {/* Password */}
                <Form.Item
                    label="Password"
                    name={'password'}
                    rules={[{ required: true, message: 'Password is required' }]}
                >
                    <Input.Password />
                </Form.Item>

                {/* Custom Code */}
                <Form.Item label="Custom Code" name={['userprofile', 'custom_code']}>
                    <Input placeholder={"Custom code to represent the user e.g. PF"} />
                </Form.Item>
            </Form>
        </Create>
    );
};

export default UserCreate;
