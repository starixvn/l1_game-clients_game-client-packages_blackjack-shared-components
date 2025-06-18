import gc from "@sg/game-client-base";
import { _decorator, Game, game, Label, Node, Prefab, Vec3 } from "cc";
import { AudioContainer } from "db://shared-components/game/audios/scripts/component/audio-container";
import { GameComponentBase } from "db://shared-components/game/scripts/components/game-component-base";
import Observer from "observer";

import { StaticNode } from "db://shared-components/shared/common-components/static-node/scripts/static-node";
import { StaticGroupId } from "db://shared-components/shared/common-components/static-node/scripts/static-node-info";
import { ComponentUtils } from "db://shared-components/shared/utils";
import { PlayerHandsContainer } from "./player-hands/scripts/player-hands-container";
import { DealerComponent } from "./dealer/scripts/dealer";
import { BlackjackActions } from "../constants";
import { RoundStore } from "../states/rounds";
import {
    ClearHandler,
    DealHandler,
    DoubleHandler,
    HitHandler,
    NewBetHandler,
    RebetHandler,
    SplitHandler,
    StandHandler,
} from "../states/bets";
import SlidingChip from "db://shared-components/game/sliding-chip/scripts/components/sliding-chip";
import { ButtonContainer } from "./button/scripts/button-container";

const { Connection, FormatUtils } = gc;

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export default class GameBlackjackComponent extends GameComponentBase {
    @property(Label)
    lblMinBet: Label = null;

    @property(Label)
    lblMaxBet: Label = null;

    @property(Label)
    lblTotalBetAmount: Label = null;

    @property(SlidingChip)
    slidingChip: SlidingChip = null;

    @property(Node)
    nodeAudioContainer: Node = null;

    @property(PlayerHandsContainer)
    playerHandsContainer: PlayerHandsContainer = null;

    @property(DealerComponent)
    dealer: DealerComponent = null;

    @property(Node)
    cardBox: Node = null;

    @property(Node)
    garbage: Node = null;

    @property(Prefab)
    prbCard: Prefab = null;

    @property(ButtonContainer)
    buttonContainer: ButtonContainer = null;

    override namespace = "";
    protected enableFixHandleFinish = true;
    protected enableEventShowHideGame = true;

    private audioContainer: AudioContainer = null;

    private isFinish = false;

    onLoad() {
        this.registerEventShowHideGame();
        this.initUserSettings();
        this.initPlayerSelections();
        this.handleStaticNodeAndSetEmptyLabels();
        this.audioContainer = this.nodeAudioContainer.getComponent(AudioContainer);
        this.dealer?.init(this.cardBox, this.garbage, this.prbCard);
        this.playerHandsContainer?.init(this.cardBox, this.garbage, this.slidingChip, this.prbCard);
    }

    protected registerEventShowHideGame() {
        if (!this.enableEventShowHideGame) {
            return;
        }
        game.on(Game.EVENT_HIDE, this.onHideGame, this);
        game.on(Game.EVENT_SHOW, this.onShowGame, this);
    }

    protected handleStaticNodeAndSetEmptyLabels() {
        const lblList: Label[] = [this?.lblMinBet, this?.lblMaxBet];
        if (lblList.length > 0) {
            lblList?.forEach((label) => {
                if (label) {
                    const component = label?.addComponent(StaticNode);
                    component && (component.groupId = StaticGroupId.TextContainer);
                }
            });
            ComponentUtils.setEmptyLabels(lblList);
        }
    }

    @handle(gc.UserSettings.UserSettingHandlers, (handle) => handle.loadStorages())
    protected initUserSettings() {}

    @handle(gc.PlayerSelections.PlayerSelectionHandlers.InitHandlers)
    protected initPlayerSelections() {}

    protected onDestroy(): void {
        this.clearEventShowHideGame();
    }

    protected clearEventShowHideGame() {
        game.off(Game.EVENT_HIDE, this.onHideGame, this);
        game.off(Game.EVENT_SHOW, this.onShowGame, this);
    }

    protected onShowGame() {
        window.location.reload();
    }

    protected onHideGame() {}

    @handle(gc.Connection.ConnectionHandlers.ConnectHandler)
    connectToService() {}

    @render(gc.GameConfigs.GameSetting, (gameSetting) => gameSetting.name)
    logLoadScene(gameName: string) {
        console.log(`LoadScene ${gameName}`);
    }

    @render(Connection.ConnectionStore, (store) => store.signedIn)
    protected onSignedIn(signedIn: boolean) {
        signedIn && this.inGame();
    }

    @handle(Connection.ConnectionHandlers.InGameHandler)
    protected inGame() {}

    @render(RoundStore, (store) => ({ minBet: store.minBet, maxBet: store.maxBet }))
    protected renderMinMaxBet({ minBet, maxBet }: { minBet: number; maxBet: number }) {
        this.lblMinBet && (this.lblMinBet.string = FormatUtils.numberWithCommas(minBet));
        this.lblMaxBet && (this.lblMaxBet.string = FormatUtils.numberWithCommas(maxBet));
    }

    @render(RoundStore, (store) => store.totalBetAmount)
    protected renderTotalBetAmount(totalBetAmount: number) {
        totalBetAmount > 0 && this.lblTotalBetAmount && (this.lblTotalBetAmount.string = FormatUtils.numberWithCommas(totalBetAmount));
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    protected playSound(id: string) {
        return id;
    }

    @handle(DealHandler)
    onBtnDealClick() {}

    async onBtnClearClick() {
        this.clearHandStore();
        await this.playerHandsContainer.reset();
    }

    @handle(ClearHandler)
    clearHandStore() {
        return this.playerHandsContainer.hands.length / 2;
    }

    @handle(DoubleHandler)
    onBtnDoubleClick() {}

    @handle(SplitHandler)
    onBtnSplitClick() {}

    @handle(HitHandler)
    onBtnHitClick() {}

    @handle(StandHandler)
    onBtnStandClick() {}

    @handle(RebetHandler)
    async onBtnRebetClick() {
        await this.onBtnNewBetClick();
        return this.playerHandsContainer.hands.length / 2;
    }

    @handle(NewBetHandler)
    async onBtnNewBetClick() {
        await Promise.all([this.playerHandsContainer?.reset(), this.dealer?.reset()]);
    }

    @render(RoundStore, (store) => store.action, { fireImmediately: false })
    protected async handleActions(action: string) {
        switch (action) {
            case BlackjackActions.FINISH:
                this.handleFinish();
                break;
            case BlackjackActions.RUNNING:
                await this.handleJoinGame();
                break;
            case BlackjackActions.DEAL:
                await this.handleDealCards();
                break;
            case BlackjackActions.HIT:
                await this.handleHitCard();
                break;
            case BlackjackActions.STAND:
                await this.handleStand();
                break;
            case BlackjackActions.DOUBLE:
                await this.handleHitCard();
                break;
            case BlackjackActions.SPLIT:
                await this.handleSplit();
                break;
        }

        // TODO: update visibility of buttons
    }

    private async finishGame() {
        // TODO: show result
        await this.dealer?.revealDealerCards();
        this.playerHandsContainer.settle();
        // TODO: settle
    }

    protected async handleJoinGame() {
        this.playerHandsContainer?.openCards();
        await this.dealer?.openCards();
    }

    protected async handleDealCards() {
        this.isFinish = false;
        await this.playerHandsContainer?.dealFirstCards();
        await this.dealer?.dealFirstCard();
        await this.playerHandsContainer?.dealSecondCards();
        await this.dealer?.dealSecondCard();
        await this.playerHandsContainer?.setActiveHand();
        this.isFinish && this.finishGame();
    }

    protected async handleHitCard() {
        this.isFinish = false;
        await this.playerHandsContainer?.hitCard();
        await this.playerHandsContainer?.setActiveHand();
        this.isFinish && this.finishGame();
    }

    protected async handleStand() {
        this.isFinish = false;
        await this.playerHandsContainer?.setActiveHand();
        this.isFinish && this.finishGame();
    }

    // protected async handleDouble() {
    //     this.isFinish = false;
    //     await this.handsContainer?.hitCard(this.cardBoxPosition);
    //     this.handsContainer?.setActiveHand();
    //     this.isFinish && this.showResult();
    // }

    protected async handleSplit() {
        await this.playerHandsContainer?.splitCard();
        this.isFinish && this.finishGame();
    }

    protected async handleFinish() {
        this.isFinish = true;
    }
}
