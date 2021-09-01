import { WaClient } from './client';

(async () => {
    /** first client */
    const session = new WaClient({
        sessionName: 'bot-03',
        onSocketClose: (e) => {
            console.error(e);
        },
    });

    console.log('open connection');
    await session.createConnection();

    session.on('open', (me) => {
        console.log('open connection', me);
    });

    session.on('message', async (message: any) => {
        console.log('message received', message);
        const msg = message.deviceSentMessage ? message.deviceSentMessage.message.conversation : message.conversation;

        if (msg == '!ping') {
            await session.sendMessage(message.chat, {
                conversation: 'pong',
            });

            return;
        }

        if (msg == '!buttons') {
            await session.sendMessage(message.chat, {
                buttonsMessage: {
                    headerType: 1,
                    contentText: 'Hello',
                    footerText: 'Hi',
                    buttons: [
                        {
                            buttonId: '1',
                            buttonText: {
                                displayText: 'Yes',
                            },
                            type: 1,
                        },
                        {
                            buttonId: '2',
                            buttonText: {
                                displayText: 'No',
                            },
                            type: 1,
                        },
                    ],
                },
            });
        }
    });

    /** second client */
    // const session2 = new WaClient({
    //     sessionName: 'bot-04',
    //     onSocketClose: (e) => {
    //         console.error(e)
    //     }
    // })
    // await session2.createConnection()
})();
