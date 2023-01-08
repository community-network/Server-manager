const AB = ["homePage"];
const fixedTest = null;

function switchingTest(A: string, B: React.ReactElement | string, v: number) {
  return v === 1 ? B : A;
}

// Switch for AB testing. Shows user A or B option to test new features
export function ABSwitch(A: any, B: React.ReactElement, key: string) {
  if (!(key in AB)) {
    return A;
  }
  return switchingTest(A, B, getChannel());
}

// A or B channel
export function getChannel() {
  const storageKey = "TestAB";
  if (fixedTest) {
    return fixedTest;
  }
  if (localStorage) {
    const storageItemTest = localStorage.getItem(storageKey);
    if (storageItemTest) {
      return storageItemTest;
    } else {
      const testValue = Math.floor(Math.random() * 10) % 2;
      localStorage.setItem(storageKey, testValue.toString());
      return testValue;
    }
  } else {
    return 0;
  }
}
