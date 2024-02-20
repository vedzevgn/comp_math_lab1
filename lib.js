const math = require('mathjs');

const coefficientsMatrix = [
  [6.25, -1, 0.5],
  [1, 5, 3.12],
  [0.5, 2.12, 3.6]
];

const constantsVector = [
  7.5,
  -8.68,
  -0.24
];

const solution = math.lusolve(coefficientsMatrix, constantsVector);

console.log('Решение СЛАУ:');
console.log(solution);
