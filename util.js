export function* zip(arr1, arr2) {
    const lenMax = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < lenMax; i++) {
        yield [arr1[i], arr2[i], i];
    }
}