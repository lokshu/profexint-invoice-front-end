"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import React from "react";


export default function CategoryCreate() {
    const { formProps, saveButtonProps } = useForm({
    });

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label={"Title"}
                    name={["title"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Create>
    );
};
