import playJsonData from "./plays.json";
import invoiceJsonData from "./invoices.json";
import flaseJsonData from "./falsePlay.json";
import tragedyDefaultPriceJson from "./invoices_as_tragedy_30.json";
import comedyDefaultPriceJson from "./invoices_as_like_under_30.json";
import { expect, describe, it } from "@jest/globals";
import statement from "./Example01";

const testPlaysJsonFile = JSON.parse(JSON.stringify(playJsonData));
const testInvoiceJsonData = JSON.parse(JSON.stringify(invoiceJsonData));

describe("statement() result test", () => {
  it("USER 의 청구내역명이 RESULT 로 정상적으로 출력되는지 확인한다.", () => {
    const billingDetail = statement(invoiceJsonData[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $580.00 (35석)
Othello : $500.00 (40석)
총액 $17.30
적립 포인트 47점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("USER가 비극 티켓을 30석 이하일때 사려할 시 사려할시 40000원으로 계산되는지 확인한다.", () => {
    const billingDetail = statement(tragedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: Roach)
hemlet : $400.00 (30석)
As You Like It : $580.00 (35석)
Othello : $400.00 (30석)
총액 $13.80
적립 포인트 12점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("USER가 희극 티켓을 20석 이하일때 사려할 시 사려할시 30000원으로 계산되는지 확인한다.", () => {
    const billingDetail = statement(comedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $360.00 (20석)
Othello : $500.00 (40석)
총액 $15.10
적립 포인트 39점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("없는 카테고리의 티켓을 사려할시 Error 가 나는지 확인한다. 또한 에러메세지가 정상적으로 출력되는지 확인한단.", () => {
    const billingDetail = statement(comedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $360.00 (20석)
Othello : $500.00 (40석)
총액 $15.10
적립 포인트 39점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("보너스 점수를 정확히 계산하는지 확인한다.", () => {
    const billingDetail = statement(comedyDefaultPriceJson[0], playJsonData);

    const expectMessage = `청구 내역 (고객명: BigCo)
hemlet : $650.00 (55석)
As You Like It : $360.00 (20석)
Othello : $500.00 (40석)
총액 $15.10
적립 포인트 39점`;

    expect(billingDetail).toEqual(expectMessage);
  });

  it("알수없는 장로를 고를시, 에러를 리턴하는지 확인한다.", () => {
    expect(() => {
      statement(comedyDefaultPriceJson[0], flaseJsonData);
    }).toThrowError(new Error("알 수 없는 장르: movie"));
  });
});
