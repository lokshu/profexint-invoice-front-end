'use client';

import { EditButton, ShowButton, getDefaultSortOrder, List, useTable, FilterDropdown } from '@refinedev/antd';
import { BaseRecord } from '@refinedev/core';
import { Button, Form, Input, Space, Spin, Table, Tag, Radio } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import React from 'react';
import debounce from 'lodash/debounce';
import Link from 'next/link';
import moment from 'moment';

const PaymentList = () => {
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
    const { tableProps, sorter, searchFormProps, tableQueryResult } = useTable({
        resource: "payments",
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: 'payment_date',
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

    // Debounce the search input change event
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
                            placeholder="Search Payments..."
                            onChange={debouncedOnChange}
                        />
                    </Form.Item>
                </Form>
            </Space>

            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="payment_date"
                    title="Date"
                    sorter
                    defaultSortOrder={getDefaultSortOrder('payment_date', sorter)}
                    render={(text) => moment(text).format('DD MMM YYYY')}
                />
                <Table.Column dataIndex="payment_number" title="Payment Number" sorter />

                <Table.Column dataIndex="customer_display_name" title="Customer Name" sorter />
                <Table.Column dataIndex="payment_method_name" title="Payment Method" sorter />
                <Table.Column
                    dataIndex="amount"
                    title="Amount"
                    sorter
                    render={(value) => {
                        const amount = parseFloat(value);
                        return isNaN(amount) ? value : `$${amount.toFixed(2)}`;
                    }}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};

export default PaymentList;
