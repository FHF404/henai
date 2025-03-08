document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const recordsList = document.getElementById('recordsList');
  const emptyState = document.getElementById('emptyState');
  const recordButton = document.getElementById('recordButton');
  const clearButton = document.getElementById('clearButton');
  const clearModal = document.getElementById('clearModal');
  const confirmClear = document.getElementById('confirmClear');
  const cancelClear = document.getElementById('cancelClear');
  const languageSelect = document.getElementById('languageSelect');
  const milkAmountButtons = document.querySelectorAll('.milk-amount-button');
  
  // 记录计数
  let recordCount = 0;
  let selectedAmount = null;
  
  // 计量按钮点击事件
  milkAmountButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 移除其他按钮的选中状态
      milkAmountButtons.forEach(btn => btn.classList.remove('selected'));
      // 添加当前按钮的选中状态
      this.classList.add('selected');
      // 记录选中的计量值
      selectedAmount = this.getAttribute('data-amount');
    });
  });
  
  // 检查是否有记录并显示/隐藏空状态
  function checkEmptyState() {
    if (recordsList.children.length === 0) {
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
    }
  }
  
  // 从本地存储加载记录
  function loadRecords() {
    const savedRecords = localStorage.getItem('babyFeedingRecords');
    if (savedRecords) {
      recordsList.innerHTML = savedRecords;
      const items = recordsList.getElementsByClassName('record-item');
      recordCount = items.length;
    }
    checkEmptyState();
  }
  
  // 保存记录到本地存储
  function saveRecords() {
    localStorage.setItem('babyFeedingRecords', recordsList.innerHTML);
    checkEmptyState();
  }
  
  // 添加新记录
  function addNewRecord() {
    // 如果没有选择计量，则不添加记录
    if (!selectedAmount) {
      return;
    }
    
    console.log('添加新记录');
    recordCount++;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    const recordItem = document.createElement('div');
    recordItem.className = 'record-item';
    
    const recordInfo = document.createElement('div');
    recordInfo.className = 'record-info';
    
    const recordNumber = document.createElement('div');
    recordNumber.className = 'record-number';
    recordNumber.textContent = recordCount;
    
    const recordTime = document.createElement('div');
    recordTime.className = 'record-time';
    recordTime.textContent = timeString;
    
    recordInfo.appendChild(recordNumber);
    recordInfo.appendChild(recordTime);
    recordItem.appendChild(recordInfo);
    
    // 添加计量显示
    const milkAmount = document.createElement('div');
    milkAmount.className = 'milk-amount';
    milkAmount.textContent = `${selectedAmount}ml`;
    recordItem.appendChild(milkAmount);
    
    if (recordCount > 1 && recordsList.firstChild) {
      const prevTimeText = recordsList.firstChild.querySelector('.record-time').textContent;
      const [prevHours, prevMinutes, prevSeconds] = prevTimeText.split(':').map(Number);
      
      const prevDate = new Date();
      prevDate.setHours(prevHours, prevMinutes, prevSeconds);
      
      let timeDiff = now - prevDate;
      if (timeDiff < 0) {
        timeDiff += 24 * 60 * 60 * 1000;
      }
      
      const timeInterval = document.createElement('div');
      timeInterval.className = 'time-interval';
      timeInterval.setAttribute('data-time', timeDiff.toString());
      
      // 使用当前语言格式化时间间隔
      const currentLang = languageSelect.value;
      const text = languages[currentLang];
      
      const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
      const diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      let intervalText = text.interval;
      if (diffHours > 0) {
        intervalText += `${diffHours}${text.hour}${diffMinutes}${text.minute}`;
      } else if (diffMinutes > 0) {
        intervalText += `${diffMinutes}${text.minute}${diffSeconds}${text.second}`;
      } else {
        intervalText += `${diffSeconds}${text.second}`;
      }
      
      timeInterval.textContent = intervalText;
      recordItem.appendChild(timeInterval);
    }
    
    recordsList.insertBefore(recordItem, recordsList.firstChild);
    saveRecords();
    
    // 重置选中状态
    milkAmountButtons.forEach(btn => btn.classList.remove('selected'));
    selectedAmount = null;
  }
  
  // 添加事件监听器
  recordButton.onclick = addNewRecord;
  
  clearButton.onclick = function() {
    clearModal.style.display = 'flex';
  };
  
  confirmClear.onclick = function() {
    recordsList.innerHTML = '';
    recordCount = 0;
    clearModal.style.display = 'none';
    localStorage.removeItem('babyFeedingRecords');
    checkEmptyState();
  };
  
  cancelClear.onclick = function() {
    clearModal.style.display = 'none';
  };
  
  window.onclick = function(event) {
    if (event.target === clearModal) {
      clearModal.style.display = 'none';
    }
  };
  
  // 加载记录
  loadRecords();
  
  // 语言切换功能
  if (typeof languages !== 'undefined') {
    const appTitle = document.querySelector('.app-title');
    const emptyStateText = document.querySelector('.empty-state p');
    const modalTitle = document.querySelector('.modal-title');
    const modalText = document.querySelector('.modal-text');
    const confirmButton = document.getElementById('confirmClear');
    const cancelButton = document.getElementById('cancelClear');
    const clearButtonText = document.querySelector('.clear-button span');
    
    function setLanguage(lang) {
      if (!languages[lang]) return;
      
      const text = languages[lang];
      appTitle.textContent = text.title;
      clearButtonText.textContent = text.clear;
      emptyStateText.textContent = text.emptyStateText;
      modalTitle.textContent = text.modalTitle;
      modalText.textContent = text.modalText;
      confirmButton.textContent = text.confirm;
      cancelButton.textContent = text.cancel;
      
      // 更新所有时间间隔的显示
      updateAllIntervals(lang);
      
      localStorage.setItem('selectedLanguage', lang);
    }
    
    // 更新所有时间间隔显示
    function updateAllIntervals(lang) {
      const intervals = document.querySelectorAll('.time-interval');
      intervals.forEach(interval => {
        const timeText = interval.getAttribute('data-time');
        if (timeText) {
          const timeDiff = parseInt(timeText);
          const text = languages[lang];
          
          const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
          const diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          
          let intervalText = text.interval;
          if (diffHours > 0) {
            intervalText += `${diffHours}${text.hour}${diffMinutes}${text.minute}`;
          } else if (diffMinutes > 0) {
            intervalText += `${diffMinutes}${text.minute}${diffSeconds}${text.second}`;
          } else {
            intervalText += `${diffSeconds}${text.second}`;
          }
          
          interval.textContent = intervalText;
        }
      });
    }
    
    languageSelect.onchange = function() {
      setLanguage(this.value);
    };
    
    // 设置初始语言
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'zh';
    languageSelect.value = savedLanguage;
    setLanguage(savedLanguage);
  }
});