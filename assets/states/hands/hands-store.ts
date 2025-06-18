import inversify from "inversify";
import mobx from "mobx";
import { HandType, BlackjackActions, positionOrder } from "../../constants";

const { injectable } = inversify;
const { makeAutoObservable } = mobx;
@injectable()
export class HandsStore {
    constructor() {
        makeAutoObservable(this);
    }

    previousHandBets: { pos: number; bet: number }[] = [];
    hands: { [key: number]: HandType } = {};
    activeHandId = 0;
    activePosition = 0;
    winningHands: { [pos: number]: number } = {};

    placeChip(position: number, betAmount: number) {
        const hand = this.hands[position] || { pos: position, bet: 0 };
        hand.bet += betAmount;
        this.hands = { ...this.hands, [position]: hand };
    }

    get totalBetAmount() {
        return Object.values(this.hands).reduce((total, hand) => total + hand.bet, 0);
    }

    setHands(hands: HandType[]) {
        this.hands = hands.reduce((acc, hand) => {
            acc[hand.pos] = hand;
            return acc;
        }, {});
        this.setPreviousHandBets();
    }

    setHand(hand: HandType) {
        this.hands = { ...this.hands, [hand.pos]: hand };
    }

    setActiveHand() {
        const activeHand = positionOrder.map((pos) => this.hands[pos]).find((hand) => hand && !hand.isStand);

        this.activeHandId = activeHand?.id ?? 0;
        this.activePosition = activeHand?.pos ?? 0;
    }

    settleHands(winningHands: { id: number; betwin: number }[]) {
        this.winningHands = winningHands.reduce((acc, winningHand) => {
            const hand = Object.values(this.hands).find((h) => h.id === winningHand.id);
            acc[hand.pos] = winningHand.betwin;
            return acc;
        }, {});
    }

    clearChip(position) {
        this.hands = { ...this.hands, [position]: { pos: position, bet: 0 } };
    }

    reset() {
        this.hands = {};
        this.activeHandId = 0;
        this.activePosition = 0;
        this.winningHands = {};
    }

    private setPreviousHandBets() {
        this.previousHandBets = Object.values(this.hands).map((hand) => ({
            pos: hand.pos,
            bet: hand.actions?.includes(BlackjackActions.DOUBLE) ? hand.bet / 2 : hand.bet,
        }));
    }
}
