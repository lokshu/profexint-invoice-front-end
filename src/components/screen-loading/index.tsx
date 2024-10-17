import { Spin } from "antd";

// Define a type for the component's props
interface ScreenLoadingProps {
    height?: string;  // Make height an optional prop with a default of "10vh"
}

// Modify the component to accept props
export const ScreenLoading = ({ height = "100vh" }: ScreenLoadingProps) => {
    return (
        <Spin
            size="large"
            style={{
                height: height,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        />
    );
};
