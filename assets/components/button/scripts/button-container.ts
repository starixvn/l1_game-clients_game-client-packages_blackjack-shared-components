import { _decorator, Button, Component } from "cc";
const { ccclass, property } = _decorator;

export enum ButtonStatus {
    NEW,
    RUNNING,
    WAITING,
    FINISHED,
}

@ccclass
export class ButtonContainer extends Component {
    @property(Button)
    dealButton: Button = null;

    @property(Button)
    clearButton: Button = null;

    @property(Button)
    standButton: Button = null;

    @property(Button)
    hitButton: Button = null;

    @property(Button)
    doubleButton: Button = null;

    @property(Button)
    splitButton: Button = null;

    @property(Button)
    rebetButton: Button = null;

    @property(Button)
    newBetButton: Button = null;

    protected buttons: Button[] = [];

    protected onLoad(): void {
        this.buttons = [
            this.dealButton,
            this.clearButton,
            this.standButton,
            this.hitButton,
            this.doubleButton,
            this.splitButton,
            this.rebetButton,
            this.newBetButton,
        ];
    }

    setButtonsStatus(status: ButtonStatus) {
        if (status === ButtonStatus.WAITING) {
            this.setAllButtonsInteractable(false);
            return;
        }
        const { activeButtons, inactiveButtons } = this.getButtonsByStatus(status);
        this.updateButtonsVisibility(activeButtons, true);
        this.updateButtonsVisibility(inactiveButtons, false);
        this.setAllButtonsInteractable(true);
    }

    protected getButtonsByStatus(status: ButtonStatus): {
        activeButtons: Button[];
        inactiveButtons: Button[];
    } {
        const newButtons = [this.dealButton, this.clearButton];
        const runningButtons = [this.standButton, this.hitButton, this.doubleButton, this.splitButton];
        const finishedButtons = [this.rebetButton, this.newBetButton];
        const buttonMap = {
            [ButtonStatus.NEW]: {
                activeButtons: newButtons,
                inactiveButtons: [...runningButtons, ...finishedButtons],
            },
            [ButtonStatus.RUNNING]: {
                activeButtons: runningButtons,
                inactiveButtons: [...newButtons, ...finishedButtons],
            },
            [ButtonStatus.FINISHED]: {
                activeButtons: finishedButtons,
                inactiveButtons: [...newButtons, ...runningButtons],
            },
        };

        return buttonMap[status] ?? { activeButtons: [], inactiveButtons: [] };
    }

    protected updateButtonsVisibility(buttons: Button[], isVisible: boolean): void {
        buttons.forEach((button) => {
            button && (button.node.active = isVisible);
        });
    }

    hideAllButtons() {
        this.buttons.forEach((button) => {
            button && (button.node.active = false);
        });
    }

    setAllButtonsInteractable(isInteractable: boolean) {
        this.buttons.forEach((button) => {
            button?.node.active === true && (button.interactable = isInteractable);
        });
    }
}
