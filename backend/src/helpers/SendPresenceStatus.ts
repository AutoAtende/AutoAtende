import {delay} from "bail-lite";
import {Session} from "../libs/wbot";

function randomValue(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}


export const SendTypingStatus = async (wbot: Session, jid: string, msdelay: number = 0) => {

    await wbot.sendPresenceUpdate('available');

    await wbot.presenceSubscribe(jid);

    await delay(randomValue(0, 50));

    await wbot.sendPresenceUpdate('composing', jid)

}

export const SendPausedStatus = async (wbot: Session, jid: string, msdelay: number = 0) => {

      await wbot.sendPresenceUpdate('available');

      await wbot.presenceSubscribe(jid);

      await delay(randomValue(0, 50));

      await wbot.sendPresenceUpdate('paused', jid)


}
export const SendPresenceStatus = async (wbot: Session, jid: string, msdelay: number = 0, maxDelay = 2000) => {

  try {
    await wbot.sendPresenceUpdate('available');

    await wbot.presenceSubscribe(jid);

    await delay(randomValue(0, 50));

    await wbot.sendPresenceUpdate('composing', jid)

    if (msdelay <= 0)
      await delay(randomValue(1000, maxDelay));
    else
      await delay(msdelay);

    await wbot.sendPresenceUpdate('paused', jid)
  } catch (e) {
    console.trace(e)
  }
}
