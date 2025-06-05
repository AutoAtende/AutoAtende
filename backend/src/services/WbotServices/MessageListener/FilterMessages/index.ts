import { WAMessage, WAMessageStubType, proto } from "bail-lite";

export const filterMessages = (msg: WAMessage): boolean => {
  if (
    [
      WAMessageStubType.REVOKE,
      WAMessageStubType.E2E_DEVICE_CHANGED,
      WAMessageStubType.E2E_IDENTITY_CHANGED,
      WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType as proto.WebMessageInfo.StubType)
  )
    return false;

  return true;
};
