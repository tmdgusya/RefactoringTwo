## Chpater01 - Example01 회고

처음 이 함수를 맞이 하고, 로직을 간단하게 이해했을때 마틴 파울러가 테스트 코드를 작성하면서 리팩토링을 해야 기능이 틀리지 않다는 걸 확신할 수 있다고 하여,
테스트 코드를 작성하려고 했다.. 하지만 왠걸. 너무 분리가 안되있어서 테스트를 하기 힘들었고, 더더욱 메인 함수를 리팩토링 해야겠다는 생각이 들었다.

이래서 테스트 코드가 리팩토링을 하는데 중요한 이유를 벌써 두가지나 알아버린 것 같았다.

처음 **코드는 아래 코드와 같이 난잡하고 복잡**했다.

```javascript
function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

  const format = new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case "tragedy":
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;

      case "comedy":
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;

      default:
        throw new Error(`알 수 없는 장르: ${play.type}`);
    }

    volumeCredits += Math.max(perf.audience - 30, 0);

    if ("comedy" === play.type) {
      volumeCredits += Math.floor(perf.audience / 5);
    }

    result += `${play.name} : ${format(thisAmount / 10)} (${
      perf.audience
    }석)\n`;
    thisAmount += thisAmount;
  }

  result += `총액 ${format(totalAmount / 100)}\n`;
  result += `적립 포인트 ${volumeCredits}점`;
  return result;
}

export default statement;
```

결국 **정확한 기능 테스트를 위해서는 Function 이 분리되어 있어야 한다는걸 깨달았다.**

Function 이란게 한국어로 치면 기능이라는 생각이 명확히 이시점에 들었다..

나는 그래서 이걸 기능별 함수로 분리해보려 한다. 일단 위의 코드에서 Switch 문에서 가격을 알려주므로, 이 기능을 따로 분리해서 **amountFor() 라는 Function 으로 분리**해보자.
그치만 나는 마틴 파울러의 의견과 다르다. **perf 와 play 는 하나의 값 객체이다. 따라서 나는 객체를 넘겨줄 필요는 전혀 없다고 보기에, 필요한 속성만 넘겨줄 것**이다.

**필요없는 자율성은 Function 에게는 어울리지 않는다고 생각**한다.

```javascript
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
```

그러면 본문의 코드에서는 아래와 같이 진행될 것이다.

```javascript
let thisAmount = amountFor(perf.audience, play.type);
```

이제 맞는지 안맞는지를 테스트를 돌려보자!

![image](https://user-images.githubusercontent.com/57784077/127338030-17cd1db9-f793-4db2-a6a5-64ffd0cad6c4.png)

잘 동작한다. 이제 우리는 기능을 바꾸지 않고, 리팩토링을 처음으로 해내는데 성공했다. Commit 을 한번 해보자!
리팩터링을 했고, TestCode 도 잘돌아가므로, 검토를 한번하고 master 에 Push 하도록 하자! 개인적으로 푸시주기가 적은게 좋다고 생각한다.
나중가면 Push 를 Merge 하다가 자신의 코드와 남의 코드가 겹쳐질 수도 있기 때문이다.

## 본문의 for 문 분석

```javascript
for (let perf of invoice.performances) {
    const play = plays[perf.playID];

    let thisAmount = amountFor(perf.audience, play.type);

    volumeCredits += Math.max(perf.audience - 30, 0);

    if ("comedy" === play.type) {
      volumeCredits += Math.floor(perf.audience / 5);
    }
```

for 문을 한번 살펴보자. 두번째 줄의 `plays[perf.playID]` 는 perf 가 for 문을 돌면서 게속해서 바뀔것이고, 해당 인자를 매개변수로 배열에서 가져오는 것 뿐이다.
마틴 파울러는 이걸 **function 으로 분리해 내는게 좋다고 생각**한다고 한다. **나도 개인적으로 동의한다. 왜냐 validation 자체가 계속 추가될 수 있는데, 메인로직에 다 우겨박을 수 없으니깐.**
우리회사에도 이런 코드가 있다. 어느 회사건 레거시는 존재한다. 이러한 코드를 리팩토링 해보자

```javascript
function findPlayFromPlayList(performance, plays) {
  return plays[performance.playID];
}

//본문 코드
for (let perf of invoice.performances) {
    const play = findPlayFromPlayList(perf, plays);
```

이제 또 코드를 바꿨으니 테스트를 돌려보자.

![image](https://user-images.githubusercontent.com/57784077/127341405-0d565529-b56a-47f3-a41d-9154c1759b61.png)

이번에도 잘 돌아가는 걸 확인할 수 있다. 여기서는 **우리가 performance 를 통해 우리가 사려하는 연극(play) 가 무엇인지 알려**준다. 근데 나는 개인적으로 이코드가 전반적으로 마음에 안든다.

perf 라는 것이 엄청나게 맘에 안드는데, **사실 구매자가 산것이 연극이긴 한데 티켓이라고 보는게 맞다고 생각**한다.
그래서 **나는 ticket 이라는 변수명으로 refactoring 할것**이다.

하지만 그전에! 커밋부터하자!

커밋을 다했다면 이제 리팩터링의 모자를 다시 움켜쥐고, 변수명을 변경해보자.

```javascript
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
```

변수명을 바꿔보았다. **훨씬 더 나에게는 좋아졌다고 생각한다.(다른 사람에게도 더 좋지 않을 까란 생각을 한다. perf 같은 단축어는 한국인들은 조금은 알기 힘들다고 생각한다.)** invoice 의 **ticket 들에서 ticket 한장을 집어서
해당 ticket 이 현재 PlayList 에 있는 것들중 어떤 것인지 알려주는 기능 이 첫번째 부터 두번째 줄을 코드로서 설명해 줄 수 있다고 생각**한다.

자 근데 사실 findPlayFromPlayList 에서 없다면 default value 나 Error 를 던지고 싶은데, 그건 리팩토링이 아니므로 하지 않겠다. 우리는 리팩토링 모자를 쓰고 있으므로, refactoring 의 임무에 최선을 다해야 한다.

마틴 파울러는 `findPlayFromPlayList` 이걸 인라인으로 쓰는데, 그렇게 되면 저 함수가 객체를 뱉어내야만 하는 로직이 되어서 나는 좋지 않다고 생각한다. 왜냐하면 play 라는 것에 대한 검증을 마친뒤 밑에서는 그냥 사용하고, 더 이상 호출될 필요가 없다고 생각한다. 또한 변수에 확정 매개변수가 아닌 전부 사용하지도 않는 객체를 넣는 건 별로 좋지 않다고 생각한다.

마틴파울러는 `findPlayFromPlayList().type` 이런식으로 사용했는데, 그렇게 별로 나는 좋아 하진 않는다. 여하튼 자신의 생각만 있다면 의견이므로, 나와 다른 사람도 있다고 생각한다.

그리고 `amountFor()` 안에서 `findPlayFromPlayList` 를 호출해서, play 를 부르는 로직이 좋은 로직인지에 대한 평가도 필요하다고 생각한다. 일단 **내부에서 다른 Function 에 대한 Dependency 를 생성해 내고 있다. 나는 별로 좋지 않다고 생각**한다.

왜냐하면 테스트를 하는데, 저 내부의 Depdency 를 생각한다고 해보아라. 그냥 받아온 값만을 처리하는 것이 Function 이라고 생각하기에 나는 내부에서 Depdency 를 최대한 줄여내는 방향으로 리팩터링 해보겠다.

마틴 파울러의 방식이 좋다면, 해당 방식으로 진행해도 좋다. 어차피 의견일 뿐 서로 합의점을 찾아나가서 더 좋은 코드로 발전해 나갈 수 있기만 하면 된다.

## 적립 포인트 계산 코드 추출하기

기존의 코드는 아래와 같다.

```javascript
volumeCredits += Math.max(perf.audience - 30, 0);

if ("comedy" === play.type) {
  volumeCredits += Math.floor(perf.audience / 5);
}
```

위의 코드를 한번 보자, **현재는 "comedy" 일때만 보너스 적립을 더주지만, 나중에 정책이 추가된다면 저기에 무한정으로 if 문의 분기만 늘어날 것**이다. 그렇게 되면 코드 라인은 점점 길어지고 누군가는 보기 힘든 코드가 될것이라고 생각한다. 따라서 좀 더 함수로 분리되야 한다고 생각한다.

```javascript
function volumeCreditsFor(audience, type) {
  let volumeCredits = 0;
  volumeCredits += Math.max(audience - 30, 0);

  if ("comedy" === type) {
    volumeCredits += Math.floor(audience / 5);
  }

  return volumeCredits;
}
```

위와 같이 리팩토링을 해보았다, 하지만 나는 저 정책마져 함수로 분리되어야 나중에 정책함수를 제대로 볼 수 있다고 생각한다. 나중에는 switch 문이 이 로직안에 생겨버릴 것이라고 분명히 생각한다.

```javascript
function volumeCreditsFor(audience, type) {
  let volumeCredits = 0;
  volumeCredits += Math.max(audience - 30, 0);

  volumeCredits += bonusFeePolicy(audience, type);

  return volumeCredits;
}

function bonusFeePolicy(audience, type) {
  let bonusFee = 0;

  if ("comedy" === type) {
    bonusFee = Math.floor(audience / 5);
  }

  return bonusFee;
}
```

자 이제 정책은 해당 란에 적을 수 있게 됬다. 이제 우리는 **정책을 추가할때마다 `bonusFeePolicy` 에 정책을 추가** 할 것이다. **그럼 이제 신입이 오더라도, 우리의 추가 요금 정책은 해당 함수를 확인하면 된다.** 😃

이제 테스트를 한번 돌려보자!

![image](https://user-images.githubusercontent.com/57784077/127346477-4662f219-e1d0-460e-a457-a8eeb2cb5d4b.png)

또 잘 성공하는걸 볼 수 있다. 우리의 코드는 점점 리팩토링이 잘 진행되어 가고 있다고 생각된다.

## format

우리는 내부에서 최대한 불필요한 검증로직을 안만드려고 하고 있다. 따라서 format 또한 내부에서 검증로직이나, 가공하는 과정을 거칠필요가 없다. 그건 다른 함수의 역할이지 이함수가 할 역할은 아니다. 따라서 함수에서 분리해 내도록 하자.

```javascript
function usd(money) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(money / 100);
}
```

**개인적으로 정말 마음에 든다. 딱 usd 형태의 formatting 을 제공한다는걸 보여주지 않는가?**
따라서 본문로직은 아래와 같이 바뀌었다.

```javascript
for (let ticket of invoice.tickets) {
  const play = findPlayFromPlayList(ticket, plays);
  let thisAmount = amountFor(ticket.audience, play.type);

  volumeCredits += volumeCreditsFor(ticket.audience, play.type);

  result += `${play.name} : ${usd(thisAmount)} (${ticket.audience}석)\n`;
  totalAmount += thisAmount;
}
```

## 잘 되어가고 있는가?

잘 생각해보자! **자바에서는 해당 로직에 사용하는 함수들은 하나의 Scope 를 만들어 관리했다. 예를 들면 하나의 객체안에 private 으로 넣어서 내부 로직을 관리**했다. 그렇다면 **자바스크립트에서는 어떻게 해야할까? 바로 스코프를 만들어야 한다. 따라서 우리는 밖으로 빼냈던 함수들이 내부 로직으로 판단되므로, 중첩함수로 변경할 것**이다.

이렇게 넣고보니 생각해보면, 자바에서 `this.value` 로 해서 안의 scope 변수를 이용하듯이, 충분히 인자에서 제거할 것들이 보인다. 찾아서 전부 제거해보자.

확인해보니, **`findPlayFromPlayList` 의 plays 는 내부 변수이므로 제거해도된다. 제거하자.**

```javascript
function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

  for (let ticket of invoice.tickets) {
    const play = findPlayFromPlayList(ticket.playID);
    let thisAmount = amountFor(ticket.audience, play.type);

    volumeCredits += volumeCreditsFor(ticket.audience, play.type);

    result += `${play.name} : ${usd(thisAmount)} (${ticket.audience}석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액 ${usd(totalAmount / 100)}\n`;
  result += `적립 포인트 ${volumeCredits}점`;
  return result;

  function volumeCreditsFor(audience, type) {
    let volumeCredits = 0;
    volumeCredits += Math.max(audience - 30, 0);

    volumeCredits += bonusFeePolicy(audience, type);

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
}
```

길어보이지만, 그래도 메인 로직은 상당히 짧다 그럼에도 정리할 함수들이 보인다.
테스트를 돌려보자. 잘 통과한다. 이제 사진은 올리지 않겠다.

훨씬 더 코드들이 깔끔해 졌다고 생각한다. 일단 커밋을 한번 더 하자.
여하튼 여기까지 진짜로 따라했다면, 당신은 테스트 코드가 리팩토링 단계에서 필요한 이유를 어느정도 알게 됬다고 생각한다.

## 유저 구입 관련 함수 리팩토링

```javascript
for (let ticket of invoice.tickets) {
  const play = findPlayFromPlayList(ticket.playID);
  let thisAmount = amountFor(ticket.audience, play.type);

  volumeCredits += volumeCreditsFor(ticket.audience, play.type);

  result += `${play.name} : ${usd(thisAmount)} (${ticket.audience}석)\n`;
  totalAmount += thisAmount;
}
```

여기 안에서는 `${play.name} : ${usd(thisAmount)} (${ticket.audience}석)\n` 의 역할을 하는 친구가 있다. 이 함수는 주어진 args 에 따라서, 그냥 단순히 메세징을 출력하는 용도라고 생각한다. 그래서 별도의 함수로는 빼지 않겠다. 딱히 리팩토링의 대상이 아닌거 같다.

totalAmount 를 구하는건 리팩토링의 고려대상잉라고 생각한다. **객체 지향적으로 생각해봤을때도, 메소드가 있는게 맞다라고 생각한다.**

```javascript
function totalAmount(play) {
  let totalAmount = 0;
  for (let ticket of invoice.tickets) {
    totalAmount = amountFor(ticket.audience, play.type);
  }
  return totalAmount;
}
```

이렇게 되니 하나의 문제점이 발생했다. **지역변수 play 를 계속해서 필요로 한다는것, 이것이 마틴 파울러가 말한 지역변수의 문제점이 였나 싶다. 그렇담 내 코드에 문제가 있는 것이므로 빠르게 인정하고 롤백**하도록 하자. **일단 시급한건 지역변수를 몰아내는 것**이다.

일단 play 를 몰아내보자!

```javascript
for (let ticket of invoice.tickets) {
  let thisAmount = amountFor(
    ticket.audience,
    findPlayFromPlayList(ticket.playID).type
  );

  volumeCredits += volumeCreditsFor(
    ticket.audience,
    findPlayFromPlayList(ticket.playID).type
  );

  result += `${findPlayFromPlayList(ticket.playID).name} : ${usd(
    thisAmount
  )} (${ticket.audience}석)\n`;
  totalAmount += thisAmount;
}
```

테스트를 돌려보자. 잘 돌아간다면, `amountFor` 도 중첩함수이므로, 충분히 `findPlayFromPlayList` 를 이용할 수 있다. 변경해보자.

```javascript
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
```

이제는 AmountFor 가 ticket 을 가져도 된다. 자 바꾼 뒤 테스트를 해보자!

잘 동작한다. 이제 커밋을 해보자!

자 그렇담 이제 우리의 준비는 끝났다. 아까 `totalAmount()` 를 롤백해보자.

```javascript
function totalAmount(play) {
  let totalAmount = 0;
  for (let ticket of invoice.tickets) {
    totalAmount = amountFor(ticket.audience, play.type);
  }
  return totalAmount;
}
```

근데 이제는 amountFor 에 play 는 필요가 없다. 따라서 지워준다.

```javascript
function totalAmount() {
  let totalAmount = 0;
  for (let ticket of invoice.tickets) {
    totalAmount = amountFor(ticket);
  }
  return totalAmount;
}
```

자 코드가 훨씬 더 깔끔해졌다. 이제 다시 테스트를 또 돌려보자.

잘 돌아간다. 자 그렇담 여기서 다시 돌아보자.

아직도 3개 정도의 지역변수가 보인다. 하지만 더 쓰면 Post 가 너무 길어질것 같아 여기까지만 쓰도록 하겠다.
다들 이제 어느정도 리팩토링을 왜해야하는지 감이 왔다고 생각할 것이다. 아래는 바뀐코드이다.

```javascript
function statement(invoice, plays) {
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

  for (let ticket of invoice.tickets) {
    let thisAmount = amountFor(ticket);

    volumeCredits += volumeCreditsFor(
      ticket.audience,
      findPlayFromPlayList(ticket.playID).type
    );

    result += `${findPlayFromPlayList(ticket.playID).name} : ${usd(
      thisAmount
    )} (${ticket.audience}석)\n`;
  }

  result += `총액 ${usd(totalAmount())}\n`;
  result += `적립 포인트 ${volumeCredits}점`;
  return result;

  function totalAmount() {
    let totalAmount = 0;
    for (let ticket of invoice.tickets) {
      totalAmount = amountFor(ticket);
    }
    return totalAmount;
  }

  function volumeCreditsFor(audience, type) {
    let volumeCredits = 0;
    volumeCredits += Math.max(audience - 30, 0);

    volumeCredits += bonusFeePolicy(audience, type);

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
```
