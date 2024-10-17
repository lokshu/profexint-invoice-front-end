import {Metadata} from 'next';
import {cookies} from 'next/headers';
import React, {Suspense} from 'react'
import {Refine} from '@refinedev/core';
import {DevtoolsProvider} from '@providers/devtools'
import {RefineKbar, RefineKbarProvider} from '@refinedev/kbar';
import {useNotificationProvider} from '@refinedev/antd';
import routerProvider from '@refinedev/nextjs-router';

import {dataProvider} from '@providers/data-provider';
import {AntdRegistry} from '@ant-design/nextjs-registry';
import '@refinedev/antd/dist/reset.css';
import {ColorModeContextProvider} from '@contexts/color-mode';
import {authProvider} from '@providers/auth-provider';
import {FileDoneOutlined, FileTextOutlined, UserOutlined, SettingOutlined, TeamOutlined} from '@ant-design/icons';



export const metadata: Metadata = {
    title: 'Profex Invoicing System',
    description: 'Profex Invoicing System',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {


    const cookieStore = cookies();
    const theme = cookieStore.get('theme');
    const defaultMode = theme?.value === 'dark' ? 'dark' : 'light';

    const CustomHeader = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/*<img src="/path/to/icon.png" alt="Custom Icon" style={{ marginRight: 8 }} />*/}
                <h1>My Custom Project</h1>
            </div>
        );
    };

    return (
        <html lang="en">
        <body>
        <Suspense>
            <RefineKbarProvider>
                <AntdRegistry>
                    <ColorModeContextProvider defaultMode={defaultMode}>
                        <DevtoolsProvider>
                            <Refine
                                routerProvider={routerProvider}
                                dataProvider={dataProvider}
                                notificationProvider={useNotificationProvider}
                                authProvider={authProvider}
                                // resources={[
                                //     {
                                //         name: "blog_posts",
                                //         list: "/blog-posts",
                                //         create: "/blog-posts/create",
                                //         edit: "/blog-posts/edit/:id",
                                //         show: "/blog-posts/show/:id",
                                //         meta: {
                                //             canDelete: true,
                                //         },
                                //     },
                                //     {
                                //         name: "categories",
                                //         list: "/categories",
                                //         create: "/categories/create",
                                //         edit: "/categories/edit/:id",
                                //         show: "/categories/show/:id",
                                //         meta: {
                                //             canDelete: true,
                                //         },
                                //     }
                                // ]}
                                resources={[
                                    {
                                        name: 'customers',
                                        list: '/customers',
                                        create: '/customers/create',
                                        edit: '/customers/edit/:id',
                                        show: '/customers/:id',
                                        meta: {
                                            canDelete: false,
                                            icon: <UserOutlined/>
                                        },
                                    },
                                    {
                                        name: 'quotations',
                                        list: '/quotations',
                                        create: '/quotations/create',
                                        edit: '/quotations/edit/:id',
                                        show: '/quotations/:id',
                                        meta: {
                                            canDelete: false,
                                            icon: <FileTextOutlined/>
                                        },
                                    },
                                    {
                                        name: 'invoices',
                                        list: '/invoices',
                                        create: '/invoices/create',
                                        edit: '/invoices/edit/:id',
                                        show: '/invoices/:id',
                                        meta: {
                                            canDelete: false,
                                            icon: <FileDoneOutlined/>
                                        },
                                    },
                                    {
                                        name: 'payments',
                                        list: '/payments',
                                        create: '/payments/create',
                                        edit: '/payments/edit/:id',
                                        show: '/payments/:id',
                                        meta: {
                                            canDelete: false,
                                            icon: <FileDoneOutlined/>
                                        },
                                    },
                                    {
                                        name: 'users',
                                        list: '/users',
                                        create: '/users/create',
                                        edit: '/users/edit/:id',
                                        show: '/users/:id',
                                        meta: {
                                            canDelete: false,
                                            icon: <TeamOutlined/>
                                        },
                                    },
                                    {
                                        name: 'settings',
                                        list: '/settings',
                                        meta: {
                                            icon: <SettingOutlined/>,
                                            label: 'Settings',
                                            custom: true, // Mark this as a custom page
                                        },
                                    }
                                ]}
                                options={{
                                    syncWithLocation: true,
                                    warnWhenUnsavedChanges: true,
                                    useNewQueryKeys: true,
                                    projectId: 'h3S8v1-UCDpgX-SQX9nP',

                                }}
                            >
                                {children}
                                <RefineKbar/>
                            </Refine>
                        </DevtoolsProvider>
                    </ColorModeContextProvider>
                </AntdRegistry>
            </RefineKbarProvider>
        </Suspense>
        </body>
        </html>
    );
}
