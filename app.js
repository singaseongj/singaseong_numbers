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
  const titleEl = document.querySelector('h1');
  const minLabel = document.querySelector('label[for="min"]');
  const maxLabel = document.querySelector('label[for="max"]');
  const repeatText = document.querySelector('.switch-text');
  const historyHeading = document.querySelector('.history h2');
  const copyBtn = document.getElementById('copyHistory');
  const copyTooltip = document.getElementById('copyTooltip');
  const langKoBtn = document.getElementById('lang-ko');
  const langEnBtn = document.getElementById('lang-en');
  const eraseBtn = document.getElementById('erase');

  const translations = {
    en: {
      title: 'Singaseong Numbers',
      min: 'Minimum',
      max: 'Maximum',
      allowRepeats: 'Allow repeats',
      generate: 'Generate',
      reset: 'Reset',
      erase: 'Erase',
      range: 'Range',
      generated: 'Generated',
      history: 'History',
      copy: 'Copy',
      copied: 'Copied to clipboard',
      enterRange: 'Please enter both minimum and maximum numbers.',
      allGenerated: 'All numbers in the range have been generated.'
    },
    ko: {
      title: '신가성의 숫자들',
      min: '최소',
      max: '최대',
      allowRepeats: '반복 허용',
      generate: '생성',
      reset: '초기화',
      erase: '지우기',
      range: '범위',
      generated: '만든 숫자',
      history: '히스토리',
      copy: '복사',
      copied: '클립보드에 복사완료',
      enterRange: '최소와 최대 값을 입력하세요.',
      allGenerated: '범위의 모든 숫자를 생성했습니다.'
    }
  };

  let currentLang = 'ko';
  let currentErrorKey = null;

  let allowRepeats = false;
  let generatedSet = new Set();
  let count = 0;

  function setError(key) {
    currentErrorKey = key;
    errorBox.textContent = key ? translations[currentLang][key] : '';
  }

  function clearError() {
    setError(null);
  }

  function getRange() {
    const min = parseInt(minInput.value, 10);
    const max = parseInt(maxInput.value, 10);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      setError('enterRange');
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
    const t = translations[currentLang];
    statusLine.textContent = `${t.range}: ${min}–${max} • ${t.generated}: ${countVal}`;
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
    allowRepeats = false;
    repeatToggle.checked = false;
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
        setError('allGenerated');
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

  eraseBtn.addEventListener('click', () => {
    generatedSet.clear();
    count = 0;
    historyList.innerHTML = '';
    renderResult('—');
    clearError();
    generateBtn.disabled = false;
    const minVal = minInput.value || '—';
    const maxVal = maxInput.value || '—';
    updateStatus(minVal, maxVal, 0);
  });

  copyBtn.addEventListener('click', () => {
    const items = Array.from(historyList.children).map(li => li.textContent);
    if (!items.length) return;
    navigator.clipboard.writeText(items.join(' ')).then(() => {
      copyTooltip.textContent = translations[currentLang].copied;
      copyTooltip.classList.add('show');
      setTimeout(() => {
        copyTooltip.classList.remove('show');
      }, 1500);
    });
  });

  function switchLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.title = t.title;
    titleEl.textContent = t.title;
    minLabel.textContent = t.min;
    maxLabel.textContent = t.max;
    repeatText.textContent = t.allowRepeats;
    generateBtn.textContent = t.generate;
    resetBtn.textContent = t.reset;
    eraseBtn.textContent = t.erase;
    historyHeading.textContent = t.history;
    copyBtn.setAttribute('aria-label', t.copy);
    if (copyTooltip.textContent) copyTooltip.textContent = t.copied;
    const minVal = minInput.value || '—';
    const maxVal = maxInput.value || '—';
    updateStatus(minVal, maxVal, count);
    if (currentErrorKey) setError(currentErrorKey);
  }

  langKoBtn.addEventListener('click', () => switchLanguage('ko'));
  langEnBtn.addEventListener('click', () => switchLanguage('en'));

  repeatToggle.checked = false;
  switchLanguage('ko');
  renderResult('—');
})();
