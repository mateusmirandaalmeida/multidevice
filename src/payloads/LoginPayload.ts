import { encodeProto } from "../proto/EncodeProto";
import { ClientPayloadSpec } from "../proto/ProtoSpec";

export const generatePayloadLogin = () => {
  const payload = {
    passive: true,
    connectType: 1,
    connectReason: 1,
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
    username: 15163363862,
    device: 11,
  };

  return encodeProto(ClientPayloadSpec, payload).readByteArray();
};
