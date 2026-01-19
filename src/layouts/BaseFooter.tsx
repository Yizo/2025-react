export default function BaseFooter() {
    return (
        <Layout.Footer className="text-center">
            问卷调查 &copy; {new Date().getFullYear()}
        </Layout.Footer>
    )
}