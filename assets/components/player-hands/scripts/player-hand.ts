import Observer from "observer";
import { CardType, HandType, BlackjackActions } from "../../../constants";
import { _decorator, CCInteger, Label, Node, Prefab, tween, UITransform, Vec3 } from "cc";
import { HandsStore } from "../../../states/hands";
import { BetPlaceContainer } from "./bet-place-container";
import SlidingChip from "db://shared-components/game/sliding-chip/scripts/components/sliding-chip";
import { Hand } from "../../hand/scripts/hand";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass
export class PlayerHand extends Hand {
    @property(CCInteger)
    position: number = 1;

    @property(BetPlaceContainer)
    betPlaceContainer: BetPlaceContainer = null;

    @property(Label)
    handId: Label = null;

    protected handData: HandType = null;
    protected isActive = false;

    get isSplit() {
        return !!this.handData?.splitFrom || this.handData?.actions?.includes(BlackjackActions.SPLIT);
    }

    get isFinished() {
        return this.handData?.actions?.includes(BlackjackActions.STAND);
    }

    initPlayerHand(cardBox: Node, garbage: Node, prbCard: Prefab, slidingChip: SlidingChip, chipContainer: Node, nodeTakeChip: Node) {
        this.init(cardBox, garbage, prbCard);
        this.betPlaceContainer?.init(this.position, slidingChip, chipContainer, nodeTakeChip);
    }

    @render(HandsStore, (store) => store.hands)
    protected handleHandsData(hands: { [position: number]: HandType }) {
        if (hands[this.position]) {
            this.handData = hands[this.position];
            const { bet, cards, id } = this.handData;
            this.betPlaceContainer?.setBetAmount(bet);
            this.betPlaceContainer?.setClearButtonActive(bet && (!cards || cards.length === 0));
            this.handId && id && (this.handId.string = id.toString());
        }
    }

    @render(HandsStore, (store) => store.activePosition)
    protected setActiveHand(activePosition: number) {
        const isActive = activePosition === this.position;
        if (this.isActive !== isActive && this.isActive === true) {
            this.calculatePoint(true);
        }
        this.isActive = isActive;
        this.handPoint.setActive(isActive);
    }

    openCards() {
        if (!this.handData) return;
        this.openedCards = [...this.handData.cards];
        super.openCards();
    }

    async dealFirstCard() {
        const card = this.handData?.cards?.[0];
        await this.drawCardAndOpen(card, 0);
    }

    async dealSecondCard() {
        const card = this.handData?.cards?.[1];
        await this.drawCardAndOpen(card, 1);
    }

    async hitCard() {
        const nth = this.handData?.cards?.length - 1;
        const card = this.handData?.cards?.[nth];
        await this.drawCardAndOpen(card, nth);
    }

    removeCard(nth: number) {
        this.handCards.removeCard(nth);
        this.openedCards.splice(nth, 1);
    }

    async splitCard(oldWorldPosition: Vec3) {
        const cardValue = this.handData?.cards?.[0];
        const initPosition = this.handCards.cardContainer.getComponent(UITransform).convertToNodeSpaceAR(oldWorldPosition);
        const { cardPfb, cardComponent } = this.handCards.instantiateCard(initPosition, cardValue);
        cardComponent.card.setCard(cardValue);
        cardComponent.card.openCard(false);
        const destination = this.handCards.getDestPosition(0);
        this.openedCards.push(cardValue);
        tween(cardPfb).to(0.3, { position: destination }, { easing: "smooth" }).start();
    }

    getLatestCardWorldPosition() {
        const nodeCard = this.handCards.cardContainer.children[this.handCards.cardContainer.children.length - 1];
        return nodeCard.worldPosition;
    }

    calculatePoint(isFinalPoint?: boolean, isSplit?: boolean): void {
        super.calculatePoint(isFinalPoint, this.isSplit);
    }

    override async drawCardAndOpen(card: CardType, nth: number, initPosition?: Vec3): Promise<void> {
        if (!card) return;
        await super.drawCardAndOpen(card, nth, initPosition);
        this.calculatePoint(this.isFinished);
    }

    async reset() {
        await super.reset();
        this.handData = null;
        this.handId && (this.handId.string = "");
        this.betPlaceContainer?.reset();
    }
}
