import React, { useState, useEffect } from 'react';
import { Button, Col, Divider, Form, Input, Row, Select } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { AdjustmentEntry, AdjustmentFieldsProps } from '@/types/interfaces';

// Destructure the Select component from antd
const { Option } = Select;

// Empty adjustment entry to be used when adding a new adjustment
const emptyAdjustment: AdjustmentEntry = {
    price_adjustment: '',
    amount: 0,
    order: 0
};

const AdjustmentFields = ({
                              adjustments,
                              setAdjustments,
                              adjustmentOptions,
                              setAdjustmentOptions,
                              isLoading,
                              form
                          }: AdjustmentFieldsProps) => {
    // State to store the name of the new adjustment option
    const [name, setName] = useState<string>('');

    // UseEffect to set initial values for adjustments
    useEffect(() => {
        form.setFieldsValue({ adjustments });
    }, [adjustments, form]);

    /**
     * Function to update the adjustments state when an adjustment selection (dropdown) changes
     * @param {number} index
     * @param {keyof AdjustmentEntry} field
     * @param {string | number} value
     */
    const handleAdjustmentSelectionChange = (index: number, field: keyof AdjustmentEntry, value: string | number) => {
        setAdjustments(prevAdjustments => {
            return prevAdjustments.map((adj, idx) => {
                if (idx === index) {
                    return { ...adj, [field]: value };
                }
                return adj;
            });
        });
    };

    /**
     * Function to add a new adjustment option when user clicks the 'Add Item' button from the dropdown
     * @param {string} name - The name of the new adjustment option
     * @returns {string} - The id of the new adjustment option
     */
    const handleAddAdjustmentOption = (name: string) => {
        // The newly created adjustment option will have a prefix of 'new-' to indicate it's a new option
        const newAdjustment = { id: `new-${Date.now()}`, name };

        // Update the adjustment options state to include the new adjustment
        setAdjustmentOptions(prev => [...prev, newAdjustment]);

        // Return the id of the new adjustment option
        return newAdjustment.id;
    };

    /**
     * Function to update the adjustments state and form state when an adjustment field changes
     * @param {number} index
     * @param {keyof AdjustmentEntry} field
     * @param {string | number} value
     */
    const handleAdjustmentChange = (
        index: number,
        field: keyof AdjustmentEntry,
        value: string | number
    ) => {
        // Create a new copy of the adjustments array from the state
        const newAdjustments: AdjustmentEntry[] = [...adjustments];

        // If the adjustment entry does not exist, create a new empty adjustment entry
        if (!newAdjustments[index]) {
            newAdjustments[index] = emptyAdjustment;
        }

        // Update the field value based on the field type
        if (field === 'amount' && typeof value === 'number') {
            newAdjustments[index][field] = value;
        } else if (field === 'price_adjustment' && typeof value === 'string') {
            newAdjustments[index][field] = value;
        }

        // Update the adjustments state with the new adjustments array
        setAdjustments(newAdjustments);

        // Update the form state with the new adjustments array
        form.setFieldsValue({ adjustments: newAdjustments });
    };

    /**
     * Function to add a new adjustment entry to the adjustments state
     */
    const handleAdjustmentAdd = () => {
        const newAdjustment = {
            ...emptyAdjustment,
            order: adjustments.length
        };
        setAdjustments(prevAdjustments => [...prevAdjustments, newAdjustment]);
    };

    /**
     * Function to remove an adjustment entry from the adjustments state
     * @param {number} index
     */
    const handleAdjustmentRemove = (index: number) => {
        // Remove the adjustment entry at the specified index and reassign the order
        const newAdjustments = adjustments.filter((_, idx) => idx !== index)
            .map((adj, idx) => ({ ...adj, order: idx })); // Reassign order to maintain consistency
        setAdjustments(newAdjustments);
    };

    return (
        <Form.List name="adjustments">
            {(fields, { add, remove }) => (
                <>
                    {fields.map((field, index) => (
                        <Row key={field.key} align="middle" gutter={8}>
                            {/* The price adjustment options dropdown */}
                            <Col span={12}>
                                <Form.Item
                                    name={[field.name, 'price_adjustment']}
                                    rules={[{ required: true, message: 'Please select an adjustment' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select an adjustment"
                                        onChange={(value) => handleAdjustmentSelectionChange(index, 'price_adjustment', value)}
                                        filterOption={(input, option) =>
                                            option?.children
                                                ? React.isValidElement(option.children) // Check if children is a React element
                                                    ? false // If so, we cannot directly perform string operations on it
                                                    : option.children.toString().toLowerCase().includes(input.toLowerCase())
                                                : false
                                        }
                                        loading={isLoading}

                                        // Custom dropdown render
                                        dropdownRender={menu => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                                    <Input style={{ flex: 'auto' }}
                                                           onChange={e => setName(e.target.value)}
                                                           value={name} />
                                                    <a
                                                        style={{
                                                            flex: 'none',
                                                            padding: '8px',
                                                            display: 'block',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => {
                                                            const id = handleAddAdjustmentOption(name);
                                                            setName(''); // Clear the input after adding
                                                        }}
                                                    >
                                                        <PlusCircleOutlined /> Add item
                                                    </a>
                                                </div>
                                            </>
                                        )}
                                    >
                                        {adjustmentOptions.map(option => (
                                            <Option key={option.id} value={option.id}>{option.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            {/* The amount input field */}
                            <Col span={10}>
                                <Form.Item
                                    name={[field.name, 'amount']}
                                    rules={[{ required: true, message: 'Please enter the amount' }]}
                                >
                                    <Input
                                        type="number"
                                        prefix="$"
                                        onChange={e => handleAdjustmentChange(index, 'amount', parseFloat(e.target.value))}
                                    />
                                </Form.Item>
                            </Col>

                            {/* The remove button */}
                            <Col span={2}>
                                <Form.Item>
                                    <Button
                                        danger
                                        onClick={() => {
                                            handleAdjustmentRemove(index)
                                            remove(field.name)
                                        }}
                                        icon={<MinusCircleOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    ))}

                    {/* The add adjustment button */}
                    <Button type="dashed" onClick={() => {
                        handleAdjustmentAdd();
                        add(emptyAdjustment);
                    }}
                            block
                            icon={<PlusCircleOutlined />}
                            style={{ color: '#1677ff' }}>
                        Add Adjustment
                    </Button>
                </>
            )}
        </Form.List>
    );
}

export default AdjustmentFields;
