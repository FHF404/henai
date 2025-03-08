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
  const deleteRecordModal = document.getElementById('deleteRecordModal');
  const confirmDelete = document.getElementById('confirmDelete');
  const cancelDelete = document.getElementById('cancelDelete');
  
  // 滑动删除相关变量
  let currentRecordId = null;
  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50; // 滑动阈值，超过这个距离才触发
  
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
      
      // 为加载的记录添加事件监听
      Array.from(items).forEach(item => {
        item.addEventListener('touchstart', handleTouchStart);
        item.addEventListener('touchmove', handleTouchMove);
        item.addEventListener('touchend', handleTouchEnd);
        
        // 为删除按钮添加事件
        const deleteButton = item.querySelector('.delete-button');
        if (deleteButton) {
          deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(item.dataset.id);
          });
        }
      });
    }
    checkEmptyState();
  }
  
  // 保存记录到本地存储
  function saveRecords() {
    localStorage.setItem('babyFeedingRecords', recordsList.innerHTML);
    checkEmptyState();
  }
  // 触摸开始事件处理
  function handleTouchStart(e) {
    // 只允许最新的记录滑动删除
    const items = recordsList.getElementsByClassName('record-item');
    const isFirstRecord = e.currentTarget === items[0];
    if (!isFirstRecord) {
      return;
    }
    touchStartX = e.touches[0].clientX;
    
    // 重置其他已滑动的项
    document.querySelectorAll('.record-item.swiped').forEach(item => {
      if (item !== e.currentTarget) {
        item.classList.remove('swiped');
      }
    });
  }
  // 触摸移动事件处理
  function handleTouchMove(e) {
    // 只允许最新的记录滑动删除
    const items = recordsList.getElementsByClassName('record-item');
    const isFirstRecord = e.currentTarget === items[0];
    if (!isFirstRecord) {
      return;
    }
    touchEndX = e.touches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;
    
    // 限制最大滑动距离
    if (swipeDistance > 0 && swipeDistance <= 80) {
      e.currentTarget.style.transform = `translateX(-${swipeDistance}px)`;
    }
  }
  // 触摸结束事件处理
  function handleTouchEnd(e) {
    // 只允许最新的记录滑动删除
    const items = recordsList.getElementsByClassName('record-item');
    const isFirstRecord = e.currentTarget === items[0];
    if (!isFirstRecord) {
      return;
    }
    const swipeDistance = touchStartX - touchEndX;
    
    if (swipeDistance > swipeThreshold) {
      // 向左滑动，显示删除按钮
      e.currentTarget.style.transform = '';
      e.currentTarget.classList.add('swiped');
    } else {
      // 滑动距离不够，恢复原位
      e.currentTarget.style.transform = '';
      e.currentTarget.classList.remove('swiped');
    }
  }
  // 添加新记录 - 只保留一个完整的实现
  // 添加新记录函数中的修改
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
    recordItem.dataset.id = Date.now().toString(); // 添加唯一ID用于删除
    
    // 创建记录内容容器
    const recordContent = document.createElement('div');
    recordContent.className = 'record-content';
    
    const recordInfo = document.createElement('div');
    recordInfo.className = 'record-info';
    
    const recordNumber = document.createElement('div');
    recordNumber.className = 'record-number';
    recordNumber.textContent = recordCount;
    
    const recordTime = document.createElement('div');
    recordTime.className = 'record-time';
    recordTime.textContent = timeString;
    
    const milkAmount = document.createElement('div');
    milkAmount.className = 'milk-amount';
    milkAmount.textContent = `${selectedAmount}ml`;
    
    // 组装记录信息
    recordInfo.appendChild(recordNumber);
    recordInfo.appendChild(recordTime);
    recordInfo.appendChild(milkAmount);
    recordContent.appendChild(recordInfo);
    
    // 添加间隔时间显示
    if (recordsList.children.length > 0) {
      const prevRecord = recordsList.children[0];
      const prevTime = prevRecord.dataset.time ? parseInt(prevRecord.dataset.time) : 0;
      const currentTime = now.getTime();
      const timeDiff = currentTime - prevTime;
      
      const timeInterval = document.createElement('div');
      timeInterval.className = 'time-interval';
      timeInterval.setAttribute('data-time', timeDiff.toString());
      
      // 计算时间差
      const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
      const diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      const lang = languageSelect.value;
      const text = languages[lang];
      
      let intervalText = text.interval || '间隔: ';
      if (diffHours > 0) {
        intervalText += `${diffHours}${text.hour || '小时'}${diffMinutes}${text.minute || '分钟'}`;
      } else if (diffMinutes > 0) {
        intervalText += `${diffMinutes}${text.minute || '分钟'}${diffSeconds}${text.second || '秒'}`;
      } else {
        intervalText += `${diffSeconds}${text.second || '秒'}`;
      }
      
      timeInterval.textContent = intervalText;
      recordContent.appendChild(timeInterval);
    }
    
    // 记录当前时间戳
    recordItem.dataset.time = now.getTime().toString();
    
    const deleteButton = document.createElement('div');
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteConfirmation(recordItem.dataset.id);
    });
    // 将内容和删除按钮添加到记录项
    recordItem.appendChild(recordContent);
    recordItem.appendChild(deleteButton);
    
    // 添加触摸事件监听
    recordItem.addEventListener('touchstart', handleTouchStart);
    recordItem.addEventListener('touchmove', handleTouchMove);
    recordItem.addEventListener('touchend', handleTouchEnd);
    
    // 禁用所有旧记录的滑动删除
    document.querySelectorAll('.record-item').forEach(item => {
      item.classList.add('disabled');
    });
    
    // 添加新记录到列表最前面
    recordsList.insertBefore(recordItem, recordsList.firstChild);
    recordItem.classList.remove('disabled'); // 确保新记录可以滑动删除
    
    saveRecords();
    
    // 重置选中状态
    milkAmountButtons.forEach(btn => btn.classList.remove('selected'));
    selectedAmount = null;
    
    // 确保空状态隐藏
    checkEmptyState();
  }
  
  // 显示删除确认弹窗
  function showDeleteConfirmation(recordId) {
    currentRecordId = recordId;
    deleteRecordModal.style.display = 'flex';
  }
  
  // 删除单条记录
  function deleteRecord(recordId) {
    const recordToDelete = document.querySelector(`.record-item[data-id="${recordId}"]`);
    if (recordToDelete) {
      recordToDelete.remove();
      saveRecords();
      
      // 更新记录计数
      const items = recordsList.getElementsByClassName('record-item');
      recordCount = items.length;
      
      // 更新记录编号
      Array.from(items).forEach((item, index) => {
        const numberElement = item.querySelector('.record-number');
        if (numberElement) {
          numberElement.textContent = recordCount - index;
        }
      });
      
      // 如果还有记录，确保第一条记录可以滑动删除
      if (items.length > 0) {
        items[0].classList.remove('disabled');
      }
    }
  }
  
  // 添加事件监听器
  recordButton.onclick = addNewRecord;
  
  // 其余代码保持不变
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
  
  // 删除确认弹窗事件
  confirmDelete.onclick = function() {
    if (currentRecordId) {
      deleteRecord(currentRecordId);
      currentRecordId = null;
    }
    deleteRecordModal.style.display = 'none';
  };
  
  cancelDelete.onclick = function() {
    currentRecordId = null;
    deleteRecordModal.style.display = 'none';
  };
  
  window.onclick = function(event) {
    if (event.target === clearModal) {
      clearModal.style.display = 'none';
    }
    if (event.target === deleteRecordModal) {
      deleteRecordModal.style.display = 'none';
    }
    
    // 点击页面其他区域关闭已滑动的项
    if (!event.target.closest('.record-item')) {
      document.querySelectorAll('.record-item.swiped').forEach(item => {
        item.classList.remove('swiped');
      });
    }
  };
  
  // 加载记录
  loadRecords();
  
  // 语言切换功能保持不变
  if (typeof languages !== 'undefined') {
    const appTitle = document.querySelector('.app-title');
    const emptyStateText = document.querySelector('.empty-state p');
    const modalTitle = document.querySelector('.modal-title');
    const modalText = document.querySelector('.modal-text');
    const confirmButton = document.getElementById('confirmClear');
    const cancelButton = document.getElementById('cancelClear');
    const clearButtonText = document.querySelector('.clear-button span');
    const deleteModalTitle = document.querySelector('#deleteRecordModal .modal-title');
    const deleteModalText = document.querySelector('#deleteRecordModal .modal-text');
    
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
      
      // 更新删除弹窗文本
      if (text.deleteTitle) deleteModalTitle.textContent = text.deleteTitle;
      if (text.deleteText) deleteModalText.textContent = text.deleteText;
      if (text.confirm) confirmDelete.textContent = text.confirm;
      if (text.cancel) cancelDelete.textContent = text.cancel;
      
      // 删除这段代码，不再更新删除按钮文本
      // document.querySelectorAll('.delete-button').forEach(button => {
      //   button.textContent = text.delete || '删除';
      // });
      
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