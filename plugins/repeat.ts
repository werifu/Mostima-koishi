import {Context} from 'koishi-core';
import { Groups } from '../private_config'

let lastMsgMap = new Map(Groups.map(group => [group.toString(), '']));
let send_flag = false;
export const name: string = 'repeat';

export function apply(ctx: Context) {
    ctx.group().middleware(async (session, next) => {
        // console.log(session.content);
        if (!session.content || !session.channelId) return next();
        const groupId = session.channelId;
        // 有人发了与上一条相同的句子而且bot没复读过
        if (session.content === lastMsgMap.get(groupId) && send_flag === false) {
            send_flag = true;
            return session.send(session.content);
        }
        // 与上一条不一样
        if (session.content && session.content !== lastMsgMap.get(groupId)) {
            send_flag = false;
            lastMsgMap.set(groupId, session.content);
        }
        return next();
    })
}