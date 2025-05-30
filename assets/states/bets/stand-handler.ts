import inversify from "inversify";
import { ActionHandlerBase } from "./action-handler-base";
import { BlackjackActions } from "../../constants";

const { injectable } = inversify;

@injectable()
export class StandHandler extends ActionHandlerBase {
    protected action = BlackjackActions.SEND_STAND;

    createBetData() {
        const data = super.createBetData();
        data.stand = { id: this.handsStore.activeHandId };
        return data;
    }
}
