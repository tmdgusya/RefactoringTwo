class TicketCalculator {
  constructor(ticket, play) {
    this.ticket = ticket;
    this.play = play;
  }

  get amount() {
    let thisAmount = 0;

    switch (this.play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (this.ticket.audience > 30) {
          thisAmount += 1000 * (this.ticket.audience - 30);
        }
        break;

      case "comedy":
        thisAmount = 30000;
        if (this.ticket.audience > 20) {
          thisAmount += 10000 + 500 * (this.ticket.audience - 20);
        }
        thisAmount += 300 * this.ticket.audience;
        break;

      default:
        throw new Error(`알 수 없는 장르: ${this.play.type}`);
    }

    return thisAmount;
  }

  get volumeCredits() {
    let volumeCredits = 0;
    volumeCredits += Math.max(this.ticket.audience - 30, 0);

    volumeCredits += this.bonusFeePolicy(this.ticket.audience, this.play.type);

    return volumeCredits;
  }

  bonusFeePolicy(audience, type) {
    let bonusFee = 0;

    if ("comedy" === type) {
      bonusFee = Math.floor(audience / 5);
    }

    return bonusFee;
  }
}

export function createTicketCalculater(ticket, play) {
  return new TicketCalculator(ticket, play);
}
