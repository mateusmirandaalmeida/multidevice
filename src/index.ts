import { WaClient } from "./client"

(async () => {
    /** first client */
    const session = new WaClient({
        sessionName: 'bot-03',
        onSocketClose: (e) => {
            console.error(e)
        }
    })
    await session.createConnection()


    /** second client */
    // const session2 = new WaClient({
    //     sessionName: 'bot-04',
    //     onSocketClose: (e) => {
    //         console.error(e)
    //     }
    // })
    // await session2.createConnection()
})()