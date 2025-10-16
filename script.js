const display = document.getElementById('display');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const historyBtn = document.getElementById('history-btn');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const memoryIndicator = document.getElementById('memory-indicator');

let currentInput = '';
let operator = '';
let previousInput = '';
let memory = 0;
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let isDegrees = true; // true for degrees, false for radians

function updateDisplay() {
  display.value = currentInput || '0';
  updateMemoryIndicator();
}

function updateMemoryIndicator() {
  memoryIndicator.textContent = memory !== 0 ? `M: ${memory}` : '';
}

function clear() {
  currentInput = '';
  operator = '';
  previousInput = '';
  updateDisplay();
}

function backspace() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

function appendNumber(number) {
  if (currentInput === '0' || currentInput === '') {
    currentInput = number;
  } else {
    currentInput += number;
  }
  updateDisplay();
}

function appendDecimal() {
  if (!currentInput.includes('.')) {
    currentInput += '.';
    updateDisplay();
  }
}

function setOperator(op) {
  if (currentInput !== '') {
    if (previousInput !== '') {
      calculate();
    }
    operator = op;
    previousInput = currentInput;
    currentInput = '';
  }
}

function calculate() {
  let result;
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);

  if (isNaN(prev) || isNaN(current)) return;

  switch (operator) {
    case '+':
      result = prev + current;
      break;
    case '-':
      result = prev - current;
      break;
    case '*':
      result = prev * current;
      break;
    case '/':
      result = prev / current;
      break;
    case '^':
      result = Math.pow(prev, current);
      break;
    case '%':
      result = prev % current;
      break;
    default:
      return;
  }

  addToHistory(`${previousInput} ${operator} ${currentInput} = ${result}`);
  currentInput = result.toString();
  operator = '';
  previousInput = '';
  updateDisplay();
}

function calculateScientific(func) {
  const value = parseFloat(currentInput);
  if (isNaN(value)) return;

  let result;
  switch (func) {
    case 'sin':
      result = Math.sin(isDegrees ? value * Math.PI / 180 : value);
      break;
    case 'cos':
      result = Math.cos(isDegrees ? value * Math.PI / 180 : value);
      break;
    case 'tan':
      result = Math.tan(isDegrees ? value * Math.PI / 180 : value);
      break;
    case 'log':
      result = Math.log10(value);
      break;
    case 'ln':
      result = Math.log(value);
      break;
    case 'exp':
      result = Math.exp(value);
      break;
    case 'sqrt':
      result = Math.sqrt(value);
      break;
    case 'factorial':
      result = factorial(value);
      break;
    default:
      return;
  }

  addToHistory(`${func}(${currentInput}) = ${result}`);
  currentInput = result.toString();
  updateDisplay();
}

function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

function memoryOperation(op) {
  const value = parseFloat(currentInput);
  if (isNaN(value)) return;

  switch (op) {
    case 'M+':
      memory += value;
      break;
    case 'M-':
      memory -= value;
      break;
    case 'MR':
      currentInput = memory.toString();
      break;
    case 'MC':
      memory = 0;
      break;
  }
  updateDisplay();
}

function addConstant(constant) {
  switch (constant) {
    case 'π':
      currentInput += Math.PI.toString();
      break;
    case 'e':
      currentInput += Math.E.toString();
      break;
  }
  updateDisplay();
}

function convertDegRad() {
  const value = parseFloat(currentInput);
  if (isNaN(value)) return;

  if (isDegrees) {
    currentInput = (value * Math.PI / 180).toString();
  } else {
    currentInput = (value * 180 / Math.PI).toString();
  }
  isDegrees = !isDegrees;
  updateDisplay();
}

function addToHistory(entry) {
  history.unshift(entry);
  if (history.length > 50) history.pop();
  localStorage.setItem('calcHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  historyList.innerHTML = '';
  history.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = entry;
    li.addEventListener('click', () => {
      const parts = entry.split(' = ');
      if (parts.length === 2) {
        currentInput = parts[1];
        updateDisplay();
      }
    });
    historyList.appendChild(li);
  });
  document.getElementById('clear-history').style.display = history.length > 0 ? 'block' : 'none';
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}



function toggleHistory() {
  historyPanel.style.display = historyPanel.style.display === 'none' ? 'block' : 'none';
}

// Event listeners
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent;
    const id = button.id;

    if (button.classList.contains('number')) {
      appendNumber(value);
    } else if (button.classList.contains('operator')) {
      setOperator(value);
    } else if (button.classList.contains('equals')) {
      calculate();
    } else if (button.classList.contains('clear')) {
      clear();
    } else if (button.classList.contains('backspace')) {
      backspace();
    } else if (value === '.') {
      appendDecimal();
    } else if (button.classList.contains('function')) {
      calculateScientific(id);
    } else if (button.classList.contains('memory')) {
      memoryOperation(value);
    } else if (button.classList.contains('constant')) {
      addConstant(value);
    } else if (button.classList.contains('convert')) {
      convertDegRad();
    }
  });
});

themeToggleBtn.addEventListener('click', toggleTheme);
historyBtn.addEventListener('click', toggleHistory);
clearHistoryBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem('calcHistory');
  updateHistoryDisplay();
});

// Keyboard support
document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (key >= '0' && key <= '9') {
    appendNumber(key);
  } else if (key === '.') {
    appendDecimal();
  } else if (['+', '-', '*', '/', '^', '%'].includes(key)) {
    setOperator(key);
  } else if (key === 'Enter' || key === '=') {
    calculate();
  } else if (key === 'Escape' || key === 'c' || key === 'C') {
    clear();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key === 'Delete') {
    memoryOperation('MC');
  }
});

// Initialize
updateDisplay();
updateHistoryDisplay();
