'use client';

import { EditButton, ShowButton, getDefaultSortOrder, List, useTable, FilterDropdown } from '@refinedev/antd';
import { BaseRecord } from '@refinedev/core';
import { Button, Form, Input, Space, Spin, Table, Tag, Radio } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import React from 'react';
import debounce from 'lodash/debounce';
import Link from 'next/link';
import moment from 'moment';

const UserList = () => {
    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        searchFormProps?.onFinish?.({
            search: e.target.value,
        });
    };

    const { tableProps, sorter, searchFormProps, tableQueryResult } = useTable({
        resource: "users",
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: 'username',
                    order: 'desc',
                },
            ],
            mode: 'server'
        },
        pagination: {
            mode: 'server'
        },
        filters: {
            mode: 'server'
        },
        onSearch: (values: any) => {
            return [
                {
                    field: 'search',
                    operator: 'contains',
                    value: values.search,
                },
            ];
        },
    });

    const debouncedOnChange = debounce(onSearch, 500);

    return (
        <List canCreate={false}>
            <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                <Form {...searchFormProps} layout="inline">
                    <Form.Item name="name">
                        <Input
                            size="large"
                            prefix={<SearchOutlined className="anticon tertiary" />}
                            suffix={
                                <Spin
                                    size="small"
                                    spinning={tableQueryResult.isFetching}
                                />
                            }
                            placeholder="Search Users..."
                            onChange={debouncedOnChange}
                        />
                    </Form.Item>
                </Form>

                <Link href="/users/create" passHref>
                    <Button type="primary" icon={<PlusOutlined />}>
                        Create User
                    </Button>
                </Link>
            </Space>

            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="username"
                    title="Username"
                    sorter
                    defaultSortOrder={getDefaultSortOrder('username', sorter)}
                />
                <Table.Column dataIndex="email" title="Email" sorter />
                <Table.Column dataIndex="first_name" title="First Name" sorter />
                <Table.Column dataIndex="last_name" title="Last Name" sorter />
                <Table.Column dataIndex={['userprofile', 'custom_code']} title="Custom Code" sorter />
                <Table.Column
                    dataIndex="is_active"
                    title="Active"
                    render={(is_active: boolean) => (
                        <Tag color={is_active ? "green" : "red"}>
                            {is_active ? "Active" : "Inactive"}
                        </Tag>
                    )}
                    sorter
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};

export default UserList;
