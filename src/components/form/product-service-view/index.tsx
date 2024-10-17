'use client';

import { Table, Typography } from 'antd';
import { ScreenLoading } from '../../screen-loading';
import React, { useEffect, useState } from 'react';
import { currencyNumber } from '@/utilities/currency-number';

const { Text } = Typography;

interface Item {
    item_detail: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    total_amount?: number;
    order: number;
}

interface ProductsServicesReadOnlyProps {
    items: Item[];
    isLoading: boolean;
}

const ProductsServicesView: React.FC<ProductsServicesReadOnlyProps> = ({ items, isLoading }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const columns = [
        {
            title: 'Item Details',
            dataIndex: 'item_detail',
            key: 'item_detail',
            render: (text: string) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Unit Price',
            dataIndex: 'unit_price',
            key: 'unit_price',
            render: (value: number) => `${currencyNumber(value)}`,
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            render: (value: number) => `${currencyNumber(value)}`,
        },
        {
            title: 'Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (value: number) => `${currencyNumber(value)}`,
        },
    ];

    if (!isMounted) {
        return <ScreenLoading height="15vh" />;
    }

    return (
        <div style={{ padding: '0px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Products / Services</h1>
            </div>
            <div style={{ marginTop: '32px', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                {isLoading ? (
                    <ScreenLoading height="15vh" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={items}
                        pagination={false}
                        rowKey={(record) => record.order}
                        bordered
                    />
                )}
            </div>
        </div>
    );
};

export default ProductsServicesView;
