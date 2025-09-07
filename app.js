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
  const groupsSection = document.getElementById('groupsSection');
  const groupsHeading = document.getElementById('groupsHeading');
  const generateAllBtn = document.getElementById('generateAll');
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
  const gsizeMinInput = document.getElementById('gsizeMin');
  const gsizeMaxInput = document.getElementById('gsizeMax');
  const countdownEl = document.getElementById('countdown');

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
      groups: 'Minimum group members',
      group: 'Group',
      generateAll: 'Generate All'
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
      groups: '그룹 내 인원',
      group: '그룹',
      generateAll: '모두 생성'
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
  // Predetermined draw order so Generate / Generate All share the same "future"
  let drawQueue = [];
  let drawIndex = 0;
  // Predetermined value→group pairs (the actual "deal" we peel from)
  let deals = [];
  let dealIndex = 0;

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

  function getGroupSizeRange() {
    let sMin = parseInt(gsizeMinInput?.value, 10);
    let sMax = parseInt(gsizeMaxInput?.value, 10);
    if (!Number.isFinite(sMin) || sMin < 1) sMin = 1;
    if (!Number.isFinite(sMax) || sMax < 1) sMax = sMin;
    if (sMin > sMax) [sMin, sMax] = [sMax, sMin];
    return { sMin, sMax };
  }

  function updateGroupsVisibility() {
    groupsSection.style.display = repeatToggle.checked ? 'none' : 'block';
  }

  function updateStatus(min, max, countVal) {
    const t = translations[currentLang];
    statusLine.textContent = `${t.range}: ${min}–${max} • ${t.generated}: ${countVal}`;
  }

  function initializeGroups(min, max) {
    const total = max - min + 1;
    const nums = [];
    for (let n = min; n <= max; n++) nums.push(n);

    // (1) Predetermine DRAW ORDER (shared future for single/all generate)
    const draw = nums.slice();
    for (let i = draw.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [draw[i], draw[j]] = [draw[j], draw[i]];
    }
    drawQueue = draw;
    drawIndex = 0;
    deals = [];
    dealIndex = 0;

    // (2) Compute group sizes within [sMin, sMax] (same policy as before)
    const { sMin, sMax } = getGroupSizeRange();
    const gCountMin = Math.ceil(total / sMax);
    const gCountMax = Math.floor(total / sMin);

    let groupCount = 0;
    let groupSizes = [];
    if (gCountMin <= gCountMax) {
      for (let g = gCountMax; g >= gCountMin; g--) {
        const extra = total - sMin * g;
        const capacity = g * (sMax - sMin);
        if (extra >= 0 && extra <= capacity) {
          groupCount = g;
          groupSizes = Array(g).fill(sMin);
          let e = extra;
          while (e > 0) {
            for (let i = 0; i < groupSizes.length && e > 0; i++) {
              if (groupSizes[i] < sMax) { groupSizes[i] += 1; e--; }
            }
          }
          break;
        }
      }
    }
    if (!groupCount) {
      groupCount = Math.max(1, Math.ceil(total / sMin));
      groupSizes = Array(groupCount).fill(Math.floor(total / groupCount));
      let remainder = total % groupCount;
      for (let i = 0; i < remainder; i++) groupSizes[i]++;
    }

    // (3) Independent GROUP ASSIGNMENT: shuffle again and chunk by groupSizes
    const assignOrder = nums.slice();
    for (let i = assignOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [assignOrder[i], assignOrder[j]] = [assignOrder[j], assignOrder[i]];
    }
    numberToGroup = {};
    groupLists = Array.from({ length: groupCount }, () => []);
    let idx = 0;
    for (let g = 0; g < groupCount; g++) {
      const size = groupSizes[g];
      for (let k = 0; k < size; k++, idx++) {
        numberToGroup[assignOrder[idx]] = g + 1; // 1-based
      }
    }

    // (4) Pair draw order with preassigned groups
    deals = drawQueue.map((value) => ({ value, group: numberToGroup[value] }));
  }

  function renderResult(value, group) {
    if (group) {
      resultDisplay.innerHTML = `${value} <span class="group-number">(${group})</span>`;
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
  }

  function resetState() {
    minInput.value = '';
    maxInput.value = '';
    gsizeMinInput.value = 4;
    gsizeMaxInput.value = 5;
    allowRepeats = false;
    repeatToggle.checked = false;
    updateGroupsVisibility();
    generatedSet.clear();
    count = 0;
    historyList.innerHTML = '';
    historyArr = [];
    groupsContainer.innerHTML = '';
    numberToGroup = {};
    groupLists = [];
    drawQueue = [];
    drawIndex = 0;
    deals = [];
    dealIndex = 0;
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
      if (dealIndex >= deals.length) {
        setError('allGenerated');
        generateBtn.disabled = true;
        return;
      }
      const pair = deals[dealIndex++];
      value = pair.value;
      generatedSet.add(value);
    } else {
      // repeats allowed: still random
      value = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    count++;
    const group = numberToGroup[value]; // same as deals[dealIndex-1].group
    groupLists[group - 1].push(value);
    renderResult(value, group);
    renderHistory(value);
    historyArr.push(value);
    renderGroups();
    updateStatus(min, max, count);
  }

  function generateAllNumbers() {
    clearError();
    allowRepeats = false;
    repeatToggle.checked = false;
    updateGroupsVisibility();
    const range = getRange();
    if (!range) return;
    const { min, max } = range;
    if (count === 0 || !Object.keys(numberToGroup).length) {
      initializeGroups(min, max);
    }
    // Use the predetermined deal to take all remaining (unique) pairs
    const remainingPairs = deals.slice(dealIndex);
    if (!remainingPairs.length) {
      setError('allGenerated');
      generateBtn.disabled = true;
      return;
    }
    let last;
    remainingPairs.forEach(({ value, group }) => {
      generatedSet.add(value);
      count++;
      groupLists[group - 1].push(value);
      renderHistory(value);
      historyArr.push(value);
      last = value;
    });
    dealIndex = deals.length;
    renderResult(last, numberToGroup[last]); // same as remainingPairs.at(-1).group
    renderGroups();
    updateStatus(min, max, count);
    generateBtn.disabled = true;
  }

  function runCountdown(callback) {
    let num = 5;
    const tick = () => {
      countdownEl.textContent = num;
      countdownEl.classList.add('show');
      setTimeout(() => {
        countdownEl.classList.remove('show');
        setTimeout(() => {
          num--;
          if (num > 0) {
            tick();
          } else {
            countdownEl.textContent = '';
            if (callback) callback();
          }
        }, 500);
      }, 500);
    };
    tick();
  }

  generateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateNumber();
  });

  generateAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    generateAllBtn.disabled = true;
    runCountdown(() => {
      generateAllNumbers();
      generateAllBtn.disabled = false;
    });
  });

  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetState();
  });

  repeatToggle.addEventListener('change', () => {
    allowRepeats = repeatToggle.checked;
    updateGroupsVisibility();
  });

  eraseBtn.addEventListener('click', () => {
    generatedSet.clear();
    count = 0;
    historyList.innerHTML = '';
    historyArr = [];
    groupsContainer.innerHTML = '';
    numberToGroup = {};
    groupLists = [];
    drawQueue = [];
    drawIndex = 0;
    deals = [];
    dealIndex = 0;
    allowRepeats = false;
    repeatToggle.checked = false;
    updateGroupsVisibility();
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
    generateAllBtn.textContent = t.generateAll;
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

  langKoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchLanguage('ko');
  });
  langEnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchLanguage('en');
  });

  gsizeMinInput.value = 4;
  gsizeMaxInput.value = 5;
  repeatToggle.checked = false;
  updateGroupsVisibility();
  switchLanguage('ko');
})();
