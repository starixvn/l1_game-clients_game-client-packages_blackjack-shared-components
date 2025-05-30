import { _decorator, Node, Prefab, Vec3 } from "cc";
import { CardType } from "../../../constants";
import { HandPoint } from "./hand-point";
import { HandCards } from "./hand-cards";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
const { ccclass, property } = _decorator;

@ccclass("Hand")
export class Hand extends ObserverComponent {
    @property(HandCards)
    handCards: HandCards = null;

    @property(HandPoint)
    handPoint: HandPoint = null;

    protected openedCards: CardType[] = [];

    init(cardBox: Node, garbage: Node, cardPrefab: Prefab) {
        this.handCards.init(cardBox, garbage, cardPrefab);
    }

    async drawCard(nth: number, initPosition?: Vec3) {
        await this.handCards.drawCard(nth, initPosition);
    }

    async drawCardAndOpen(card: CardType, nth: number, initPosition?: Vec3) {
        await this.handCards.drawCardAndOpen(card, nth, initPosition);
        this.openedCards.push(card);
    }

    openCards() {
        this.openedCards.forEach((card, index) => {
            this.handCards.openCard(card, index);
        });
    }

    calculatePoint(isFinalPoint = false, isSplit = false) {
        this.handPoint.calculatePoint(this.openedCards, isFinalPoint, isSplit);
    }

    async clearCards() {
        await this.handCards.clearCards();
        this.openedCards = [];
    }

    async reset() {
        this.openedCards.length > 0 && (await this.clearCards());
        this.handPoint.reset();
    }
}
