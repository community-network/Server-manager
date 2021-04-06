import rollout from "../rollout.json";

const fixedTest = null;
const keys = rollout["AB"];

// Switch for AB testing. Shows user A or B option to test new features
export default function ABSwitch(A, B, key) {
    if (!(key in keys)) {
        return A;
    }
    return switchingTest(A, B, getChannel());
}

// A or B channel
export function getChannel() {
    const storageKey = 'TestAB';
    if (fixedTest) {
        return fixedTest;
    }
    if (localStorage) {
        let storageItemTest = localStorage.getItem(storageKey);
        if (storageItemTest) {
            return storageItemTest;
        } else {
            const testValue = Math.floor(Math.random() * 10) % 2;
            localStorage.setItem(storageKey, testValue);
            return testValue;
        }
    } else {
        return 0;
    }
}

function switchingTest(A, B, v) {
    return (v === 1) ? B : A;
}