import React from 'react';
import { Col, Divider, Row, Typography } from 'antd';
import { AdjustmentEntry } from '@/types/interfaces';

const { Text } = Typography;

interface AdjustmentFieldsReadOnlyProps {
    adjustments: AdjustmentEntry[];
}

const AdjustmentFieldsView: React.FC<AdjustmentFieldsReadOnlyProps> = ({ adjustments }) => {
    const getAdjustmentName = (priceAdjustment: string | { name: string }): string => {
        if (typeof priceAdjustment === 'string') {
            return priceAdjustment;
        } else if (priceAdjustment && typeof priceAdjustment.name === 'string') {
            return priceAdjustment.name;
        }
        return 'N/A';
    };

    return (
        <>
            {adjustments.map((adjustment, index) => (
                <Row key={index} align="middle" gutter={8} style={{ marginBottom: 8 }}>
                    {/* The price adjustment label */}
                    <Col span={12}>
                        <Text>{getAdjustmentName(adjustment.price_adjustment || 'N/A')}</Text>
                    </Col>

                    {/* The amount */}
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <Text>{`$${Number(adjustment.amount ?? 0).toFixed(2)}`}</Text>
                    </Col>
                </Row>
            ))}
            {adjustments.length > 0 && <Divider />}
        </>
    );
};

export default AdjustmentFieldsView;
