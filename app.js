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
  const groupsContainer = document.getElementById('groupsContainer');
  const groupsHeading = document.getElementById('groupsHeading');
  const groupsSection = document.getElementById('groupsSection');
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
      allGenerated: 'All numbers in the range have been generated.',
      groups: 'Groups',
      group: 'Group'
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
      allGenerated: '범위의 모든 숫자를 생성했습니다.',
      groups: '그룹',
      group: '그룹'
    }
  };

  let currentLang = 'ko';
  let currentErrorKey = null;

  let allowRepeats = false;
  let generatedSet = new Set();
  let count = 0;
  let historyArr = [];
  let numberToGroup = {};
  let groupLists = [];

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

  function initializeGroups(min, max) {
    const total = max - min + 1;
    const groupCount = Math.ceil(total / 4);
    const nums = [];
    for (let n = min; n <= max; n++) nums.push(n);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    numberToGroup = {};
    groupLists = Array.from({ length: groupCount }, () => []);
    nums.forEach((num, idx) => {
      const g = idx % groupCount;
      numberToGroup[num] = g + 1;
    });
  }

  function renderResult(value, group) {
    if (group) {
      const t = translations[currentLang];
      resultDisplay.textContent = `${value} (${t.group} ${group})`;
    } else {
      resultDisplay.textContent = value;
    }
  }

  function renderHistory(value) {
    const li = document.createElement('li');
    li.textContent = value;
    historyList.prepend(li);
  }

  function renderGroups() {
    groupsContainer.innerHTML = '';
    const t = translations[currentLang];
    groupLists.forEach((nums, i) => {
      if (!nums.length) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'group';
      const h3 = document.createElement('h3');
      h3.textContent = `${t.group} ${i + 1}`;
      wrapper.appendChild(h3);
      const ul = document.createElement('ul');
      nums.forEach(n => {
        const li = document.createElement('li');
        li.textContent = n;
        ul.appendChild(li);
      });
      wrapper.appendChild(ul);
      groupsContainer.appendChild(wrapper);
    });
    groupsSection.style.display = groupsContainer.childElementCount ? 'block' : 'none';
  }

  function resetState() {
    minInput.value = '';
    maxInput.value = '';
    allowRepeats = false;
    repeatToggle.checked = false;
    generatedSet.clear();
    count = 0;
    historyList.innerHTML = '';
    historyArr = [];
    groupsContainer.innerHTML = '';
    numberToGroup = {};
    groupLists = [];
    groupsSection.style.display = 'none';
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
    if (count === 0 || !Object.keys(numberToGroup).length) {
      initializeGroups(min, max);
    }
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
    const group = numberToGroup[value];
    groupLists[group - 1].push(value);
    renderResult(value, group);
    renderHistory(value);
    historyArr.push(value);
    renderGroups();
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
    historyArr = [];
    groupsContainer.innerHTML = '';
    numberToGroup = {};
    groupLists = [];
    groupsSection.style.display = 'none';
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
    groupsHeading.textContent = t.groups;
    copyBtn.setAttribute('aria-label', t.copy);
    if (copyTooltip.textContent) copyTooltip.textContent = t.copied;
    const minVal = minInput.value || '—';
    const maxVal = maxInput.value || '—';
    updateStatus(minVal, maxVal, count);
    if (currentErrorKey) setError(currentErrorKey);
    if (historyArr.length) {
      const last = historyArr[historyArr.length - 1];
      renderResult(last, numberToGroup[last]);
    } else {
      renderResult('—');
    }
    renderGroups();
  }

  langKoBtn.addEventListener('click', () => switchLanguage('ko'));
  langEnBtn.addEventListener('click', () => switchLanguage('en'));

  repeatToggle.checked = false;
  switchLanguage('ko');
})();
