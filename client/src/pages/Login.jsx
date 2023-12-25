import { useContext } from "react";
import { Alert, Button, Form, Row, Col, Stack } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const { loginInfo, updateLoginInfo, loginUser, loginError, isLoginLoading } = useContext(AuthContext);
    return (
        <Form onSubmit={loginUser}>
            <Row style={{ height: "100vh", justifyContent: "center", paddingTop: "10%" }}>
                <Col xs={6}>
                    <Stack gap={3}>
                        <h2>Login</h2>
                        {loginError && <Alert variant="danger"><p>{loginError.message}</p></Alert>}
                        <Form.Control
                            type="email"
                            placeholder="Enter your Email"
                            onChange={(e) => updateLoginInfo({ ...loginInfo, email: e.target.value })}
                        />
                        <Form.Control
                            type="password"
                            placeholder="Enter your Password"
                            onChange={(e) => updateLoginInfo({ ...loginInfo, password: e.target.value })}
                        />
                        <Button variant="primary" type="submit" disabled={isLoginLoading}>{isLoginLoading ? "Logging in..." : "Login"}</Button>
                    </Stack>
                </Col>
            </Row>
        </Form>
    );
}

export default Login;