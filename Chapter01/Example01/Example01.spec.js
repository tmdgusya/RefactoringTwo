import playJsonData from "./plays.json";
import invoiceJsonData from "./invoices.json";
import flaseJsonData from "./falsePlay.json";
import tragedyDefaultPriceJson from "./invoices_as_tragedy_30.json";
import comedyDefaultPriceJson from "./invoices_as_like_under_30.json";
import { expect, describe, it } from "@jest/globals";
import { statement, htmlStatement } from "./Example01";

describe("statement() result test", () => {
  it("USER 의 청구내역명이 RESULT 로 정상적으로 출력되는지 확인한다.", () => {
    const billingDetail = statement(invoiceJsonData[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $580.00 (35석)
Othello : $500.00 (40석)
총액 $1,730.00
적립 포인트 47점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("USER가 비극 티켓을 30석 이하일때 사려할 시 사려할시 40000원으로 계산되는지 확인한다.", () => {
    const billingDetail = statement(tragedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: Roach)
hemlet : $400.00 (30석)
As You Like It : $580.00 (35석)
Othello : $400.00 (30석)
총액 $1,380.00
적립 포인트 12점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("USER가 희극 티켓을 20석 이하일때 사려할 시 사려할시 30000원으로 계산되는지 확인한다.", () => {
    const billingDetail = statement(comedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $360.00 (20석)
Othello : $500.00 (40석)
총액 $1,510.00
적립 포인트 39점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("없는 카테고리의 티켓을 사려할시 Error 가 나는지 확인한다. 또한 에러메세지가 정상적으로 출력되는지 확인한단.", () => {
    const billingDetail = statement(comedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $360.00 (20석)
Othello : $500.00 (40석)
총액 $1,510.00
적립 포인트 39점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("보너스 점수를 정확히 계산하는지 확인한다.", () => {
    const billingDetail = statement(comedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $360.00 (20석)
Othello : $500.00 (40석)
총액 $1,510.00
적립 포인트 39점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("알수없는 장로를 고를시, 에러를 리턴하는지 확인한다.", () => {
    expect(() => {
      statement(comedyDefaultPriceJson[0], flaseJsonData);
    }).toThrowError(new Error("알 수 없는 장르: movie"));
  });
});

describe("HTMLstate() result test", () => {
  it("USER 의 청구내역명이 RESULT 로 정상적으로 출력되는지 확인한다.", () => {
    const billingDetail = htmlStatement(invoiceJsonData[0], playJsonData);
    const testdata = {
      customer: "BigCo",
      tickets: [
        {
          playID: "hamlet",
          audience: 55,
          play: { name: "hemlet", type: "tragedy" },
          amount: "$650.00",
          volumeCredits: 25,
        },
        {
          playID: "as-like",
          audience: 35,
          play: { name: "As You Like It", type: "comedy" },
          amount: "$580.00",
          volumeCredits: 12,
        },
        {
          playID: "othello",
          audience: 40,
          play: { name: "Othello", type: "tragedy" },
          amount: "$500.00",
          volumeCredits: 10,
        },
      ],
      totalVolumeCredits: 47,
      totalAmount: "$1,730.00",
    };
    const expectMessage = createTestMessage(testdata);

    expect(billingDetail).toEqual(expectMessage);
  });
});

function createTestMessage(data) {
  let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
  result += "<table>\n";
  result += "<tr><th>연극</th></th>좌석 수</th><th>금액</th><tr>";
  for (let ticket of data.tickets) {
    result += ` <tr><td>${ticket.play.name}</td></td>(${ticket.audience}석)</td>\n`;
    result += `<td>${ticket.amount}</td></tr>\n`;
  }
  result += `</talbe>\n`;
  result += `<p>총액: <em>${data.totalAmount}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점`;
  return result;
}
