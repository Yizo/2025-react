import { Col, Row, Spin } from "antd";

const LazyLoading = () => {
	return (
		<Row align="middle" justify="center" className="pt-[20vh]">
			<Col>
				<Spin spinning />
			</Col>
		</Row>
	);
};

export default LazyLoading;
