import server from "./app"

!(async () => {
    try {
        await server.listen(4747)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
})()