import { _decorator, Node, Prefab } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { PlayerHand } from "./player-hand";
import { HandHandlers, HandsStore } from "../../../states/hands";
import { NewSlidingChip } from "db://shared-components/game/sliding-chip/scripts/components/new-sliding-chip";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;

@ccclass
export class PlayerHandsContainer extends ObserverComponent {
    @property([PlayerHand])
    hands: PlayerHand[] = [];

    @property([Node])
    chipContainers: Node[] = [];

    private activePosition = 0;

    init(cardBox: Node, garbage: Node, slidingChip: NewSlidingChip, prbCard: Prefab) {
        this.hands.forEach((hand, index) => {
            hand.initPlayerHand(cardBox, garbage, slidingChip, this.chipContainers[index], prbCard);
        });
    }

    @render(HandsStore, (store) => store.activePosition)
    private handleActivePosition(activePosition: number) {
        this.activePosition = activePosition;
    }

    async dealFirstCards() {
        for (const hand of this.hands) {
            await hand.dealFirstCard();
        }
    }

    async dealSecondCards() {
        for (const hand of this.hands) {
            await hand.dealSecondCard();
        }
    }

    openCards() {
        this.hands.forEach((hand, index) => {
            hand.openCards();
            hand.calculatePoint(this.activePosition > index + 1);
        });
        this.setActiveHand();
    }

    async hitCard() {
        const hand = this.getActiveHand();
        await hand.hitCard();
    }

    private getActiveHand() {
        return this.hands.find((hand) => hand.position === this.activePosition);
    }

    async splitCard() {
        const activeHand = this.getActiveHand();
        const splittedHand = this.hands[this.activePosition + 2];
        const oldPosition = activeHand.getLatestCardWorldPosition();
        activeHand.removeCard(1);
        await splittedHand.splitCard(oldPosition);
        await activeHand.dealSecondCard();
        await splittedHand.dealSecondCard();
        this.setActiveHand();
    }

    @handle(HandHandlers, (handler) => handler.setActiveHand())
    async setActiveHand() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    async reset() {
        const promises = this.hands.map((hand) => hand.reset());
        await Promise.all(promises);
    }
}
