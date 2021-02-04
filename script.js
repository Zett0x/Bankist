'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-05-27T17:01:17.194Z',
    '2021-01-24T20:36:17.929Z',
    '2021-01-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2021-04-10T14:43:26.374Z',
    '2021-06-25T18:49:59.371Z',
    '2021-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//DATE FORMATTING
const calcDaysAgo = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

const dateFormat = function (date, locale) {
  const daysAgo = calcDaysAgo(new Date(), date);
  console.log(daysAgo);

  if (daysAgo === 0) return 'Today';
  else if (daysAgo === 1) return 'Yesterday';
  else if (daysAgo == 2) return '2 days ago';
  else if (daysAgo == 3) return '3 days ago';
  else if (daysAgo == 4) return '3 days ago';
  else if (daysAgo == 5) return '3 days ago';
  else if (daysAgo == 6) return '3 days ago';
  else if (daysAgo == 7) return 'One week ago';
  /*
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
  */
  return new Intl.DateTimeFormat(locale).format(date);
};
// NUMBER FORMATTING

const formatCurrency = function (value, locale, currency) {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
//---------------------------
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  /*
  const dates = sort
    ? account.movementsDates.slice().sort((a, b) => a - b)
    : account.movementsDates;*/

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const displayDate = dateFormat(date, account.locale);
    const displayMov = formatCurrency(mov, account.locale, account.currency);
    const html = `
  <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${displayMov}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcPrintBalance = function (account) {
  const balance = account.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = formatCurrency(
    balance,
    account.locale,
    account.currency
  );
  account.balance = balance;
};

const resetValues = function () {
  currentAccount = null;
  labelBalance.textContent = '';
  labelWelcome.textContent = 'Log in to get started';
  labelSumIn.textContent = '';
  labelSumInterest.textContent = '';
  labelSumOut.textContent = '';
  containerApp.style.opacity = 0;
  inputClosePin.value = '';
  inputCloseUsername.value = '';
};
const calcDisplayInOut = function (account) {
  const inValue = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);
  labelSumIn.textContent = formatCurrency(
    inValue,
    account.locale,
    account.currency
  );
  const outValue = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);
  labelSumOut.textContent = formatCurrency(
    outValue,
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (account.interestRate / 100))
    .filter(int => {
      if (int > 1) return int;
    })
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};
/*
calcPrintBalance(account1.movements);
calcDisplayInOut(account1.movements);*/
let currentAccount;
//Event handler
///LOAAAAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      update(currentAccount);
    }, 500);
  }
  inputLoanAmount.value = '';
});
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value.toLowerCase() &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    accounts.splice(index, 1);

    resetValues();
  }
});
let currentTimer = null;
const startLogOutTimer = function () {
  //start log out timer 5mijnutes
  if (currentTimer !== null) {
    clearInterval(currentTimer);
    currentTimer = null;
  }
  let time = 300;

  //
  const timer = setInterval(function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const seconds = String(Math.trunc(time % 60)).padStart(2, 0);
    if (time > 0) {
      time--;
      labelTimer.textContent = `${min}:${seconds}`;
    } else {
      clearInterval(timer);
      currentAccount = null;
      currentTimer = null;
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
  }, 1000);

  return timer;
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value.toLowerCase()
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //DISPLAY UI AND WELCOME labelWelcome

    currentTimer = startLogOutTimer(currentAccount);

    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
    const d = new Date();
    /*
    const day = `${d.getDay()}`.padStart(2, 0);
    const min = `${d.getMinutes()}`.padStart(2, 0);
    const hour = `${d.getHours()}`.padStart(2, 0);
    const month = `${d.getMonth() + 1}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${d.getFullYear()}, ${hour}:${min}`;*/

    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
    containerApp.style.opacity = 1;
    /*
    //DISPLAY MOVEMENTS
    displayMovements(currentAccount.movements);
    //DISPLAY BALANCE
    calcPrintBalance(currentAccount);
    //DISPLAY SUMMARY
    calcDisplayInOut(currentAccount);*/
    update(currentAccount);

    //CLEAR
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
  }
});
const checkUserExists = function (username) {
  const aux = accounts.find(acc => acc.username === username);

  return aux;
};
///TRANSFER MONEY
const update = function (account) {
  currentTimer = startLogOutTimer(currentAccount);
  displayMovements(account);
  calcDisplayInOut(account);

  calcPrintBalance(account);
};
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const accountDest = checkUserExists(inputTransferTo.value.toLowerCase());
  if (
    typeof accountDest !== 'undefined' &&
    inputTransferAmount.value > 0 &&
    inputTransferAmount.value <= currentAccount.balance &&
    inputTransferTo.value !== currentAccount.username
  ) {
    currentAccount.movements.push(Number(inputTransferAmount.value) * -1);
    currentAccount.movementsDates.push(new Date().toISOString());
    accountDest.movements.push(Number(inputTransferAmount.value));
    accountDest.movementsDates.push(new Date().toISOString());
    update(currentAccount);
  }
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

//setTimeout(a => console.log(`aaa ${a}`), 5000, 'paerra');
//const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/*
setInterval(function () {
  const now = new Date();
  console.log(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
}, 1000);*/
/*
/////////////////////////////////////////////////
console.log(movements);
const eurToUSD = 1.1;

const movementsUSD = movements.map(mov => mov * eurToUSD);
console.log(movementsUSD);
*/

//const withdrawals = movements.filter(mov => mov < 0);

//accumulator is like snowball
/*
const balance = movements.reduce(
  (accumulator, current) => accumulator + current,
  0
);
console.log(balance);
*/
/*maximum value
const max = movements.reduce((acc, curr) => {
  if (acc > curr) return acc;
  else return curr;
}, movements[0]);
console.log(max);
*/
