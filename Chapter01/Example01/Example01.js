import { usd } from "./dollorUtil";
import { createTicketCalculater } from "./TicketCalculator";

export function statement(invoice, plays) {
  return renderPlainText(createStatement(invoice, plays));
}

export function htmlStatement(invoice, plays) {
  return renderHTML(createStatement(invoice, plays));
}

function createStatement(invoice, plays) {
  const statementData = {};

  statementData.customer = invoice.customer;
  statementData.tickets = invoice.tickets.map(copyTicket);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  statementData.totalAmount = totalAmount(statementData);

  return statementData;

  function copyTicket(ticket) {
    const caculator = createTicketCalculater(
      ticket,
      findPlayFromPlayList(ticket.playID)
    );
    const result = Object.assign({}, ticket);
    result.play = caculator.play;
    result.amount = amountFor(ticket);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }

  function findPlayFromPlayList(id) {
    return plays[id];
  }

  function amountFor(ticket) {
    return createTicketCalculater(ticket, findPlayFromPlayList(ticket.playID))
      .amount;
  }

  function volumeCreditsFor(ticket) {
    return createTicketCalculater(ticket, findPlayFromPlayList(ticket.playID))
      .volumeCredits;
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

function renderHTML(data) {
  let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
  result += "<table>\n";
  result += "<tr><th>연극</th></th>좌석 수</th><th>금액</th><tr>";
  for (let ticket of data.tickets) {
    result += ` <tr><td>${ticket.play.name}</td></td>(${ticket.audience}석)</td>\n`;
    result += `<td>${usd(ticket.amount)}</td></tr>\n`;
  }
  result += `</talbe>\n`;
  result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점`;
  return result;
}
