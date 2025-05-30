import { _decorator, Node, Prefab } from "cc";
import Observer from "observer";
import { DealerStore } from "../../../states/dealer";
import { CardType } from "../../../constants";
import { Hand } from "../../hand/scripts/hand";
import { FairnessCard3D } from "db://shared-components/game/poker-cards/scripts/fairness-card-3D";

const { ccclass } = _decorator;
const { render } = Observer;

@ccclass("Dealer")
export class DealerComponent extends Hand {
    protected cards: CardType[] = [];
    protected dealtCards: CardType[] = [];
    protected point = 0;

    init(cardBox: Node, garbage: Node, cardPrefab: Prefab) {
        super.init(cardBox, garbage, cardPrefab);
        this.handCards.setDealCardDuration(0.4);
    }

    @render(DealerStore, (store) => store.cards)
    private handleCardsData(cards: CardType[]) {
        this.cards = cards;
    }

    @render(DealerStore, (store) => store.point)
    private handlePointData(point: number) {
        this.point = point;
    }

    async dealFirstCard() {
        await this.dealCard(0);
    }

    async dealSecondCard() {
        await this.dealCard(1);
    }

    protected async dealCard(nth: number) {
        const card = this.cards[nth];
        if (card) {
            await this.drawCardAndOpen(card, nth);
            this.calculatePoint();
        } else {
            await this.drawCard(nth);
        }
        this.dealtCards.push(card);
    }

    async revealDealerCards() {
        for (let i = this.openedCards.length; i < this.cards.length; i++) {
            await this.revealOrDrawCard(i);
        }
        this.calculatePoint(true);
    }

    protected async revealOrDrawCard(nth: number) {
        if (nth > this.dealtCards.length - 1) {
            await this.drawCardAndOpen(this.cards[nth], nth);
            this.calculatePoint();
        } else {
            this.handCards.cardContainer.children[nth]?.getComponent(FairnessCard3D)?.card?.setCard(this.cards[nth]);
            this.handCards.cardContainer.children[nth]?.getComponent(FairnessCard3D)?.card?.openCard(true, 0.2);
            this.openedCards.push(this.cards[nth]);
            this.calculatePoint();
        }
    }

    openCards() {
        this.handCards.openCard(this.cards[0], 0);
        this.handCards.instantiateCard(this.handCards.getDestPosition(1));
    }

    async reset() {
        await super.reset();
        this.dealtCards = [];
        this.point = 0;
    }
}
