import { CardType, BlackjackPoint } from "../constants";

export class BlackjackUtils {
    public static getCardPoints(rank: string) {
        switch (rank) {
            case "A":
                return [1, 11];
            case "J":
            case "Q":
            case "K":
                return [10];
            default:
                return [+rank];
        }
    }

    public static getTotalPoints(cards: CardType[]) {
        const hasAce = cards.some((card) => card.rank === "A");
        let total = 0;
        cards.forEach((card) => {
            total += BlackjackUtils.getCardPoints(card.rank)[0];
        });
        if (hasAce && total + 10 <= BlackjackPoint) {
            return [total, total + 10];
        }
        return [total];
    }
}
