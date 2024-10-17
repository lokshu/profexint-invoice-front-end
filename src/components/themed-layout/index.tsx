"use client";

import { Header } from "@components/header";
import { ThemedLayoutV2, ThemedTitleV2 } from "@refinedev/antd";
import React from "react";
import {FileTextOutlined} from '@ant-design/icons';

export const ThemedLayout = ({ children }: React.PropsWithChildren) => {
    return (
        <ThemedLayoutV2 Title={({ collapsed }) => (
            <ThemedTitleV2
                // collapsed is a boolean value that indicates whether the <Sidebar> is collapsed or not
                collapsed={collapsed}
                icon={collapsed ? <FileTextOutlined /> : <FileTextOutlined />}
                text="Profex Invoicing"
            />
        )} Header={() => <Header sticky /> }
        >
            {children}
        </ThemedLayoutV2>
    );
};
