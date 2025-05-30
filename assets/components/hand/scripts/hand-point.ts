import { _decorator, Color, Component, Label, Node, Sprite, tween, v3 } from "cc";
import { BlackjackPoint, CardType } from "../../../constants";
import { BlackjackUtils } from "../../blackjack-utils";
const { ccclass, property } = _decorator;

@ccclass("HandPoint")
export class HandPoint extends Component {
    @property(Node)
    nodePoint: Node = null;

    @property(Node)
    activeIcon: Node = null;

    @property(Label)
    lblPoint: Label = null;

    @property(Node)
    nodeBlackJack: Node = null;

    @property(Node)
    nodeBurst: Node = null;

    protected isActive: boolean = false;

    setActive(isActive: boolean) {
        let backgroundColor = Color.BLACK;
        let textColor = new Color(192, 192, 192);
        if (isActive) {
            backgroundColor = new Color(168, 255, 126);
            textColor = new Color(26, 255, 20);
        }
        this.nodePoint.getComponent(Sprite).color = backgroundColor;
        this.lblPoint.color = textColor;
        this.activeIcon.active = isActive;

        if (this.isActive !== isActive) {
            this.isActive = isActive;
            const moveDistance = isActive ? 50 : -50;
            tween(this.nodePoint)
                .to(0.3, { position: v3(this.nodePoint.x, this.nodePoint.y + moveDistance) })
                .start();
        }
    }

    protected isBlackJack(cards: CardType[]) {
        return cards?.length == 2 && BlackjackUtils.getTotalPoints(cards).includes(BlackjackPoint);
    }

    calculatePoint(cards: CardType[], isFinalPoint: boolean, isSplit: boolean) {
        if (this.isBlackJack(cards) && !isSplit) {
            this.nodeBlackJack.active = true;
            this.nodePoint.active = false;
            this.nodeBurst.active = false;
        } else {
            const point = BlackjackUtils.getTotalPoints(cards);
            const isBurst = point.some((p) => p > BlackjackPoint);
            this.nodeBlackJack.active = false;
            this.nodePoint.active = !isBurst;
            this.lblPoint.string = isFinalPoint ? Math.max(...point).toString() : point.join(" / ");
            this.nodeBurst.active = isBurst;
        }
    }

    reset() {
        this.setActive(false);
        this.nodePoint.active = false;
        this.activeIcon.active = false;
        this.nodeBlackJack.active = false;
        this.nodeBurst.active = false;
    }
}
