function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

  const format = new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let ticket of invoice.tickets) {
    const play = findPlayFromPlayList(ticket, plays);

    let thisAmount = amountFor(ticket.audience, play.type);

    volumeCredits += Math.max(ticket.audience - 30, 0);

    if ("comedy" === play.type) {
      volumeCredits += Math.floor(ticket.audience / 5);
    }

    result += `${play.name} : ${format(thisAmount / 10)} (${
      ticket.audience
    }석)\n`;
    thisAmount += thisAmount;
  }

  result += `총액 ${format(totalAmount / 100)}\n`;
  result += `적립 포인트 ${volumeCredits}점`;
  return result;
}

function findPlayFromPlayList(performance, plays) {
  return plays[performance.playID];
}

// 값이 바뀌지 않는 변수는 매개변수로 전달
function amountFor(audience, type) {
  let thisAmount = 0;

  switch (type) {
    case "tragedy":
      thisAmount = 40000;
      if (audience > 30) {
        thisAmount += 1000 * (audience - 30);
      }
      break;

    case "comedy":
      thisAmount = 30000;
      if (audience > 20) {
        thisAmount += 10000 + 500 * (audience - 20);
      }
      thisAmount += 300 * audience;
      break;

    default:
      throw new Error(`알 수 없는 장르: ${type}`);
  }

  return thisAmount;
}

export default statement;
