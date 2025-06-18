import { _decorator, CCInteger, Component, instantiate, Node, Prefab, tween, UITransform, Vec3 } from "cc";
import { CardType } from "../../../constants";
import { FairnessCard3D } from "db://shared-components/game/poker-cards/scripts/fairness-card-3D";
const { ccclass, property } = _decorator;

@ccclass("HandCards")
export class HandCards extends Component {
    @property(Node)
    cardContainer: Node = null;

    @property(Node)
    cardShadow: Node = null;

    @property(CCInteger)
    cardDistance: number = 30;

    protected cardBox: Node = null;
    protected garbage: Node = null;
    protected cardPrefab: Prefab = null;
    protected openCardDuration = 0.5;

    init(cardBox: Node, garbage: Node, cardPrefab: Prefab) {
        this.cardBox = cardBox;
        this.garbage = garbage;
        this.cardPrefab = cardPrefab;
    }

    setDealCardDuration(duration: number) {
        this.openCardDuration = duration;
    }

    instantiateCard(initPosition?: Vec3, cardValue?: CardType) {
        const cardPfb = instantiate(this.cardPrefab);
        cardPfb.layer = this.cardContainer.layer;
        const position = initPosition ?? this.cardContainer.getComponent(UITransform).convertToNodeSpaceAR(this.cardBox.worldPosition);
        cardPfb.position = position;
        const cardComponent = cardPfb.getComponent(FairnessCard3D);
        const card = cardComponent.card;
        card.faceDown();
        cardValue && card.setCard(cardValue);
        this.cardContainer.addChild(cardPfb);
        return { cardPfb, cardComponent };
    }

    getDestPosition(nth: number) {
        return new Vec3(this.cardContainer.x + this.cardDistance * nth, this.cardContainer.y, this.cardContainer.z);
    }

    async drawCard(nth: number, initPosition?: Vec3) {
        const { cardPfb } = this.instantiateCard(initPosition);
        tween(cardPfb)
            .to(this.openCardDuration, { position: this.getDestPosition(nth) }, { easing: "smooth" })
            .start();
    }

    async drawCardAndOpen(card: CardType, nth: number, initPosition?: Vec3) {
        const { cardPfb, cardComponent } = this.instantiateCard(initPosition, card);
        tween(cardPfb)
            .parallel(
                tween(cardPfb).to(this.openCardDuration, { position: this.getDestPosition(nth) }, { easing: "smooth" }),
                tween(cardPfb).call(() => cardComponent.openCard(true, this.openCardDuration))
            )
            .start();
    }

    openCard(card: CardType, nth: number) {
        const initPosition = new Vec3(this.cardContainer.x + this.cardDistance * nth, this.cardContainer.y, this.cardContainer.z);
        const { cardComponent } = this.instantiateCard(initPosition, card);
        cardComponent.card.openCard(false);
    }

    removeCard(nth: number) {
        this.cardContainer.children[nth]?.destroy();
    }

    async clearCards() {
        const cards = this.cardContainer.children;
        const destination = this.cardContainer.getComponent(UITransform).convertToNodeSpaceAR(this.garbage.worldPosition);
        return new Promise<void>((resolve) => {
            cards.forEach((card) => {
                const cardComponent = card.getComponent(FairnessCard3D);
                tween(card)
                    .parallel(
                        tween(card).to(this.openCardDuration, { position: destination }, { easing: "smooth" }),
                        tween(card).call(() => cardComponent.closeCard(this.openCardDuration))
                    )
                    .call(() => {
                        this.cardContainer.removeAllChildren();
                        resolve();
                    })
                    .start();
            });
        });
    }
}
