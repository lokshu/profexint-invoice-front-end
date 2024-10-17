'use client';

import {EditButton, FilterDropdown, getDefaultSortOrder, List, ShowButton, useTable} from '@refinedev/antd';
import {BaseRecord} from '@refinedev/core';
import {Button, Form, Input, Radio, Space, Spin, Table, Tag} from 'antd';
import {PlusOutlined, SearchOutlined} from '@ant-design/icons';
import React from 'react';
import debounce from 'lodash/debounce';
import Link from 'next/link';

const CustomerList = () => {
    /**
     * Handle search input change
     * @param e {React.ChangeEvent<HTMLInputElement>} - Event object for input change
     */
    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Call onFinish function from searchFormProps
        searchFormProps?.onFinish?.({
            search: e.target.value,
        });
    };

    // Get the tableProps, sorter, searchFormProps, and tableQueryResult from useTable hook
    const {tableProps, sorter, searchFormProps, tableQueryResult} = useTable({
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: 'display_name',
                    order: 'asc',
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

    // Debounce the search input change event
    const debouncedOnChange = debounce(onSearch, 500);

    return (
        /* List component to display the table */
        <List
            canCreate={false}
        >
            {/* Search bar and Create buttons */}
            <Space style={{display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 16}}>
                {/* Search bar */}
                <Form {...searchFormProps} layout="inline">
                    <Form.Item name="name">
                        <Input
                            size="large"
                            prefix={<SearchOutlined className="anticon tertiary"/>}
                            suffix={
                                <Spin
                                    size="small"
                                    spinning={tableQueryResult.isFetching}
                                />
                            }
                            placeholder="Search..."
                            onChange={debouncedOnChange}
                        />
                    </Form.Item>
                </Form>

                {/* Create button */}
                <Link href="/customers/create" passHref style={{marginLeft: 8, display: 'inline-block'}}>
                    <Button type="primary" icon={<PlusOutlined/>}>
                        Create Customer
                    </Button>
                </Link>
            </Space>

            {/* Table component to display the data */}
            <Table {...tableProps} rowKey="id">
                {/* Render the Display Name columns */}
                <Table.Column dataIndex="display_name" title={'Name'} sorter
                              defaultSortOrder={getDefaultSortOrder('display_name', sorter)}/>

                {/* Render the Company Name columns */}
                <Table.Column dataIndex="company_name" title={'Company Name'} sorter/>

                {/* Render the Status column */}
                <Table.Column
                    title={'Status'}
                    dataIndex="is_active"
                    render={(isActive: boolean) => {
                        const status = isActive ? 'Active' : 'Inactive';
                        const color = isActive ? 'green' : 'volcano';
                        return (
                            <Tag color={color}>{status}</Tag>
                        );
                    }}
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Radio.Group>
                                <Radio value="true">Active</Radio>
                                <Radio value="false">Inactive</Radio>
                            </Radio.Group>
                        </FilterDropdown>
                    )}
                />

                {/* Render the Actions column */}
                <Table.Column
                    title={'Actions'}
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            {/*<DeleteButton*/}
                            {/*    hideText*/}
                            {/*    size="small"*/}
                            {/*    recordItemId={record.id}*/}
                            {/*/>*/}
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};

export default CustomerList;
