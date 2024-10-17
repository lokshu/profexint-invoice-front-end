'use client';

import { EditButton, ShowButton, getDefaultSortOrder, List, useTable, FilterDropdown } from '@refinedev/antd';
import { BaseRecord } from '@refinedev/core';
import { Button, Form, Input, Space, Spin, Table, Tag, Radio } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import React from 'react';
import debounce from 'lodash/debounce';
import Link from 'next/link';
import moment from 'moment';

type Status = 'pending' | 'paid' | 'partial_paid' | 'cancelled';

const statusColors: { [key in Status]: string } = {
    pending: 'orange',
    paid: 'green',
    partial_paid: 'blue',
    cancelled: 'red',
};

const InvoiceList = () => {
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
        resource: "invoices",
        syncWithLocation: true,
        sorters: {
            initial: [
                {
                    field: 'reference_number',
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
                            placeholder="Search Invoices..."
                            onChange={debouncedOnChange}
                        />
                    </Form.Item>
                </Form>

                <Link href="/invoices/create" passHref>
                    <Button type="primary" icon={<PlusOutlined />}>
                        Create Invoice
                    </Button>
                </Link>
            </Space>

            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="creation_date"
                    title="Date"
                    sorter
                    defaultSortOrder={getDefaultSortOrder('creation_date', sorter)}
                    render={(text) => moment(text).format('DD MMM YYYY')}
                />
                <Table.Column dataIndex="reference_number" title="Invoice Number" sorter />
                <Table.Column dataIndex="latest_version" title="Version" sorter />
                <Table.Column dataIndex="customer_name" title="Customer Name" sorter />
                <Table.Column dataIndex="latest_version_status" title="Status" sorter
                              render={status => {
                                  const color = statusColors[status as Status] || 'black';
                                  return <Tag color={color}>{status}</Tag>;
                              }}
                              filterDropdown={(props) => (
                                  <FilterDropdown {...props}>
                                      <Radio.Group>
                                          <Radio value="pending">Pending</Radio>
                                          <Radio value="paid">Paid</Radio>
                                          <Radio value="partial_paid">Partial Paid</Radio>
                                          <Radio value="cancelled">Cancelled</Radio>
                                      </Radio.Group>
                                  </FilterDropdown>
                              )}
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

export default InvoiceList;
