export function statement(invoice, plays) {
  return renderPlainText(createStatement(invoice, plays));
}

export function htmlStatement(invoice, plays) {
  return renderHTML(createStatement(invoice, plays));
}

function renderHTML(data) {
  let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
  result += "<table>\n";
  result += "<tr><th>연극</th></th>좌석 수</th><th>금액</th><tr>";
  for (let ticket of data.tickets) {
    result += ` <tr><td>${ticket.play.name}</td></td>(${ticket.audience}석)</td>\n`;
    result += `<td>${usd(ticket.amoun)}</td></tr>\n`;
  }
  result += `</talbe>\n`;
  result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점`;
  return result;
}

function createStatement(invoice, plays) {
  const statementData = {};

  statementData.customer = invoice.customer;
  statementData.tickets = invoice.tickets.map(copyTicket);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  statementData.totalAmount = totalAmount(statementData);

  return statementData;

  function copyTicket(ticket) {
    const result = Object.assign({}, ticket);
    result.play = findPlayFromPlayList(result.playID);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  function findPlayFromPlayList(id) {
    return plays[id];
  }

  function amountFor(result) {
    let thisAmount = 0;

    switch (result.play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (result.audience > 30) {
          thisAmount += 1000 * (result.audience - 30);
        }
        break;

      case "comedy":
        thisAmount = 30000;
        if (result.audience > 20) {
          thisAmount += 10000 + 500 * (result.audience - 20);
        }
        thisAmount += 300 * result.audience;
        break;

      default:
        throw new Error(`알 수 없는 장르: ${result.play.type}`);
    }

    return thisAmount;
  }

  function volumeCreditsFor(result) {
    let volumeCredits = 0;
    volumeCredits += Math.max(result.audience - 30, 0);

    volumeCredits += bonusFeePolicy(result.audience, result.play.type);

    return volumeCredits;
  }

  function bonusFeePolicy(audience, type) {
    let bonusFee = 0;

    if ("comedy" === type) {
      bonusFee = Math.floor(audience / 5);
    }

    return bonusFee;
  }

  function totalVolumeCredits(statementData) {
    let volumeCredits = 0;
    for (let ticket of statementData.tickets) {
      volumeCredits += volumeCreditsFor(ticket);
    }
    return volumeCredits;
  }

  function totalAmount(statementData) {
    let totalAmount = 0;
    for (let ticket of statementData.tickets) {
      totalAmount += ticket.amount;
    }
    return totalAmount;
  }
}

function renderPlainText(data) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;

  for (let ticket of data.tickets) {
    result += `${ticket.play.name} : ${usd(ticket.amount)} (${
      ticket.audience
    }석)\n`;
  }

  result += `총액 ${usd(data.totalAmount)}\n`;
  result += `적립 포인트 ${data.totalVolumeCredits}점`;
  return result;
}

function usd(money) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(money / 100);
}
