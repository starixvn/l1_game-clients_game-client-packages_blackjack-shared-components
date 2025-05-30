import inversify from "inversify";
import mobx from "mobx";
import { CardType } from "../../constants";

const { injectable } = inversify;
const { makeAutoObservable } = mobx;
@injectable()
export class DealerStore {
    constructor() {
        makeAutoObservable(this);
    }

    cards: CardType[] = [];
    point = 0;

    setCards(cards: CardType[]) {
        this.cards = cards;
    }

    reset() {
        this.cards = [];
    }
}
