import {
  DEFAULT_ORIGIN,
  WS_URL,
  randomBytes,
  areBuffersEqual,
  intToBytes,
  VERSION_ENCODED,
  HEADER,
  CERT_ISSUER,
} from "./utils/Utils";
import { Socket } from "./socket/Socket";
import { FrameSocket } from "./socket/FrameSocket";
import { NoiseHandshake } from "./socket/NoiseHandshake";
import { encodeProto } from "./proto/EncodeProto";
import { decodeProto } from "./proto/DecodeProto";
import { toLowerCaseHex } from "./utils/HexHelper";
import {
  DetailsSpec,
  HandshakeMessageSpec,
  NoiseCertificateSpec,
} from "./proto/ProtoSpec";

import zlib from "zlib";
import { generatePayloadRegister } from "./payloads/RegisterPayload";
import { Binary } from "./proto/Binary";
import { encodeStanza, generateId, decodeStanza } from "./proto/Stanza";
import {
  generateIdentityKeyPair,
  generateRegistrationId,
  generateSignedPreKey,
  sharedKey,
} from "./utils/Curve";
import { WapNode } from "./proto/WapNode";
import * as QR from "qrcode-terminal";
import { encodeB64 } from "./utils/Base64";
import { S_WHATSAPP_NET } from "./proto/WapJid";
import { generatePayloadLogin } from "./payloads/LoginPayload";

(async () => {
  const socket = new Socket();
  socket.open();

  const ephemeralKeyPair = await generateIdentityKeyPair();

  socket.onOpen = async () => {
    console.log("conn open");
    const frame = new FrameSocket(socket, HEADER);
    const noise = new NoiseHandshake(frame);
    noise.start("Noise_XX_25519_AESGCM_SHA256\0\0\0\0", HEADER);
    noise.authenticate(ephemeralKeyPair.pubKey);

    const data = {
      clientHello: {
        ephemeral: ephemeralKeyPair.pubKey,
      },
    };

    const serverHelloEnc = await noise.sendAndReceive(
      encodeProto(HandshakeMessageSpec, data).readByteArray()
    );

    console.log("received server hello", toLowerCaseHex(serverHelloEnc));

    const { serverHello } = await decodeProto(
      HandshakeMessageSpec,
      serverHelloEnc
    );

    if (!serverHello) {
      console.log("ServerHello payload error");
      return;
    }

    const {
      ephemeral: serverEphemeral,
      static: serverStaticCiphertext,
      payload: certificateCiphertext,
    } = serverHello;

    if (
      serverEphemeral == null ||
      serverStaticCiphertext == null ||
      certificateCiphertext == null
    ) {
      throw new Error("Missing server Ephemeral");
    }

    noise.authenticate(serverEphemeral);
    noise.mixIntoKey(
      sharedKey(new Uint8Array(serverEphemeral), ephemeralKeyPair.privKey)
    );

    const staticDecoded = await noise.decrypt(serverStaticCiphertext);

    noise.mixIntoKey(
      sharedKey(new Uint8Array(staticDecoded), ephemeralKeyPair.privKey)
    );

    const certDecoded = await noise.decrypt(certificateCiphertext);

    const { details: certDetails, signature: certSignature } =
      await decodeProto(NoiseCertificateSpec, certDecoded);
    if (!certDetails || !certSignature) {
      console.log("certProto wrong");
      return;
    }

    const { issuer: certIssuer, key: certKey } = await decodeProto(
      DetailsSpec,
      certDetails
    );
    if (certIssuer != CERT_ISSUER || !certKey) {
      console.log("invalid issuer");
      return;
    }

    // TODO VERIFY EXP CERT

    if (!areBuffersEqual(certKey, staticDecoded)) {
      console.log("cert key does not match issuer");
      return;
    }

    // TODO VERIFY CERT

    const noiseKey = generateIdentityKeyPair();

    const keyEnc = await noise.encrypt(
      new Uint8Array(noiseKey.pubKey)
    );

    noise.mixIntoKey(
      sharedKey(
        new Uint8Array(serverEphemeral),
        new Uint8Array(noiseKey.privKey)
      )
    );

    const signedIdentityKey = generateIdentityKeyPair();
    const signedPreKey = generateSignedPreKey(signedIdentityKey, 1);

    const registrationId = generateRegistrationId();
    const payload = generatePayloadRegister(
      registrationId,
      signedIdentityKey,
      signedPreKey
    );

    //const payload = generatePayloadLogin();

    const payloadEnc = await noise.encrypt(payload);

    noise.send(
      encodeProto(HandshakeMessageSpec, {
        clientFinish: {
          static: keyEnc,
          payload: payloadEnc,
        },
      }).readByteArray()
    );

    const socketConn = await noise.finish();

    const unpackStanza = async (e): Promise<Binary> => {
      let data = new Binary(e);
      if (2 & data.readUint8()) {
        return new Promise((res) => {
          zlib.inflate(data.readByteArray(), (err, result) => {
            if (err) {
              console.error("err to decode stanza");
              return;
            }

            res(new Binary(result));
          });
        });
      }

      return data;
    };

    const advSecretKey = new Uint8Array(randomBytes(32));

    const parsePairDevice = (node: WapNode) => {
      //var e = 6 === _.length ? 6e4 : 2e4
      const refs = node.content[0].content.map((node: WapNode) => {
        return node.contentString();
      });

      console.log("sending ok to server id: ", node.attrs.id);
      // send ok
      const iq = new WapNode("iq", {
        to: S_WHATSAPP_NET,
        type: "result",
        id: node.attrs.id,
      });

      const nodeEnc = encodeStanza(iq);
      socketConn.sendFrame(nodeEnc);

      console.log("refs", refs);

      const ref = refs.shift();

      const noiseKeyB64 = encodeB64(noiseKey.pubKey);
      const identityKeyB64 = encodeB64(signedIdentityKey.pubKey);
      const advB64 = encodeB64(advSecretKey);
      const qrString = [ref, noiseKeyB64, identityKeyB64, advB64].join(',');

      QR.generate(qrString, { small: true });
      console.log(qrString);
    };

    const handleStanza = (stanza: WapNode) => {
      if (!(stanza instanceof WapNode)) {
        return null;
      }

      const tag = stanza.tag;
      console.log("received tag node", tag);
      if (tag == "iq" && stanza.content) {
        switch (stanza.content[0].tag) {
          case "pair-device":
            parsePairDevice(stanza);
            break;

          default:
            console.log("received tag from iq: ", stanza?.content[0]?.tag);
            break;
        }
      }
    };

    const PING_INTERVAL = 1e4 * Math.random() + 2e4;
    console.log("SENDING PING EVERY", PING_INTERVAL);
    setInterval(() => {
      console.log("send ping to server");
      socketConn.sendFrame(
        encodeStanza(
          new WapNode(
            "iq",
            {
              id: generateId(),
              to: S_WHATSAPP_NET,
              type: "get",
              xmlns: "w:p",
            },
            [new WapNode("ping")]
          )
        )
      );
    }, PING_INTERVAL);

    socketConn.setOnFrame(async (e) => {
      const data = await unpackStanza(e);
      const stanza = decodeStanza(data);
      console.log(stanza);

      handleStanza(stanza);
    });

  };
})();
