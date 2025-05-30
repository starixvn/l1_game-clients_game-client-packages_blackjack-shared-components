export type CardType = {
    rank: string;
    suit: number;
};
export class HandType {
    bet: number;
    pos: number; // 1,2,3;
    actions?: string[]; // stand, hit, double, split
    betwin?: number;
    cards?: CardType[];
    id?: number;
    total?: number[];
    isStand?: boolean;
    splitFrom?: number;
    newCard?: CardType;
}

export const BlackjackActions = {
    NEW: "new",
    RUNNING: "running",
    SEND_DEAL: "sendDeal",
    DEAL: "deal",
    SEND_STAND: "sendStand",
    STAND: "stand",
    SEND_HIT: "sendHit",
    HIT: "hit",
    SEND_DOUBLE: "sendDouble",
    DOUBLE: "double",
    SEND_SPLIT: "sendSplit",
    SPLIT: "split",
    FINISH: "finish",
};

export const BlackjackPoint = 21;
export const positionOrder = [1, 4, 2, 5, 3, 6];
