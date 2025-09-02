(() => {
  const minInput = document.getElementById('min');
  const maxInput = document.getElementById('max');
  const generateBtn = document.getElementById('generate');
  const resetBtn = document.getElementById('reset');
  const repeatToggle = document.getElementById('repeatToggle');
  const resultDisplay = document.getElementById('result');
  const statusLine = document.getElementById('status');
  const historyList = document.getElementById('history');
  const errorBox = document.getElementById('error');

  let allowRepeats = true;
  let generatedSet = new Set();
  let count = 0;

  function setError(msg) {
    errorBox.textContent = msg;
  }

  function clearError() {
    errorBox.textContent = '';
  }

  function getRange() {
    const min = parseInt(minInput.value, 10);
    const max = parseInt(maxInput.value, 10);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      setError('Please enter both minimum and maximum numbers.');
      return null;
    }
    if (min > max) {
      minInput.value = max;
      maxInput.value = min;
      return { min: max, max: min };
    }
    return { min, max };
  }

  function updateStatus(min, max, countVal) {
    statusLine.textContent = `Range: ${min}–${max} • Generated: ${countVal}`;
  }

  function renderResult(value) {
    resultDisplay.textContent = value;
  }

  function renderHistory(value) {
    const li = document.createElement('li');
    li.textContent = value;
    historyList.prepend(li);
  }

  function resetState() {
    minInput.value = '';
    maxInput.value = '';
    allowRepeats = true;
    repeatToggle.checked = true;
    generatedSet.clear();
    count = 0;
    historyList.innerHTML = '';
    renderResult('—');
    clearError();
    generateBtn.disabled = false;
    updateStatus('—', '—', 0);
  }

  function generateNumber() {
    clearError();
    const range = getRange();
    if (!range) return;
    const { min, max } = range;
    let value;
    const total = max - min + 1;
    if (!allowRepeats) {
      if (generatedSet.size === total) {
        setError('All numbers in the range have been generated.');
        generateBtn.disabled = true;
        return;
      }
      do {
        value = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (generatedSet.has(value));
      generatedSet.add(value);
    } else {
      value = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    count++;
    renderResult(value);
    renderHistory(value);
    updateStatus(min, max, count);
  }

  generateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateNumber();
  });

  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetState();
  });

  repeatToggle.addEventListener('change', () => {
    allowRepeats = repeatToggle.checked;
  });

  updateStatus('—', '—', 0);
  renderResult('—');
})();
