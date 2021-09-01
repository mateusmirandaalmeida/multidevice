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
        const conversation = message.deviceSentMessage ? message.deviceSentMessage.message.conversation : message.conversation;

        if (!conversation) {
            return;
        }

        if (conversation == '!ping') {
            await session.sendMessage(message.chat, {
                conversation: 'pong',
            });

            return;
        }
        
        if (conversation.startsWith('!creategroup')) {
            if (message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command in group not allowned',
                });

                return;
            }

            const params = conversation.split(' ');

            const name = params[1] ?? null;
            if (!name) {
                await session.sendMessage(message.chat, {
                    conversation: 'Invalid group name',
                });

                return;
            }

            await session.sendMessage(message.chat, {
                conversation: `Creating group *${name}* with: ${message.chat.toString()}`,
            });

            const result = await session.createGroup(name, [message.chat.toString()]);

            console.log('created group', result.content);

            const id = result.content[0].attrs.id;
            await session.sendMessage(message.chat, {
                conversation: `Group created with id: *${id}*`,
            });

            return;
        }

        if (conversation == '!buttons') {
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
