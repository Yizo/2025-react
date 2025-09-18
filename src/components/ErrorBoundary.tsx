import { isRouteErrorResponse, useNavigate } from "react-router";
import { Result, Button, Typography } from "antd";

const { Paragraph, Text } = Typography;

export default function ErrorBoundary(data: any) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;
	const { error } = data;
	const navigate = useNavigate();

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<Result
				status="error"
				title={message}
				subTitle={details}
				extra={[
					<Button key="buy" onClick={() => navigate("/")}>
						返回首页
					</Button>,
				]}
			>
				{stack && (
					<Paragraph>
						<Text
							strong
							style={{
								fontSize: 16,
							}}
						>
							The content you submitted has the following error:
						</Text>
					</Paragraph>
				)}
			</Result>
		</main>
	);
}
