function statement(invoice, plays) {
  return renderPlainText(invoice, plays);
}

function renderPlainText(invoice, plays) {
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

  for (let ticket of invoice.tickets) {
    result += `${findPlayFromPlayList(ticket.playID).name} : ${usd(
      amountFor(ticket)
    )} (${ticket.audience}석)\n`;
  }

  result += `총액 ${usd(totalAmount())}\n`;
  result += `적립 포인트 ${totalVolumeCredits()}점`;
  return result;

  function totalAmount() {
    let totalAmount = 0;
    for (let ticket of invoice.tickets) {
      totalAmount += amountFor(ticket);
    }
    return totalAmount;
  }

  function totalVolumeCredits() {
    let volumeCredits = 0;
    for (let ticket of invoice.tickets) {
      volumeCredits += volumeCreditsFor(ticket);
    }
    return volumeCredits;
  }

  function volumeCreditsFor(ticket) {
    let volumeCredits = 0;
    volumeCredits += Math.max(ticket.audience - 30, 0);

    volumeCredits += bonusFeePolicy(
      ticket.audience,
      findPlayFromPlayList(ticket.playID).type
    );

    return volumeCredits;
  }

  function bonusFeePolicy(audience, type) {
    let bonusFee = 0;

    if ("comedy" === type) {
      bonusFee = Math.floor(audience / 5);
    }

    return bonusFee;
  }

  function findPlayFromPlayList(id) {
    return plays[id];
  }

  function amountFor(ticket) {
    let thisAmount = 0;

    switch (findPlayFromPlayList(ticket.playID).type) {
      case "tragedy":
        thisAmount = 40000;
        if (ticket.audience > 30) {
          thisAmount += 1000 * (ticket.audience - 30);
        }
        break;

      case "comedy":
        thisAmount = 30000;
        if (ticket.audience > 20) {
          thisAmount += 10000 + 500 * (ticket.audience - 20);
        }
        thisAmount += 300 * ticket.audience;
        break;

      default:
        throw new Error(
          `알 수 없는 장르: ${findPlayFromPlayList(ticket.playID).type}`
        );
    }

    return thisAmount;
  }
}

function usd(money) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(money / 100);
}

export default statement;
