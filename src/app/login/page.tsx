import { AuthPage } from "@components/auth-page";
import { authProviderServer } from "@providers/auth-provider";
import { redirect } from "next/navigation";
import { ThemedTitleV2 } from "@refinedev/antd";
import { FileTextOutlined } from '@ant-design/icons';

export default async function Login() {
    const data = await getData();

    if (data.authenticated) {
        redirect(data?.redirectTo || "/");
    }

    return <AuthPage
        type="login"
        registerLink=""
        title={
        <ThemedTitleV2
            collapsed={false}
            text="Profex Invoicing System"
            icon={<FileTextOutlined />}
        />
    } />;
}

async function getData() {
    const { authenticated, redirectTo, error } =
        await authProviderServer.check();

    return {
        authenticated,
        redirectTo,
        error,
    };
}
