const fs = require('fs');
const readlineSync = require('readline-sync');

class Iterator {
    constructor() {
        this.size = 0;
        this.matrix = null;
        this.BVector = null;
        this.e = 0.001;
        this.iterations = 100;
    }

    init(size) {
        this.size = size;
        this.matrix = new Array(size).fill(null).map(() => new Array(size));
        this.BVector = new Array(size);
    }

    addFromFile(filename) {
        const data = fs.readFileSync(filename, 'utf8').trim().split('\n');
        this.size = parseInt(data[0]);
        this.matrix = [];
        this.BVector = [];
        for (let i = 1; i <= this.size; i++) {
            const row = data[i].trim().split(/\s+/).map((num) => {
                const parsed = parseFloat(num.replace(',', '.'));
                if (isNaN(parsed)) {
                    console.log('Ошибка: обнаружено неверное значение во входных данных.');
                    process.exit(1);
                }
                return parsed;
            });
            if (row.length !== this.size + 1) {
                console.log('Ошибка: неправильное количество элементов в строке.');
                process.exit(1);
            }
            this.matrix.push(row.slice(0, this.size));
            this.BVector.push(row[this.size]);
        }

        console.log('\nПрочитанная матрица:');
        this.printMatrix();

        const iterations = parseFloat(data[this.size + 2]);
        const accuracy = parseFloat(data[this.size + 1]);
        
        this.e = accuracy;
        this.iterations = Math.round(iterations);

        console.log(`\nТочность: ${this.e}`);
        console.log(`Максимальное количество итераций: ${this.iterations}`);
    }

    addFromConsole() {
        console.log('Введите размер матрицы:');
        const size = parseInt(readlineSync.question());
        this.init(size);
        console.log('Введите элементы матрицы:');
        for (let i = 0; i < size; i++) {
            const row = readlineSync.question(`Введите строку ${i + 1}: `).trim().split(/\s+/).map((num) => {
                const parsed = parseFloat(num.replace(',', '.'));
                if (isNaN(parsed)) {
                    console.log('Ошибка: обнаружено неверное значение во входных данных.');
                    process.exit(1);
                }
                return parsed;
            });
            if (row.some(isNaN)) {
                console.log('Ошибка: обнаружено неверное значение во входных данных.');
                process.exit(1);
            }
            this.matrix[i] = row.slice(0, size);
            this.BVector[i] = row[size];
        }
        console.log('\nВведенная матрица:');
        this.printMatrix();

        console.log('\nВведите необходимую точность (e):');
    do {
        const input = parseFloat(readlineSync.question());
        if (!isNaN(input)) {
            this.e = input;
            break;
        } else {
            console.log('Ошибка: введено некорректное значение. Повторите ввод:');
        }
    } while (true);

    console.log('\nВведите максимальное количество итераций:');
    do {
        const input = parseFloat(readlineSync.question());
        if (!isNaN(input)) {
            this.count = input;
            break;
        } else {
            console.log('Ошибка: введено некорректное значение. Повторите ввод:');
        }
    } while (true);
    }

    printMatrix() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                process.stdout.write(`${this.matrix[i][j].toFixed(4)} `);
            }
            console.log(` ${this.BVector[i]}`);
        }
    }

    checkDiagonalDominance() {
        let diagonalDominant = true;
        for (let i = 0; i < this.size; i++) {
            let sum = 0;
            for (let j = 0; j < this.size; j++) {
                if (i !== j) {
                    sum += Math.abs(this.matrix[i][j]);
                }
            }
            if (Math.abs(this.matrix[i][i]) <= sum) {
                diagonalDominant = false;
                break;
            }
        }
        return diagonalDominant;
    }

    transformMatrix() {
        let temp = 0;
        for (let k = 0; k < this.size; k++) {
            for (let i = 0; i < this.size; i++) {
                temp = this.matrix[i][i] * (-1);
                if (isNaN(temp)) {
                    console.log('\nПреобразование невозможно.');
                    process.exit(1);
                }
                this.BVector[i] /= temp;
                for (let j = 0; j <= this.size; j++) {
                    this.matrix[i][j] /= temp;
                }
            }
        }
        for (let i = 0; i < this.size; i++) {
            this.BVector[i] *= -1;
            for (let j = 0; j < this.size; j++)
                this.matrix[i][i] = 0;
        }
    }

    getNorm() {
        let sum = 0, max = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                sum += Math.abs(this.matrix[i][j]);
                if (sum > max) max = sum;
            }
            sum = 0;
        }
        return max;
    }

    accuracyСheck(e) {
        const norm = this.getNorm();
        return ((1 - norm) / norm) * e;
    }

    iterate() {

        const currentVector = new Array(this.size);
        const prevVector = new Array(this.size);
        const errorRateVector = new Array(this.size);
        let maximum = 0, count = this.iterations, e = this.e, accuracy = 0;

        accuracy = this.accuracyСheck(e);
        

        for (let i = 0; i < this.size; i++)
            prevVector[i] = this.BVector[i];

        let counter = 0;
        do {
            for (let i = 0; i < this.size; i++) {
                currentVector[i] = 0;
                for (let j = 0; j < this.size; j++) {
                    currentVector[i] += this.matrix[i][j] * prevVector[j];
                    if (isNaN(currentVector[i])) {
                        console.log('Нет решений.');
                        process.exit(1);
                    }
                }
                currentVector[i] += this.BVector[i];
                errorRateVector[i] = Math.abs(currentVector[i] - prevVector[i]);
            }

            maximum = 0;
            for (let i = 0; i < this.size; i++) {
                if (maximum < errorRateVector[i]) maximum = errorRateVector[i];
                prevVector[i] = currentVector[i];
            }

            console.log(`${counter + 1}. max err = ${maximum}`);

            counter++;
            if (counter > count) {
                console.log('Превышено максимальное количество итераций (100).');
                process.exit(1);
            }
        } while (maximum > accuracy);
        console.log(`\nКоличество итераций: ${counter}\n`);

        for (let i = 0; i < this.size; i++){
            console.log(`x${i + 1} = ${toTwo(currentVector[i])}`);
        }

        console.log('\nВектор погрешностей:');
        for (let i = 0; i < this.size; i++) {
            console.log(`Δx${i + 1} = ${toTwo(errorRateVector[i])}`);
        }
    }
}

function toTwo(num) {
    let numStr = num.toFixed(24).toString();
    let lastIndex = zeroIndex(numStr);
    if (lastIndex === -1) {
        return num.toFixed(2);
    } else {
        if(numStr[0] !== '-'){
            return numStr.slice(0, lastIndex + 3);
        } else {
            return numStr.slice(0, lastIndex + 4);
        }
    }
}

function zeroIndex(str) {
    let lastZeroIndex = -1;

    for (let i = str.length - 1; i >= 0; i--) {
        if (str[i] === '0' && str[i - 1] !== '.' && str[i + 1] == '0') {
            lastZeroIndex = i + 1;
            break;
        }
    }
    console.log(lastZeroIndex);
    return lastZeroIndex;
}



function main() {
    const choice = readlineSync.question('Выберите способ ввода матрицы (файл - "f", консоль - "c"): ');
    const iterator = new Iterator();
    if (choice.toLowerCase() === 'f') {
        iterator.addFromFile('input.txt');
    } else if (choice.toLowerCase() === 'c') {
        iterator.addFromConsole();
    } else {
        console.log('Некорректный выбор. Повторите попытку.');
        return;
    }

    if (!iterator.checkDiagonalDominance()) {
        console.log('\nОшибка: матрица не обладает диагональным преобладанием.');
        return;
    }

    iterator.transformMatrix();
    console.log('\nПреобразованная матрица:');
    iterator.printMatrix();
    console.log('');
    iterator.iterate(this.accuracy, this.count);
}

main();