import { encodeProto } from "../proto/EncodeProto";
import { ClientPayloadSpec, CompanionPropsSpec } from "../proto/ProtoSpec";
import { KeyPair, SignedKeyPair } from "../utils/Curve";
import { intToBytes, VERSION_ENCODED } from "../utils/Utils";

export const generatePayloadRegister = (
  registrationId: number,
  keyPair: KeyPair,
  signedPreKey: SignedKeyPair
) => {
  const appVersionBuf = new Uint8Array(Buffer.from(VERSION_ENCODED, "base64"));

  const companion = {
    os: "Windows",
    version: {
      primary: 10,
      secondary: undefined,
      tertiary: undefined,
    },
    platformType: 1,
    requireFullSync: false,
  };

  const companionProto = encodeProto(
    CompanionPropsSpec,
    companion
  ).readByteArray();

  const registerPayload = {
    connectReason: 1,
    connectType: 1,
    passive: false,
    regData: {
      buildHash: appVersionBuf,
      companionProps: companionProto,
      eRegid: intToBytes(4, registrationId),
      eKeytype: intToBytes(1, 5),
      eIdent: keyPair.pubKey,
      eSkeyId: intToBytes(3, signedPreKey.keyId),
      eSkeyVal: signedPreKey.keyPair.pubKey,
      eSkeySig: signedPreKey.signature,
    },
    userAgent: {
      appVersion: {
        primary: 2,
        secondary: 2126,
        tertiary: 14,
      },
      platform: 14,
      releaseChannel: 0,
      mcc: "000",
      mnc: "000",
      osVersion: "0.1",
      manufacturer: "",
      device: "Desktop",
      osBuildNumber: "0.1",
      localeLanguageIso6391: "en",
      localeCountryIso31661Alpha2: "en",
    },
    webInfo: {
      webSubPlatform: 0,
    },
  };

  /*console.log('registerPayload.regData.buildHash', registerPayload.regData.buildHash);
  console.log('registerPayload.regData.companionProps', registerPayload.regData.companionProps);
  console.log('registerPayload.regData.eRegid', registerPayload.regData.eRegid);
  console.log('registerPayload.regData.eKeytype', registerPayload.regData.eKeytype);
  console.log('registerPayload.regData.eIdent', registerPayload.regData.eIdent);
  console.log('registerPayload.regData.eSkeyId', registerPayload.regData.eSkeyId);
  console.log('registerPayload.regData.eSkeyVal', registerPayload.regData.eSkeyVal);
  console.log('registerPayload.regData.eSkeySig', registerPayload.regData.eSkeySig);*/

  return encodeProto(ClientPayloadSpec, registerPayload).readByteArray();
};
