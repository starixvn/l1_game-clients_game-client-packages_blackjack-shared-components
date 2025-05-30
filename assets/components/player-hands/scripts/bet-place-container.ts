import gc from "@sg/game-client-base";
import Observer from "observer";
import { _decorator, Button, Component, Label, Node, UITransform, Vec3 } from "cc";
import { ChipFlying } from "db://shared-components/game/chip-flying/scripts/components/chip-flying";
import { NewChip } from "db://shared-components/game/sliding-chip/scripts/components/new-chip";
import { NewSlidingChip } from "db://shared-components/game/sliding-chip/scripts/components/new-sliding-chip";
import { FlyChipUtils } from "db://shared-components/game/sliding-chip/scripts/utils";
import { FlyChip3DUtils } from "db://shared-components/game/sliding-chip/scripts/utils/fly-chip-3d-utils";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { HandHandlers } from "db://blackjack-shared-components/states/hands";

const { ccclass, property } = _decorator;
const { handle, render } = Observer;

const ChipParams = {
    scaleX: 0.7,
    scaleY: 0.7,
    scaleYEnd: 0.6,
    offset: 6,
    rotation: 0,
    offsetStack: 1,
};
const { FormatUtils } = gc;

@ccclass("BlackjackBetPlaceContainer")
export class BetPlaceContainer extends ObserverComponent {
    @property(Button)
    btnBg: Button = null;

    @property(Node)
    highlightedBg: Node = null;

    @property(Button)
    btnClear: Button = null;

    @property(Node)
    nodeBetAmount: Node = null;

    @property(Label)
    lblBetAmount: Label = null;

    protected slidingChip: NewSlidingChip = null;
    protected oldBetAmount = 0;
    protected timeoutMergeAndStackChips: NodeJS.Timeout = null;
    protected chipContainer: Node = null;
    protected position: number = 0;

    init(position: number, slidingChip: NewSlidingChip, chipContainer: Node) {
        this.position = position;
        this.slidingChip = slidingChip;
        this.chipContainer = chipContainer;
    }

    @handle(HandHandlers, (handler, position: number) => handler.placeChip(position))
    onPlaceChip() {
        return this.position;
    }

    @handle(HandHandlers, (handler, position: number) => handler.clearChip(position))
    onClearChip() {
        this.reset();
        return this.position;
    }

    setClearButtonActive(isShow: boolean) {
        this.btnClear.node.active = isShow;
    }

    setBetAmount(amount: number) {
        const betAmount = amount - this.oldBetAmount;
        if (betAmount <= 0) {
            return;
        }
        this.throwChip(betAmount, amount);
        this.oldBetAmount = amount;
        this.nodeBetAmount.active = true;
        this.lblBetAmount && (this.lblBetAmount.string = amount ? FormatUtils.numberWithCommas(amount) : "");
    }

    protected setChipProperties(chipNode: NewChip) {
        const chipFlyConfig = {
            rotationComp1: 0,
            rotationComp2: 0,
            scaleX1: ChipParams.scaleX,
            scaleY1: 0.45,
            scaleX2: ChipParams.scaleX,
            scaleY2: ChipParams.scaleYEnd,
            rotationNode1: 24,
            rotationNode2: -12,
            rotationNode3: 0,
        };
    }

    protected throwChip(betAmount: number, totalAmount: number) {
        const chipFlyingDuration = 0.5;
        const { worldPos } = this.slidingChip.createStartNodeInfo(null, betAmount);
        const chipNode = this.slidingChip.createFlyingChip(betAmount);
        if (!chipNode) return;
        const containerTransform = this.chipContainer.getComponent(UITransform);
        chipNode.position = containerTransform.convertToNodeSpaceAR(worldPos);

        this.chipContainer.addChild(chipNode);
        const chipComponent = chipNode.getComponent(NewChip);
        this.setChipProperties(chipComponent);
        const numberOfChip = this.chipContainer.children.length;
        const destPosition = new Vec3(0, 0, 0);
        if (numberOfChip === 1) {
            chipComponent.firstChipShadow.active = true;
        }
        if (numberOfChip > 1) {
            const destY = (numberOfChip - 1) * (ChipParams.offset + ChipParams.offsetStack);
            destPosition.set(destPosition.x, destPosition.y + destY, destPosition.z);
        }
        clearTimeout(this.timeoutMergeAndStackChips);
        FlyChipUtils.moveChipTo(chipNode, destPosition, chipFlyingDuration, () => {});
        this.timeoutMergeAndStackChips = setTimeout(() => {
            this.chipContainer.destroyAllChildren();
            FlyChip3DUtils.mergeAndStackChips(this.chipContainer, totalAmount, this.slidingChip);
        }, chipFlyingDuration * 1000);
    }

    reset() {
        this.oldBetAmount = 0;
        this.nodeBetAmount.active = false;
        clearTimeout(this.timeoutMergeAndStackChips);
        this.chipContainer.destroyAllChildren();
    }
}
