'use client';

import {DeleteOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {Button, Col, Form, Input, InputNumber, InputNumberProps, Row, Typography,} from 'antd';

import {TextAreaProps} from 'antd/lib/input';

import {ScreenLoading} from '../../screen-loading'

import {currencyNumber} from '@/utilities/currency-number';
import React, {useEffect, useState} from 'react';

const {Text} = Typography;

const inputStyle = {
    border: 'none', // Hides the border by default
    outline: 'none', // Removes the outline that appears on focus
};

const focusedInputStyle = {
    border: '1px solid #d9d9d9', // Standard border style when focused
};

const CustomTextArea: React.FC<TextAreaProps> = ({onChange, onFocus, onBlur, ...props}) => {
    const [isFocused, setFocused] = useState(false);

    return (
        <Input.TextArea
            {...props}
            autoSize={{minRows: 1, maxRows: 10}}
            onChange={onChange}
            onFocus={(e) => {
                setFocused(true);
                if (onFocus) onFocus(e);
            }}
            onBlur={(e) => {
                setFocused(false);
                if (onBlur) onBlur(e);
            }}
            style={isFocused ? focusedInputStyle : inputStyle}
        />
    );
};

const CustomInputNumber: React.FC<CustomInputNumberProps> = ({
                                                                 shouldFormatCurrency = false,
                                                                 enforceNegative = false,
                                                                 onFocus,
                                                                 onBlur,
                                                                 ...props
                                                             }) => {
    const [isFocused, setFocused] = useState(false);

    // Apply conditional styles based on focus
    const appliedStyle = isFocused ? {...focusedInputStyle, ...props.style} : {...inputStyle, ...props.style};

    return (
        <InputNumber
            {...props}
            onFocus={(e) => {
                setFocused(true);
                if (onFocus) onFocus(e);
            }}
            onBlur={(e) => {
                setFocused(false);
                if (onBlur) onBlur(e);
            }}
            style={appliedStyle}
            formatter={value => {
                if (value === null || value === undefined) {
                    return '';
                }
                if (shouldFormatCurrency) {
                    return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                } else {
                    return value.toString();
                }
            }}
            parser={(value) => {
                let parsedValue = parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0');
                if (enforceNegative && parsedValue > 0) {
                    parsedValue = -parsedValue;
                }
                return parsedValue;
            }}
            max={9999999999.99}
            precision={2}
        />
    );
};

interface Item {
    item_detail: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    total_amount?: number;
    order: number;
}

interface ProductsServicesProps {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    isLoading: boolean;
}

interface CustomInputNumberProps extends InputNumberProps {
    shouldFormatCurrency?: boolean;
    enforceNegative?: boolean;
}

const initialItem: Item = {
    item_detail: '',
    quantity: 0,
    unit_price: 0,
    discount: 0,
    total_amount: 0,
    order: 0
};

const ProductsServices: React.FC<ProductsServicesProps> = ({
                                                               items,
                                                               setItems,
                                                               isLoading,
                                                           }) => {
    const [form] = Form.useForm();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true); // This will set isMounted to true only when on the client
        form.setFieldsValue({ items });
    }, [form, items]);

    const handleAddItem = () => {
        const newItem = {...initialItem, order: items.length}; // ensure a fresh object is used
        setItems(prevItems => [...prevItems, newItem]);
        //onItemAdd(); // If there's additional logic tied to adding items externally
    };

    // const handleRemoveItem = (index: number) => {
    //     setItems(prevItems => prevItems.filter((_, idx) => idx !== index));
    //     onItemRemove(index); // If there's additional logic tied to removing items externally
    // };

    const handleRemoveItem = (index: number) => {
        setItems(prevItems => {
            const updatedItems = prevItems.filter((_, idx) => idx !== index)
                .map((item, idx) => ({ ...item, order: idx })); // Update order after removal
            return updatedItems;
        });
        //onItemRemove(index); // Trigger any additional external logic
    };

    // const handleQuantityChange = (index: number, value: any) => {
    //     if (value === null || value === undefined) return;
    //     const numericValue = parseFloat(value);
    //     if (isNaN(numericValue)) return;
    //     setItems(prevItems => {
    //         if (index >= 0 && index < prevItems.length) {
    //             const updatedItems = [...prevItems];
    //             const currentUnitPrice = updatedItems[index].unit_price || 0;
    //             updatedItems[index] = {
    //                 ...updatedItems[index],
    //                 quantity: numericValue,
    //                 total_amount: calculateTotalAmount(numericValue, currentUnitPrice),
    //             };
    //             form.setFieldsValue({items: updatedItems});
    //             return updatedItems;
    //         }
    //         return prevItems;
    //     });
    // };
    //
    // const handleUnitPriceChange = (index: number, value: any) => {
    //     if (value === null || value === undefined) return;
    //     const numericValue = parseFloat(value);
    //     if (isNaN(numericValue)) return;
    //     setItems(prevItems => {
    //         if (index >= 0 && index < prevItems.length) {
    //             const updatedItems = [...prevItems];
    //             const currentQuantity = updatedItems[index].quantity;
    //             updatedItems[index] = {
    //                 ...updatedItems[index],
    //                 unit_price: numericValue,
    //                 total_amount: calculateTotalAmount(currentQuantity, numericValue),
    //             };
    //             form.setFieldsValue({items: updatedItems});
    //             return updatedItems;
    //         }
    //         return prevItems;
    //     });
    // };

    const handleQuantityChange = (index: number, value: any) => {
        updateItem(index, 'quantity', value);
    };

    const handleUnitPriceChange = (index: number, value: any) => {
        updateItem(index, 'unit_price', value);
    };

    const handleDiscountChange = (index: number, value: any) => {
        updateItem(index, 'discount', value);
    };

    const updateItem = (index: number, key: string, value: any) => {
        if (value === null || value === undefined) return;
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return;

        setItems(prevItems => {
            if (index >= 0 && index < prevItems.length) {
                const updatedItems = [...prevItems];
                updatedItems[index] = {
                    ...updatedItems[index],
                    [key]: numericValue
                };
                // Calculate total amount with updated values
                updatedItems[index].total_amount = calculateTotalAmount(
                    updatedItems[index].quantity,
                    updatedItems[index].unit_price,
                    updatedItems[index].discount
                );
                form.setFieldsValue({ items: updatedItems });
                return updatedItems;
            }
            return prevItems;
        });
    };


    const handleItemDetailChange = (index: number, event: any) => {
        const newItems = [...items];
        newItems[index].item_detail = event.target.value;
        setItems(newItems);
        // Update form values to ensure the form state is in sync with the items array
        form.setFieldsValue({ items: newItems });
    };

    const columns = [
        {
            title: 'Item Details',
            dataIndex: 'item_detail',
            flex: 'auto',
            span: {xs: 6, md: 8},
            renderInput: (props: TextAreaProps, index: number) => <CustomTextArea
                onChange={(value) => handleItemDetailChange(index, value)}
                {...props} />,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            flex: 'auto',
            span: {
                xs: 2,
            },
            renderInput: (props: InputNumberProps, index: number) => (
                <CustomInputNumber
                    onChange={(value) => handleQuantityChange(index, value)}
                    shouldFormatCurrency={false}
                    {...props}
                    min={0}
                    style={{width: '90%'}}
                />
            ),
        },
        {
            title: 'Unit Price',
            dataIndex: 'unit_price',
            flex: 'auto',
            span: {
                xs: 6,
                md: 5,
            },
            renderInput: (props: InputNumberProps, index: number) => <CustomInputNumber
                onChange={(value) => handleUnitPriceChange(index, value)}
                {...props}
                shouldFormatCurrency={true}
            />,
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            flex: 'auto',
            span: {
                xs: 6,
                md: 5,
            },
            renderInput: (props: InputNumberProps, index: number) => <CustomInputNumber
                onChange={(value) => handleDiscountChange(index, value)}
                {...props}
                shouldFormatCurrency={true}
                enforceNegative={true}
            />,
        },
        {
            title: 'Amount',
            dataIndex: 'total_amount',
            flex: 'auto',
            span: {
                xs: 4,
            },
            renderInput: (props: InputNumberProps) => (
                <InputNumber
                    disabled
                    {...props}
                    formatter={(value) => currencyNumber(Number(value || 0))}
                    style={{width: '100%', color: 'rgba(0, 0, 0, 0.85)'}}
                    bordered={false}
                    {...props}
                />
            ),
        },
    ];

    // const calculateTotalAmount = (quantity: number, unitPrice: number) => {
    //     return parseFloat((quantity * unitPrice).toFixed(2)); // Ensure two decimal places in total
    // };

    // const calculateTotalAmount = (quantity: number, unitPrice: number, discount: number = 0) => {
    //     return parseFloat((quantity * unitPrice + discount).toFixed(2));
    // };

    const calculateTotalAmount = (quantity: number, unitPrice: number, discount: number = 0) => {
        const parsedQuantity = parseFloat(quantity.toString());
        const parsedUnitPrice = parseFloat(unitPrice.toString());
        const parsedDiscount = parseFloat(discount.toString());

        if (isNaN(parsedQuantity) || isNaN(parsedUnitPrice) || isNaN(parsedDiscount)) {
            return 0;
        }

        return parseFloat(((parsedQuantity * parsedUnitPrice) - parsedDiscount).toFixed(2));
    };

    if (!isMounted) {
        return <ScreenLoading height="15vh"/>;
    }

    return (
        <div style={{padding: '0px 32px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Products / Services</h1>
                {/*<AutoSaveIndicator isSaving={isLoading} />*/}
            </div>
            <div style={{marginTop: '32px', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden'}}>
                <Row
                    gutter={[16, 16]}
                    style={{
                        padding: '12px 16px',
                        backgroundColor: '#fafafa',
                        borderBottom: '1px solid #F0F0F0',
                    }}
                >
                    {columns.map((column) => {
                        return (
                            <Col
                                key={column.title}
                                {...column.span}
                                flex={column.flex}
                                style={{
                                    borderRight: '1px solid #F0F0F0',
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {column.title}
                                </Text>
                            </Col>
                        );
                    })}

                    {/* For the delete button */}
                    <Col span={1}>
                    </Col>
                </Row>
                <Row>

                </Row>
                <Form form={form}>
                    {isLoading ? <ScreenLoading height="15vh"/> : (
                        <Form.List name="items" initialValue={items}>
                            {(fields, {add, remove}) => (
                                <div>
                                    {fields.map((field, index) => (
                                        <div key={field.key}
                                             style={{padding: '8px 16px', borderBottom: '1px solid #d9d9d9'}}>
                                            <Row gutter={[16, 16]}>
                                                {columns.map(({title, dataIndex, span, flex, renderInput}) => (
                                                    <Col key={title} {...span} flex={flex}
                                                         style={{borderRight: '1px solid #d9d9d9'}}>
                                                        <Form.Item
                                                            name={[field.name, dataIndex] as unknown as string}
                                                            noStyle
                                                        >
                                                            {/* Call renderInput with correct parameters */}
                                                            {renderInput({name: [field.name, dataIndex] as unknown as string}, index)}
                                                        </Form.Item>
                                                    </Col>
                                                ))}
                                                <Col span={1}>
                                                    <Button danger icon={<DeleteOutlined/>} onClick={() => {
                                                        remove(index);
                                                        handleRemoveItem(index);
                                                    }}/>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                    <Button type="link" icon={<PlusCircleOutlined/>} onClick={() => {
                                        add(); // Ant Design manages form fields
                                        handleAddItem(); // Manage React state
                                    }} style={{marginTop: '8px'}}>
                                        Add new item
                                    </Button>
                                </div>
                            )}
                        </Form.List>
                    )}
                </Form>
            </div>
        </div>
    );
};

export default ProductsServices;
