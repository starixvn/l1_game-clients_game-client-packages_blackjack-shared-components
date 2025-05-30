import { CardType, BlackjackActions, HandType } from "../constants";

export namespace BlackjackServiceMessages {
    export class Deal {
        roundId: number;
        totalAmount: number;
        hands: HandType[];
        dealer: CardType[];
        static readonly eventName = "deal";
    }

    export class Split {
        hands: HandType[];
        static readonly eventName = BlackjackActions.SPLIT;
    }

    export class Double extends HandType {
        newCard: CardType;
        static readonly eventName = BlackjackActions.DOUBLE;
    }

    export class Hit extends HandType {
        newCard: CardType;
        static readonly eventName = BlackjackActions.HIT;
    }

    export class Stand extends HandType {
        static readonly eventName = BlackjackActions.STAND;
    }

    export class OwnBets {
        roundId: number;
        dealer: CardType[];
        hands: HandType[];
        static readonly eventName = "ownBets";
    }

    export class Finish {
        result: CardType[];
        settlementResult: number;
        winningHands: { id: number; betwin: number }[];
        static readonly eventName = "finish";
    }
}
