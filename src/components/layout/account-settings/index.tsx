import React, { useState, useEffect } from "react";

import { useGetIdentity, useUpdate, useNotification } from "@refinedev/core";

import { Form } from 'antd';

import { HttpError, useOne } from "@refinedev/core";

import {
    CloseOutlined,
    EditOutlined,
    GlobalOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
} from "@ant-design/icons";

import {
    Button,
    Card,
    Drawer,
    Input,
    Select,
    Space,
    Spin,
    Typography,
    Avatar
} from "antd";

import { SingleElementForm } from "../../form/single-element-form";

const { Text } = Typography;

import styles from "./index.module.css";
import {dataProvider} from '@providers/data-provider';

type IUser = {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string;
};

type Props = {
    opened: boolean;
    setOpened: (opened: boolean) => void;
    userId: string;
};

type FormKeys = "id" | "first_name" | "last_name" | "email" | "avatar";

interface UpdatePasswordParams {
    currentPassword: string;
    newPassword: string;
}

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
    const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
    const [activeForm, setActiveForm] = useState<FormKeys>();
    const { data: user } = useGetIdentity<IUser>();
    const { mutate: update, isLoading: updateLoading } = useUpdate();
    const { open } = useNotification();
    const [updating, setUpdating] = useState(false);
    const [editingField, setEditingField] = useState<FormKeys | null>(null);

    useEffect(() => {
        // This effect runs when `updateLoading` changes.
        // When `updateLoading` becomes false, it means the update operation has completed.
        if (updating && !updateLoading && activeForm) {
            // Reset the form state here, as the update operation has completed.
            setActiveForm(undefined);
            setUpdating(false);
            setEditingField(null);
            // Optionally, notify the user of success here if appropriate.
        }
    }, [updateLoading, activeForm, updating]);
    const closeModal = () => {
        setOpened(false);
    };

    const handleUpdate = async (field: FormKeys, values: any) => {
        try {
            setUpdating(true);
            setEditingField(field);
            update({
                resource: 'users', // The resource to update, e.g., 'users'
                id: userId, // The ID of the resource to update
                values, // The new values for the update
            });
        } catch (error) {
            let message = 'Unknown error';
            if (error instanceof Error) {
                message = error.message;
            }
            if (open) {
                open({
                    message: 'Error updating user',
                    type: 'error',
                    description: message || 'Unknown error',
                });
            }

            setUpdating(false);
            setEditingField(null);
        }
    };

    const getInitials = (name: string) => {
        const names = name.split(' ');
        const initials = names.length > 1
            ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`
            : names[0].charAt(0);
        return initials.toUpperCase();
    };

    const avatarContent = user?.avatar
        ? <Avatar src={user.avatar} alt={user?.name} />
        : <Avatar>{getInitials(user?.name || '')}</Avatar>;
    //
    // if (isError) {
    //     closeModal();
    //     return null;
    // }
    //
    // if (updateLoading) {
    //     return (
    //         <Drawer
    //             open={opened}
    //             width={756}
    //             bodyStyle={{
    //                 background: "#f5f5f5",
    //                 display: "flex",
    //                 alignItems: "center",
    //                 justifyContent: "center",
    //             }}
    //         >
    //             <Spin />
    //         </Drawer>
    //     );
    // }
    //
    // const { id, name, email, jobTitle, phone, timezone, avatarUrl } =
    // data?.data ?? {};

    const getActiveForm = (key: FormKeys) => {
        if (activeForm === key) {
            return "form";
        }

        if (!user?.[key]) {
            return "empty";
        }

        return "view";
    };

    const handleChangePasswordVisibility = () => {
        setIsChangePasswordVisible(!isChangePasswordVisible);
    };

    const updatePassword = async ({ currentPassword, newPassword }: UpdatePasswordParams) => {
        try {
            // Use the dataProvider to make a POST request to the change-password endpoint
            const result = await dataProvider.create({
                resource: 'change-password', // Assuming 'change-password' is treated as a resource
                variables: {
                    current_password: currentPassword,
                    new_password: newPassword,
                },
            });

            // If successful, show a success notification
            if (open) {
                open({ message: 'Success', description: 'Password changed successfully', type: 'success' });
            }
        } catch (error) {
            let message = 'Error updating password';
            // Check if the error response contains the expected structure
            if (error instanceof Response && error.status === 400) {
                try {
                    const errorData = await error.json(); // Parse the JSON error response
                    if (errorData.new_password && errorData.new_password.length) {
                        // Join the error messages into a single string
                        message = errorData.new_password.join(" ");
                    }
                    if (errorData.current_password && errorData.current_password.length) {
                        // Join the error messages into a single string
                        message = errorData.current_password.join(" ");
                    }
                } catch (parseError) {
                    console.error('Error parsing error response', parseError);
                }
            } else if (error instanceof Error) {
                // Handle generic error instances
                message = error.message;
            }
            // If there was an error, show an error notification
            if (open) {
                open({ message: message, description: 'Error updating password', type: 'error' });
            }
        }
    };


    const handleChangePassword = async (values: any) => {
        console.log('values', values);
        if (values.newPassword !== values.confirmNewPassword) {
            if (open) {
                open({message: 'Error', description: 'Passwords do not match', type: 'error'});
            }
            return;
        }

        // Here you would call your backend API to change the password
        // This is just a placeholder logic
        try {
            // Assume a function updatePassword exists and it makes the API call
            await updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
            // if (open) {
            //     open({message: 'Success', description: 'Password changed successfully', type: 'success'});
            // }
        } catch (error) {
            let message = 'Unknown error';
            if (error instanceof Error) {
                message = error.message;
            }

            if (open) {
                open({ message: 'Error updating password', description: message, type: 'error' });
            }
        }
    };

    return (
        <Drawer
            onClose={closeModal}
            open={opened}
            width={756}
            styles={{
                body: { background: "#f5f5f5", padding: 0 },
                header: { display: "none" },
            }}
        >
            <div className={styles.header}>
                <Text strong>Account Settings</Text>
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => closeModal()}
                />
            </div>
            <div className={styles.container}>
                <div className={styles.name}>
                    {avatarContent}
                    <Typography.Title
                        level={3}
                        style={{ paddingLeft: 8, margin: 0, width: "100%" }}
                        className={styles.title}
                        // editable={{
                        //     onChange(value) {
                        //         // updateMutation({
                        //         //     resource: "users",
                        //         //     id,
                        //         //     values: { name: value },
                        //         //     mutationMode: "optimistic",
                        //         //     successNotification: false,
                        //         //     meta: {
                        //         //         gqlMutation: ACCOUNT_SETTINGS_UPDATE_USER_MUTATION,
                        //         //     },
                        //         // });
                        //     },
                        //     triggerType: ["text", "icon"],
                        //     icon: <EditOutlined className={styles.titleEditIcon} />,
                        // }}
                    >
                        {user?.name}
                    </Typography.Title>
                </div>
                <Card
                    title={
                        <Space size={15}>
                            <UserOutlined />
                            <Text>User profile</Text>
                        </Space>
                    }
                    headStyle={{ padding: "0 12px" }}
                    bodyStyle={{ padding: "0" }}
                >
                    <SingleElementForm
                        formProps={{
                            initialValues: { email: user?.email },
                        }}
                        icon={<MailOutlined className="tertiary" />}
                        state="view" // Keep it always in view state
                        itemProps={{
                            name: "email",
                            label: "Email",
                        }}
                        view={<Text>{user?.email}</Text>}
                        // Remove the onClick prop for the email field to prevent editing
                        onCancel={() => setActiveForm(undefined)}
                        onUpdate={() => setActiveForm(undefined)}
                        loading={updateLoading}
                        // Pass a prop to hide the edit button, assuming SingleElementForm supports it
                        hideEditButton={true} // This is a new prop you might add to handle this case
                        editingField={editingField}
                    >
                        {/* No children here as we're not allowing editing */}
                    </SingleElementForm>



                    <SingleElementForm
                        formProps={{
                            initialValues: { first_name: user?.first_name },
                            onFinish: (values) => handleUpdate('first_name', values)
                        }}
                        icon={<IdcardOutlined className="tertiary" />}
                        state={getActiveForm("first_name")}
                        itemProps={{
                            name: "first_name",
                            label: "First Name",
                        }}
                        view={<Text>{user?.first_name}</Text>}
                        onClick={() => setActiveForm("first_name")}
                        onCancel={() => setActiveForm(undefined)}
                        onUpdate={() => setActiveForm(undefined)}
                        loading={updateLoading}
                        editingField={editingField}
                    >
                        <Input />
                    </SingleElementForm>

                    <SingleElementForm
                        formProps={{
                            initialValues: { last_name: user?.last_name },
                            onFinish: (values) => handleUpdate('last_name', values)
                        }}
                        icon={<IdcardOutlined className="tertiary" />}
                        state={getActiveForm("last_name")}
                        itemProps={{
                            name: "last_name",
                            label: "Last Name",
                        }}
                        view={<Text>{user?.last_name}</Text>}
                        onClick={() => setActiveForm("last_name")}
                        onCancel={() => setActiveForm(undefined)}
                        onUpdate={() => setActiveForm(undefined)}
                        loading={updateLoading}
                        editingField={editingField}
                    >
                        <Input />
                    </SingleElementForm>
                </Card>

                {/* Toggle Button */}
                <Button type="link" onClick={handleChangePasswordVisibility}>
                    Change Password
                </Button>

                {isChangePasswordVisible && (
                    <Card
                        title={
                            <Space size={15}>
                                <SafetyCertificateOutlined />
                                <Text>Change Password</Text>
                            </Space>
                        }
                        className="cardStyles"
                    >
                        <Form
                            name="changePasswordForm"
                            layout="vertical"
                            onFinish={handleChangePassword}
                        >
                            {/* Form Items: Current Password, New Password, Confirm New Password */}
                            <Form.Item
                                name="currentPassword"
                                label="Current Password"
                                rules={[{ required: true, message: 'Please input your current password!' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="newPassword"
                                label="New Password"
                                rules={[{ required: true, message: 'Please input your new password!' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="confirmNewPassword"
                                label="Confirm New Password"
                                rules={[{ required: true, message: 'Please confirm your new password!' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                )}
            </div>
        </Drawer>
    );
};
