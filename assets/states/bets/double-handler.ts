import inversify from "inversify";
import { ActionHandlerBase } from "./action-handler-base";
import { BlackjackActions } from "../../constants";

const { injectable } = inversify;

@injectable()
export class DoubleHandler extends ActionHandlerBase {
    protected action = BlackjackActions.SEND_DOUBLE;

    createBetData() {
        const data = super.createBetData();
        data.double = { id: this.handsStore.activeHandId };
        return data;
    }
}
