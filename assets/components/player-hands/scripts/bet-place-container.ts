import gc from "@sg/game-client-base";
import Observer from "observer";
import { _decorator, Button, Label, Node, UITransform, Vec3 } from "cc";
import { NewChip } from "db://shared-components/game/sliding-chip/scripts/components/new-chip";
import { FlyChipUtils } from "db://shared-components/game/sliding-chip/scripts/utils";
import { FlyChip3DUtils } from "db://shared-components/game/sliding-chip/scripts/utils/fly-chip-3d-utils";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { HandHandlers, HandsStore } from "db://blackjack-shared-components/states/hands";
import SlidingChip from "db://shared-components/game/sliding-chip/scripts/components/sliding-chip";

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
    @property(Node)
    highlightedBg: Node = null;

    @property(Button)
    btnClear: Button = null;

    @property(Node)
    nodeBetAmount: Node = null;

    @property(Label)
    lblBetAmount: Label = null;

    @property(Node)
    nodeWinningAmount: Node = null;

    @property(Label)
    lblWinningAmount: Label = null;

    protected slidingChip: SlidingChip = null;
    protected oldBetAmount = 0;
    protected timeoutMergeAndStackChips: NodeJS.Timeout = null;
    protected chipContainer: Node = null;
    protected position: number = 0;
    protected nodeTakeChip: Node = null;
    protected chipFlyingDuration = 0.5;
    protected winningAmount = 0;

    init(position: number, slidingChip: SlidingChip, chipContainer: Node, nodeTakeChip: Node) {
        this.position = position;
        this.slidingChip = slidingChip;
        this.chipContainer = chipContainer;
        this.nodeTakeChip = nodeTakeChip;
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

    @render(HandsStore, (store) => store.winningHands)
    settleWinningHands(winningHands: { [pos: number]: number }) {
        this.winningAmount = winningHands[this.position] ?? 0;
    }

    settleChip() {
        if (this.winningAmount) {
            console.log("settleChip", this.winningAmount, this.oldBetAmount);
            this.payChip(this.winningAmount - this.oldBetAmount, this.winningAmount);
            this.lblWinningAmount.string = FormatUtils.numberWithCommas(this.winningAmount);
            this.nodeWinningAmount.active = true;
        } else {
            this.takeChip(this.oldBetAmount);
        }
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

    protected runChipAnimation(chipNode: Node, destPosition: Vec3, totalAmount: number) {
        clearTimeout(this.timeoutMergeAndStackChips);
        FlyChipUtils.moveChipTo(chipNode, destPosition, this.chipFlyingDuration, () => {});
        this.timeoutMergeAndStackChips = setTimeout(() => {
            this.chipContainer?.destroyAllChildren();
            this.chipContainer && FlyChip3DUtils.mergeAndStackChips(this.chipContainer, totalAmount, this.slidingChip);
        }, this.chipFlyingDuration * 1000);
    }

    protected throwChip(betAmount: number, totalAmount: number) {
        const chipNode = this.slidingChip.createChip3D(betAmount);
        if (!chipNode || !this.chipContainer) return;
        this.playSoundSingleChip();
        const containerTransform = this.chipContainer.getComponent(UITransform);
        const { worldPos } = this.slidingChip.createStartNodeInfo(null, betAmount);
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
        this.runChipAnimation(chipNode, destPosition, totalAmount);
    }

    protected payChip(amount: number, totalAmount: number) {
        if (!this.chipContainer) return;
        const chipStack = FlyChip3DUtils.createChipStack(amount, this.slidingChip);
        const initPosition = this.chipContainer.getComponent(UITransform).convertToNodeSpaceAR(this.nodeTakeChip.worldPosition);
        chipStack.position = initPosition;
        this.chipContainer.addChild(chipStack);
        const numberOfChip = this.chipContainer.children.length - 1;
        const destPosition = new Vec3(0, (numberOfChip - 1) * (ChipParams.offset + ChipParams.offsetStack), 0);
        this.runChipAnimation(chipStack, destPosition, totalAmount);
    }

    protected takeChip(amount: number) {
        if (!this.chipContainer) return;
        const chipStack = FlyChip3DUtils.createChipStack(amount, this.slidingChip);
        const initPosition = this.nodeTakeChip.getComponent(UITransform).convertToNodeSpaceAR(this.chipContainer.worldPosition);
        chipStack.position = initPosition;
        this.nodeTakeChip.addChild(chipStack);
        this.chipContainer.destroyAllChildren();
        FlyChipUtils.moveChipTo(chipStack, Vec3.ZERO, this.chipFlyingDuration, () => {
            this.nodeTakeChip.destroyAllChildren();
        });
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    protected playSoundSingleChip() {
        return gc.Audios.AudioIds.SINGLE_CHIP;
    }

    reset() {
        this.oldBetAmount = 0;
        this.nodeBetAmount.active = false;
        clearTimeout(this.timeoutMergeAndStackChips);
        this.chipContainer?.destroyAllChildren();
        this.nodeWinningAmount.active = false;
    }
}
