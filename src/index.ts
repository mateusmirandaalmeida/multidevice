import { WaClient } from './client';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import mimeTypes from 'mime-types';
import { MessageType } from './utils/Utils';

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

        const messageType = session.getMessageType(message);

        let mediaBuffer = null;
        if (session.isMedia(message)) {
            mediaBuffer = await session.downloadMedia(message) as Buffer;
            if (!existsSync('./files')) {
                mkdirSync('./files');
            }

            writeFileSync(`./files/${message.externalId}.${mimeTypes.extension(message[messageType].mimetype) ?? ''}`, mediaBuffer, {
                flag: 'w',
            });
        }

        const conversation = message.conversation ?? message.deviceSentMessage?.message?.conversation ?? message[messageType]?.caption ?? null;

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
            params.shift();

            const name = params.length > 0 ? params.join(' ') : null;
            if (!name) {
                await session.sendMessage(message.chat, {
                    conversation: 'Invalid group name',
                });

                return;
            }

            const user = message.chat.getUser();

            await session.sendMessage(message.chat, {
                conversation: `Creating group *${name}* with: ${user}`,
            });

            const result = await session.createGroup(name, [user]);

            console.log('created group', result.content);

            const id = result.content[0].attrs.id;
            await session.sendMessage(message.chat, {
                conversation: `Group created with id: *${id}*`,
            });

            await session.addOrRemoveGroupAdmin(id, 'PROMOTE', [user]);

            return;
        }

        if (conversation.startsWith('!changename')) {
            if (!message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command allowned only in group',
                });

                return;
            }

            const id = message.chat.getUser();

            const params = conversation.split(' ');
            params.shift();

            const name = params.length > 0 ? params.join(' ') : null;
            if (!name) {
                await session.sendMessage(message.chat, {
                    conversation: 'Invalid group name',
                });

                return;
            }

            await session.setGroupName(id, name);

            await session.sendMessage(message.chat, {
                conversation: `Group name has changed to *${name}*`,
            });
        }

        if (conversation.startsWith('!changedesc')) {
            if (!message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command allowned only in group',
                });

                return;
            }

            const id = message.chat.getUser();

            const params = conversation.split(' ');
            params.shift();

            const desc = params.length > 0 ? params.join(' ') : '';

            await session.setGroupDescription(id, desc);

            await session.sendMessage(message.chat, {
                conversation: `Group description has changed to: ${desc}`,
            });
        }

        if (conversation.startsWith('!add')) {
            if (!message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command allowned only in group',
                });

                return;
            }

            const id = message.chat.getUser();

            const params = conversation.split(' ');
            params.shift();

            await session.addOrRemoveGroupParticipants(id, 'ADD', params);

            await session.sendMessage(message.chat, {
                conversation: `Group participants added *${params.join(',')}*`,
            });
        }
        
        if (conversation.startsWith('!remove')) {
            if (!message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command allowned only in group',
                });

                return;
            }

            const id = message.chat.getUser();

            const params = conversation.split(' ');
            params.shift();

            await session.addOrRemoveGroupParticipants(id, 'REMOVE', params);

            await session.sendMessage(message.chat, {
                conversation: `Group participants removed *${params.join(',')}*`,
            });
        }

        if (conversation.startsWith('!promote')) {
            if (!message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command allowned only in group',
                });

                return;
            }

            const id = message.chat.getUser();

            const params = conversation.split(' ');
            params.shift();

            await session.addOrRemoveGroupAdmin(id, 'PROMOTE', params);

            await session.sendMessage(message.chat, {
                conversation: `Group participants promoted to admin *${params.join(',')}*`,
            });
        }
        
        if (conversation.startsWith('!demote')) {
            if (!message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command allowned only in group',
                });

                return;
            }

            const id = message.chat.getUser();

            const params = conversation.split(' ');
            params.shift();

            await session.addOrRemoveGroupAdmin(id, 'DEMOTE', params);

            await session.sendMessage(message.chat, {
                conversation: `Group participants promoted to user *${params.join(',')}*`,
            });
        }

        if (conversation.startsWith('!changepic')) {
            if (!message.chat.isGroup()) {
                await session.sendMessage(message.chat, {
                    conversation: 'Command allowned only in group',
                });

                return;
            }

            const id = message.chat.getUser();

            if (messageType != MessageType.image) {
                await session.sendMessage(message.chat, {
                    conversation: `Needs to send a image`,
                });

                return;
            }

            await session.setGroupImage(id, mediaBuffer);

            await session.sendMessage(message.chat, {
                conversation: `Group image has changed`,
            });
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
