const current = document.querySelector('#current');
const previous = document.querySelector('#previous');
const keys = document.querySelector('.keys');
const themeButton = document.querySelector('#themeButton');

let value = '0';
let firstValue = null;
let operator = null;
let waitingForNextValue = false;

const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function format(number) {
  if (number === 'Error') return number;
  const [integer, decimal] = number.split('.');
  return `${Number(integer).toLocaleString('en-US')}${decimal !== undefined ? `.${decimal}` : ''}`;
}

function update() {
  current.textContent = format(value);
  previous.textContent = operator && firstValue !== null ? `${format(String(firstValue))} ${symbols[operator]}` : '';
}

function inputNumber(number) {
  if (value === 'Error' || waitingForNextValue) { value = number; waitingForNextValue = false; }
  else if (value === '0') value = number;
  else if (value.replace('.', '').length < 14) value += number;
}

function calculate(a, b, operation) {
  if (operation === '+') return a + b;
  if (operation === '-') return a - b;
  if (operation === '*') return a * b;
  if (operation === '/') return b === 0 ? 'Error' : a / b;
}

function chooseOperator(nextOperator) {
  if (value === 'Error') return;
  const inputValue = Number(value);
  if (operator && waitingForNextValue) { operator = nextOperator; return; }
  if (firstValue === null) firstValue = inputValue;
  else if (operator) {
    const result = calculate(firstValue, inputValue, operator);
    value = result === 'Error' ? result : String(Number(result.toFixed(10)));
    firstValue = result === 'Error' ? null : Number(value);
  }
  operator = nextOperator;
  waitingForNextValue = true;
}

function equals() {
  if (!operator || firstValue === null || waitingForNextValue) return;
  const result = calculate(firstValue, Number(value), operator);
  value = result === 'Error' ? result : String(Number(result.toFixed(10)));
  firstValue = null; operator = null; waitingForNextValue = true;
}

function action(name) {
  if (name === 'clear') { value = '0'; firstValue = null; operator = null; waitingForNextValue = false; }
  if (name === 'delete' && !waitingForNextValue) value = value.length > 1 ? value.slice(0, -1) : '0';
  if (name === 'decimal' && !value.includes('.') && !waitingForNextValue) value += '.';
  if (name === 'decimal' && waitingForNextValue) { value = '0.'; waitingForNextValue = false; }
  if (name === 'percent' && value !== 'Error') value = String(Number(value) / 100);
  if (name === 'equals') equals();
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  if (button.dataset.operator) chooseOperator(button.dataset.operator);
  if (button.dataset.action) action(button.dataset.action);
  update();
});

document.addEventListener('keydown', (event) => {
  if (/^\d$/.test(event.key)) inputNumber(event.key);
  else if ('+-*/'.includes(event.key)) chooseOperator(event.key);
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); equals(); }
  else if (event.key === 'Escape') action('clear');
  else if (event.key === 'Backspace') action('delete');
  else if (event.key === '.') action('decimal');
  else return;
  update();
});

themeButton.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeButton.textContent = isLight ? '☾' : '☼';
  themeButton.setAttribute('aria-label', isLight ? 'Toggle dark theme' : 'Toggle light theme');
});

update();
