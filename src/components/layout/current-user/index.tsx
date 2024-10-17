import React, { useState } from "react";

import { useGetIdentity, useLogout } from "@refinedev/core";

import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Popover, Typography, Avatar } from "antd";

import { AccountSettings } from "../account-settings";

type IUser = {
    id: number;
    name: string;
    avatar: string;
};

const { Text } = Typography;

export const CurrentUser: React.FC = () => {
    const [opened, setOpened] = useState(false);
    const { data: user } = useGetIdentity<IUser>();
    const { mutate: logout } = useLogout();

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

    const content = (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Text
                strong
                style={{
                    padding: "12px 20px",
                }}
            >
                {user?.name}
            </Text>
            <div
                style={{
                    borderTop: "1px solid #d9d9d9",
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                }}
            >
                {/*<Button*/}
                {/*    style={{ textAlign: "left" }}*/}
                {/*    icon={<SettingOutlined />}*/}
                {/*    type="text"*/}
                {/*    block*/}
                {/*    onClick={() => setOpened(true)}*/}
                {/*>*/}
                {/*    Account settings*/}
                {/*</Button>*/}
                <Button
                    style={{ textAlign: "left" }}
                    icon={<LogoutOutlined />}
                    type="text"
                    danger
                    block
                    onClick={() => logout()}
                >
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Popover
                placement="bottomRight"
                content={content}
                trigger="click"
                overlayInnerStyle={{ padding: 0 }}
                overlayStyle={{ zIndex: 999 }}
            >
                {avatarContent}
            </Popover>
            {user && (
                <AccountSettings
                    opened={opened}
                    setOpened={setOpened}
                    userId={user.id.toString()}
                />
            )}
        </>
    );
};
