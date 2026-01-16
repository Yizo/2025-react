import { Col, Row, Spin } from 'antd'

const Loading = () => {
  return (
    <Row align="middle" justify="center" style={{ minHeight: '100%' }}>
      <Col>
        <Spin spinning />
      </Col>
    </Row>
  )
}

export default Loading
