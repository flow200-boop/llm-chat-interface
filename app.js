/**
 * Antigravity Chat Interface - Application Logic Core
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. Application State & Storage Sync
  // ==========================================================================

  let state = {
    conversations: [],
    activeChatId: null,
    isGenerating: false,
    generationTimer: null,
    activeModel: 'pro',
    settings: {
      theme: 'midnight',
      systemPrompt: '',
      speed: 2 // 1: Slow, 2: Normal, 3: Fast, 4: Instant
    },
    attachedFile: null
  };

  // Load from LocalStorage on start
  function loadStateFromStorage() {
    const savedConvs = localStorage.getItem('antigravity_chats');
    if (savedConvs) {
      try {
        state.conversations = JSON.parse(savedConvs);
      } catch (e) {
        state.conversations = [];
      }
    }

    const savedSettings = localStorage.getItem('antigravity_settings');
    if (savedSettings) {
      try {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
      } catch (e) {
        // use defaults
      }
    }

    // Set model based on last saved active chat or Pro default
    const lastActiveId = localStorage.getItem('antigravity_active_chat');
    if (lastActiveId && state.conversations.some(c => c.id === lastActiveId)) {
      state.activeChatId = lastActiveId;
      const activeChat = state.conversations.find(c => c.id === lastActiveId);
      state.activeModel = activeChat.model || 'pro';
    } else if (state.conversations.length > 0) {
      state.activeChatId = state.conversations[0].id;
      state.activeModel = state.conversations[0].model || 'pro';
    } else {
      state.activeChatId = null;
      state.activeModel = 'pro';
    }

    // Apply Saved Theme
    applyTheme(state.settings.theme);
  }

  function saveStateToStorage() {
    localStorage.setItem('antigravity_chats', JSON.stringify(state.conversations));
    if (state.activeChatId) {
      localStorage.setItem('antigravity_active_chat', state.activeChatId);
    } else {
      localStorage.removeItem('antigravity_active_chat');
    }
    localStorage.setItem('antigravity_settings', JSON.stringify(state.settings));
  }

  // ==========================================================================
  // 2. DOM Selection
  // ==========================================================================

  // Sidebar elements
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarOpenBtn = document.getElementById('sidebar-open-btn');
  const newChatBtn = document.getElementById('new-chat-btn');
  const historyList = document.getElementById('history-list');
  const settingsTriggerBtn = document.getElementById('settings-trigger-btn');

  // Header and Model Selector
  const modelSelectBtn = document.getElementById('model-select-btn');
  const modelDropdownMenu = document.getElementById('model-dropdown-menu');
  const activeModelName = document.getElementById('active-model-name');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const exportTriggerBtn = document.getElementById('export-trigger-btn');

  // Main Chat feed elements
  const chatContent = document.getElementById('chat-content');
  const welcomeScreen = document.getElementById('welcome-screen');
  const messagesFeed = document.getElementById('messages-feed');
  const scrollBottomBtn = document.getElementById('scroll-bottom-btn');

  // Inputs
  const chatForm = document.getElementById('chat-form');
  const chatTextarea = document.getElementById('chat-textarea');
  const sendBtn = document.getElementById('send-btn');
  const webSearchToggle = document.getElementById('web-search-toggle');
  const voiceInputBtn = document.getElementById('voice-input-btn');
  const attachBtn = document.getElementById('attach-btn');
  const fileInput = document.getElementById('file-input');
  const attachmentPreview = document.getElementById('attachment-preview');
  const attachmentFilename = document.getElementById('attachment-filename');
  const removeAttachmentBtn = document.getElementById('remove-attachment-btn');

  // Modals & Settings Inputs
  const settingsModal = document.getElementById('settings-modal');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingsSaveBtn = document.getElementById('settings-save-btn');
  const settingsResetBtn = document.getElementById('settings-reset-btn');
  const systemPromptTextarea = document.getElementById('system-prompt-textarea');
  const speedSlider = document.getElementById('speed-slider');
  const speedValueDisplay = document.getElementById('speed-value-display');
  const themeCards = document.querySelectorAll('.theme-card');

  // Export Modal
  const exportModal = document.getElementById('export-modal');
  const exportCloseBtn = document.getElementById('export-close-btn');
  const exportMarkdownBtn = document.getElementById('export-markdown-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');

  // Toast
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  // ==========================================================================
  // 3. UI Helpers: Sidebar Toggle, Auto-textarea, Toast, Scroll-lock
  // ==========================================================================

  // Sidebar Toggles
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    sidebarOpenBtn.classList.remove('hidden');
  });

  sidebarOpenBtn.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    sidebarOpenBtn.classList.add('hidden');
  });

  // Auto-grow textarea height
  function resizeTextarea() {
    chatTextarea.style.height = 'auto';
    chatTextarea.style.height = Math.min(chatTextarea.scrollHeight, 200) + 'px';
  }
  
  chatTextarea.addEventListener('input', () => {
    resizeTextarea();
    // Enable/disable send button
    sendBtn.disabled = chatTextarea.value.trim().length === 0 && !state.attachedFile;
  });

  // Send input with Enter (but support Shift+Enter for new lines)
  chatTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        chatForm.requestSubmit();
      }
    }
  });

  // Floating Toast Alert
  function showToast(message, isSuccess = true) {
    toastMessage.textContent = message;
    toastNotification.classList.remove('hidden');
    
    // Customize icon color depending on success or not
    if (!isSuccess) {
      toastNotification.style.backgroundColor = '#ef4444';
    } else {
      toastNotification.style.backgroundColor = '#10b981';
    }

    setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2800);
  }

  // Scroll to bottom control
  function scrollToBottom(behavior = 'smooth') {
    chatContent.scrollTo({
      top: chatContent.scrollHeight,
      behavior: behavior
    });
  }

  // Monitor scrolling to hide/show "Scroll to bottom" button
  chatContent.addEventListener('scroll', () => {
    const threshold = 180;
    const isScrollUp = chatContent.scrollHeight - chatContent.clientHeight - chatContent.scrollTop > threshold;
    if (isScrollUp) {
      scrollBottomBtn.classList.remove('hidden');
    } else {
      scrollBottomBtn.classList.add('hidden');
    }
  });

  scrollBottomBtn.addEventListener('click', () => scrollToBottom('smooth'));

  // ==========================================================================
  // 4. Custom Markdown & Code Syntax Parser
  // ==========================================================================

  function renderMarkdown(text) {
    if (!text) return '';

    // Step A: Capture code blocks to protect them from regular formatting replacements
    const codeBlocks = [];
    let parsedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const index = codeBlocks.length;
      const cleanLang = lang || 'text';
      
      // Clean HTML escapes inside the protected code block
      const cleanCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const codeBlockHTML = `
        <div class="code-block-container">
          <div class="code-block-header">
            <span class="code-lang-label">${cleanLang}</span>
            <button type="button" class="copy-code-btn" data-index="${index}">
              <svg class="icon" style="width:14px;height:14px;"><use href="#icon-copy"/></svg>
              <span>Copy code</span>
            </button>
          </div>
          <pre><code class="language-${cleanLang}">${cleanCode}</code></pre>
        </div>
      `;
      
      // Store the raw unescaped code for the Copy button clipboard action
      codeBlocks.push({
        rawCode: code,
        html: codeBlockHTML
      });
      
      return `__PROTECTED_CODE_BLOCK_${index}__`;
    });

    // Step B: General text escapes (safe from script injection)
    parsedText = parsedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Restores code tokens back before parsing inline HTML elements
    // We replace it temporarily with place markers, then restore it at the very end.

    // Step C: Line-by-line block processing (Lists, Headings, Tables)
    const lines = parsedText.split('\n');
    let inList = false;
    let listType = null; // 'ul' | 'ol'
    let tableBuffer = [];
    let inTable = false;
    
    const formattedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Handle Markdown Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        continue;
      } else if (inTable && (!line.trim().startsWith('|') || i === lines.length - 1)) {
        // Table block finished, compile it
        if (i === lines.length - 1 && line.trim().startsWith('|')) {
          tableBuffer.push(line);
        }
        
        formattedLines.push(parseMarkdownTable(tableBuffer));
        tableBuffer = [];
        inTable = false;
        if (!line.trim().startsWith('|')) {
          // Process current line since it's not part of the table
        } else {
          continue;
        }
      }

      // Handle lists
      const ulMatch = line.match(/^[\*\+\-]\s+(.*)/);
      const olMatch = line.match(/^(\d+)\.\s+(.*)/);

      if (ulMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) formattedLines.push(`</${listType}>`);
          formattedLines.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        formattedLines.push(`<li>${parseInlineMarkdown(ulMatch[1])}</li>`);
        continue;
      } else if (olMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) formattedLines.push(`</${listType}>`);
          formattedLines.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        formattedLines.push(`<li>${parseInlineMarkdown(olMatch[2])}</li>`);
        continue;
      } else {
        if (inList) {
          formattedLines.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
      }

      // Handle Headings
      const h3Match = line.match(/^###\s+(.*)/);
      const h2Match = line.match(/^##\s+(.*)/);
      const h1Match = line.match(/^#\s+(.*)/);

      if (h3Match) {
        formattedLines.push(`<h3>${parseInlineMarkdown(h3Match[1])}</h3>`);
      } else if (h2Match) {
        formattedLines.push(`<h2>${parseInlineMarkdown(h2Match[1])}</h2>`);
      } else if (h1Match) {
        formattedLines.push(`<h1>${parseInlineMarkdown(h1Match[1])}</h1>`);
      } else if (line.trim().startsWith('&gt;')) {
        // Blockquotes
        const quoteText = line.replace(/^&gt;\s?/, '');
        formattedLines.push(`<blockquote>${parseInlineMarkdown(quoteText)}</blockquote>`);
      } else if (line.trim().startsWith('__PROTECTED_CODE_BLOCK_')) {
        formattedLines.push(line);
      } else if (line.trim().length === 0) {
        // Empty lines act as breaks
        formattedLines.push('<div class="line-break"></div>');
      } else {
        // Standard Paragraph
        formattedLines.push(`<p>${parseInlineMarkdown(line)}</p>`);
      }
    }

    if (inList) {
      formattedLines.push(`</${listType}>`);
    }

    let finalHTML = formattedLines.join('\n');

    // Step D: Replace Protected code block tokens with original structured snippets
    codeBlocks.forEach((block, index) => {
      finalHTML = finalHTML.replace(`__PROTECTED_CODE_BLOCK_${index}__`, block.html);
    });

    // Save copy closures globally for the copy event listeners
    window.activeCodeBlocks = codeBlocks;

    return finalHTML;
  }

  // Parse inline structures (bold, italic, inline codes)
  function parseInlineMarkdown(text) {
    return text
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline Code `code`
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  // Compile a list of pipe lines into a neat HTML Table structure
  function parseMarkdownTable(rows) {
    if (rows.length < 2) return rows.join('<br>');
    
    const parseCells = (row) => {
      return row
        .split('|')
        .slice(1, -1) // remove leading & trailing pipes
        .map(c => parseInlineMarkdown(c.trim()));
    };

    const headers = parseCells(rows[0]);
    // Skip divider row (rows[1]) e.g., |:---|:---|
    const bodyRows = rows.slice(2).map(r => parseCells(r));

    let html = '<table>';
    
    // Header
    html += '<thead><tr>';
    headers.forEach(h => {
      html += `<th>${h}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    bodyRows.forEach(cells => {
      html += '<tr>';
      cells.forEach(c => {
        html += `<td>${c}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
  }

  // Bind copy clipboard handlers inside the chat container
  chatContent.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-code-btn');
    if (!btn) return;

    const index = parseInt(btn.getAttribute('data-index'), 10);
    if (isNaN(index) || !window.activeCodeBlocks || !window.activeCodeBlocks[index]) return;

    const rawText = window.activeCodeBlocks[index].rawCode;
    navigator.clipboard.writeText(rawText).then(() => {
      // Toggle success state
      const textSpan = btn.querySelector('span');
      const originalText = textSpan.textContent;
      
      textSpan.textContent = 'Copied!';
      btn.classList.add('success');
      showToast('Code copied to clipboard!');

      setTimeout(() => {
        textSpan.textContent = originalText;
        btn.classList.remove('success');
      }, 2000);
    }).catch(err => {
      showToast('Failed to copy code.', false);
    });
  });

  // ==========================================================================
  // 5. Sidebar History & Chat Management (CRUD)
  // ==========================================================================

  function getGroupLabel(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    
    // Normalize midnights
    const midnightToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const midnightYesterday = midnightToday - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = midnightToday - (7 * 24 * 60 * 60 * 1000);

    if (timestamp >= midnightToday) {
      return 'Today';
    } else if (timestamp >= midnightYesterday) {
      return 'Yesterday';
    } else if (timestamp >= sevenDaysAgo) {
      return 'Previous 7 Days';
    } else {
      return 'Older Chats';
    }
  }

  // Render date categorized chats in sidebar
  function renderSidebar() {
    historyList.innerHTML = '';
    
    if (state.conversations.length === 0) {
      historyList.innerHTML = '<div class="history-placeholder">No conversations yet</div>';
      return;
    }

    // Sort by timestamp descending
    const sorted = [...state.conversations].sort((a, b) => b.timestamp - a.timestamp);
    
    // Group them
    const groups = {};
    sorted.forEach(chat => {
      const label = getGroupLabel(chat.timestamp);
      if (!groups[label]) groups[label] = [];
      groups[label].push(chat);
    });

    // Date groupings priority
    const priority = ['Today', 'Yesterday', 'Previous 7 Days', 'Older Chats'];
    
    priority.forEach(label => {
      if (!groups[label] || groups[label].length === 0) return;

      const groupDiv = document.createElement('div');
      groupDiv.className = 'history-group';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'history-group-title';
      titleDiv.textContent = label;
      groupDiv.appendChild(titleDiv);

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'history-list';

      groups[label].forEach(chat => {
        const item = document.createElement('div');
        item.className = `history-item ${chat.id === state.activeChatId ? 'active' : ''}`;
        item.setAttribute('data-id', chat.id);

        const titleWrap = document.createElement('div');
        titleWrap.className = 'history-title-wrap';
        titleWrap.textContent = chat.title;
        item.appendChild(titleWrap);

        // Edit/Delete options row
        const actions = document.createElement('div');
        actions.className = 'history-actions';

        const renameBtn = document.createElement('button');
        renameBtn.className = 'history-action-btn edit-chat-btn';
        renameBtn.title = 'Rename Chat';
        renameBtn.innerHTML = '<svg class="icon" style="width:14px;height:14px;"><use href="#icon-edit"/></svg>';
        actions.appendChild(renameBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'history-action-btn delete-chat-btn';
        deleteBtn.title = 'Delete Chat';
        deleteBtn.innerHTML = '<svg class="icon" style="width:14px;height:14px;"><use href="#icon-trash"/></svg>';
        actions.appendChild(deleteBtn);

        item.appendChild(actions);
        itemsDiv.appendChild(item);
      });

      groupDiv.appendChild(itemsDiv);
      historyList.appendChild(groupDiv);
    });
  }

  // Create new session
  function createNewChat() {
    if (state.isGenerating) {
      showToast('Please wait for generation to complete.', false);
      return;
    }

    const newId = 'chat_' + Date.now();
    const newChat = {
      id: newId,
      title: 'New Conversation',
      model: state.activeModel,
      systemPrompt: state.settings.systemPrompt,
      webSearch: false,
      messages: [],
      timestamp: Date.now()
    };

    state.conversations.unshift(newChat);
    state.activeChatId = newId;
    
    // Reset inputs
    webSearchToggle.classList.remove('toggled');
    clearFileAttachment();
    
    saveStateToStorage();
    renderSidebar();
    loadActiveChat();
    
    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
      sidebar.classList.add('collapsed');
      sidebarOpenBtn.classList.remove('hidden');
    }
  }

  // Trigger loading details of the active chat
  function loadActiveChat() {
    if (!state.activeChatId) {
      welcomeScreen.classList.remove('hidden');
      messagesFeed.classList.add('hidden');
      return;
    }

    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (!activeChat) return;

    // Set model selectors
    state.activeModel = activeChat.model || 'pro';
    updateModelSelectorUI();

    // Toggle search selector state
    if (activeChat.webSearch) {
      webSearchToggle.classList.add('toggled');
    } else {
      webSearchToggle.classList.remove('toggled');
    }

    const messages = activeChat.messages;
    if (messages.length === 0) {
      welcomeScreen.classList.remove('hidden');
      messagesFeed.classList.add('hidden');
      messagesFeed.innerHTML = '';
    } else {
      welcomeScreen.classList.add('hidden');
      messagesFeed.classList.remove('hidden');
      renderMessagesFeed(messages);
      scrollToBottom('instant');
    }
  }

  // Load message feed list items
  function renderMessagesFeed(messages) {
    messagesFeed.innerHTML = '';
    messages.forEach((msg, index) => {
      appendMessageToDOM(msg.sender, msg.text, index);
    });
  }

  // Render individual user or assistant speech bubble on viewport
  function appendMessageToDOM(sender, text, msgIndex) {
    const isUser = sender === 'user';
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${isUser ? 'user' : 'assistant'}`;

    const container = document.createElement('div');
    container.className = 'message-container';

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = `avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`;
    avatar.innerHTML = isUser 
      ? '<svg class="icon"><use href="#icon-user"/></svg>' 
      : '<svg class="icon"><use href="#icon-sparkles"/></svg>';

    const body = document.createElement('div');
    body.className = 'message-body';

    const name = document.createElement('div');
    name.className = 'sender-name';
    name.textContent = isUser ? 'You' : getModelFullTitle(state.activeModel);

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = renderMarkdown(text);

    body.appendChild(name);
    body.appendChild(content);

    // Hover action buttons (Only for Assistant messages)
    if (!isUser) {
      const actionsBar = document.createElement('div');
      actionsBar.className = 'message-actions-bar';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-action-btn';
      copyBtn.title = 'Copy Answer';
      copyBtn.innerHTML = '<svg class="icon" style="width:14px;height:14px;"><use href="#icon-copy"/></svg>';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Answer copied to clipboard!');
        });
      });
      actionsBar.appendChild(copyBtn);

      const thumbUp = document.createElement('button');
      thumbUp.className = 'msg-action-btn';
      thumbUp.title = 'Helpful';
      thumbUp.innerHTML = '<svg class="icon" style="width:14px;height:14px;"><use href="#icon-thumbs-up"/></svg>';
      thumbUp.addEventListener('click', () => {
        thumbUp.classList.toggle('active');
        thumbDown.classList.remove('active');
      });
      actionsBar.appendChild(thumbUp);

      const thumbDown = document.createElement('button');
      thumbDown.className = 'msg-action-btn';
      thumbDown.title = 'Not helpful';
      thumbDown.innerHTML = '<svg class="icon" style="width:14px;height:14px;"><use href="#icon-thumbs-down"/></svg>';
      thumbDown.addEventListener('click', () => {
        thumbDown.classList.toggle('active');
        thumbUp.classList.remove('active');
      });
      actionsBar.appendChild(thumbDown);

      const regenBtn = document.createElement('button');
      regenBtn.className = 'msg-action-btn';
      regenBtn.title = 'Regenerate Response';
      regenBtn.innerHTML = '<svg class="icon" style="width:14px;height:14px;"><use href="#icon-regenerate"/></svg>';
      regenBtn.addEventListener('click', () => {
        regenerateLLMResponse(msgIndex);
      });
      actionsBar.appendChild(regenBtn);

      body.appendChild(actionsBar);
    }

    container.appendChild(avatar);
    container.appendChild(body);
    wrapper.appendChild(container);
    messagesFeed.appendChild(wrapper);
  }

  function getModelFullTitle(modelKey) {
    if (modelKey === 'flash') return 'Antigravity Flash';
    if (modelKey === 'ultra') return 'Antigravity Ultra';
    return 'Antigravity Pro';
  }

  // Sidebar events handler (clicks, rename, delete)
  historyList.addEventListener('click', (e) => {
    const item = e.target.closest('.history-item');
    if (!item) return;

    const chatId = item.getAttribute('data-id');

    // Click Delete
    if (e.target.closest('.delete-chat-btn')) {
      e.stopPropagation();
      deleteConversation(chatId);
      return;
    }

    // Click Rename
    if (e.target.closest('.edit-chat-btn')) {
      e.stopPropagation();
      startRenameChat(item, chatId);
      return;
    }

    // Select conversation
    if (chatId !== state.activeChatId) {
      if (state.isGenerating) {
        showToast('Generation in progress. Let it finish or cancel before switching.', false);
        return;
      }
      state.activeChatId = chatId;
      saveStateToStorage();
      renderSidebar();
      loadActiveChat();
    }
  });

  // Delete chat logic
  function deleteConversation(chatId) {
    const confirmVal = confirm('Are you sure you want to delete this conversation?');
    if (!confirmVal) return;

    state.conversations = state.conversations.filter(c => c.id !== chatId);
    if (state.activeChatId === chatId) {
      state.activeChatId = state.conversations.length > 0 ? state.conversations[0].id : null;
    }

    saveStateToStorage();
    renderSidebar();
    loadActiveChat();
    showToast('Conversation deleted.');
  }

  // Double click / edit action triggers inline rename
  function startRenameChat(itemElement, chatId) {
    const titleWrap = itemElement.querySelector('.history-title-wrap');
    const oldTitle = titleWrap.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'history-item-input';
    input.value = oldTitle;
    
    titleWrap.innerHTML = '';
    titleWrap.appendChild(input);
    input.focus();
    input.select();

    const saveRename = () => {
      const newTitle = input.value.trim() || oldTitle;
      const chat = state.conversations.find(c => c.id === chatId);
      if (chat) {
        chat.title = newTitle;
        saveStateToStorage();
      }
      titleWrap.innerHTML = '';
      titleWrap.textContent = newTitle;
    };

    input.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') {
        saveRename();
      }
      if (evt.key === 'Escape') {
        titleWrap.innerHTML = '';
        titleWrap.textContent = oldTitle;
      }
    });

    input.addEventListener('blur', saveRename);
  }

  // Trigger creating new conversation when plus is clicked
  newChatBtn.addEventListener('click', createNewChat);

  // Clear feed action
  clearChatBtn.addEventListener('click', () => {
    if (!state.activeChatId) return;
    const confirmVal = confirm('Clear all messages in the active chat?');
    if (!confirmVal) return;

    const chat = state.conversations.find(c => c.id === state.activeChatId);
    if (chat) {
      chat.messages = [];
      chat.timestamp = Date.now();
      saveStateToStorage();
    }
    loadActiveChat();
    showToast('Conversation cleared.');
  });

  // ==========================================================================
  // 6. Streaming Mock AI Generator & Stop Feature
  // ==========================================================================

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleMessageSubmission();
  });

  function handleMessageSubmission() {
    if (state.isGenerating) {
      // If generating, sendBtn acts as standard Cancel / Stop action!
      cancelGeneration();
      return;
    }

    const rawText = chatTextarea.value.trim();
    if (rawText.length === 0 && !state.attachedFile) return;

    // Create session if none is active
    if (!state.activeChatId) {
      const newId = 'chat_' + Date.now();
      const newChat = {
        id: newId,
        title: rawText ? (rawText.substring(0, 24) + (rawText.length > 24 ? '...' : '')) : 'New Attachment Chat',
        model: state.activeModel,
        systemPrompt: state.settings.systemPrompt,
        webSearch: webSearchToggle.classList.contains('toggled'),
        messages: [],
        timestamp: Date.now()
      };
      state.conversations.unshift(newChat);
      state.activeChatId = newId;
    }

    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (!activeChat) return;

    // Set first message as the title if it was named "New Conversation"
    if (activeChat.title === 'New Conversation' && rawText) {
      activeChat.title = rawText.substring(0, 24) + (rawText.length > 24 ? '...' : '');
    }

    // Add User Message to structural state
    let userMsgText = rawText;
    if (state.attachedFile) {
      userMsgText = `📎 **[Attached File: ${state.attachedFile.name}]**\n\n` + userMsgText;
    }

    activeChat.messages.push({
      sender: 'user',
      text: userMsgText,
      timestamp: Date.now()
    });

    // Sync storage and load active viewport (removes landing screen)
    activeChat.timestamp = Date.now();
    saveStateToStorage();
    renderSidebar();
    loadActiveChat();

    // Reset Form Input text
    chatTextarea.value = '';
    resizeTextarea();
    clearFileAttachment();
    sendBtn.disabled = true;

    // Launch AI streaming response
    streamMockAIResponse(activeChat, rawText);
  }

  function streamMockAIResponse(activeChat, userPromptText) {
    state.isGenerating = true;
    updateSendBtnState();

    // Append standard thinking wave container in HTML feed
    welcomeScreen.classList.add('hidden');
    messagesFeed.classList.remove('hidden');

    const loaderWrapper = document.createElement('div');
    loaderWrapper.className = 'message-wrapper assistant loader-state';
    loaderWrapper.innerHTML = `
      <div class="message-container">
        <div class="avatar assistant-avatar"><svg class="icon"><use href="#icon-sparkles"/></svg></div>
        <div class="message-body">
          <div class="sender-name">${getModelFullTitle(state.activeModel)}</div>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
    messagesFeed.appendChild(loaderWrapper);
    scrollToBottom();

    // Resolve system prompt and search toggles
    const activeSystemPrompt = activeChat.systemPrompt || state.settings.systemPrompt;
    const hasWebSearch = activeChat.webSearch;

    // Query response from simulated engine
    const fullResponse = window.AntigravityMockEngine.getLLMResponse(
      userPromptText, 
      state.activeModel, 
      hasWebSearch,
      activeSystemPrompt
    );

    // Calculate typing speed intervals based on settings slider
    // speed 1: slow, 2: normal, 3: fast, 4: instant
    let intervalMs = 25;
    let incrementChars = 2; // characters printed per step

    if (state.settings.speed === 1) {
      intervalMs = 40; incrementChars = 1;
    } else if (state.settings.speed === 3) {
      intervalMs = 15; incrementChars = 4;
    } else if (state.settings.speed === 4) {
      intervalMs = 1; incrementChars = fullResponse.length; // instant
    }

    let currentIndex = 0;
    let streamText = '';

    // Simulate thinking delay (e.g., 600ms) before streaming
    setTimeout(() => {
      if (!state.isGenerating) return; // check if cancelled

      // Remove the loader indicator
      loaderWrapper.remove();

      // Create new assistant wrapper inside viewport
      const assistantWrapper = document.createElement('div');
      assistantWrapper.className = 'message-wrapper assistant active-generation-node';
      
      const assistantContainer = document.createElement('div');
      assistantContainer.className = 'message-container';

      const assistantAvatar = document.createElement('div');
      assistantAvatar.className = 'avatar assistant-avatar';
      assistantAvatar.innerHTML = '<svg class="icon"><use href="#icon-sparkles"/></svg>';

      const assistantBody = document.createElement('div');
      assistantBody.className = 'message-body';

      const assistantName = document.createElement('div');
      assistantName.className = 'sender-name';
      assistantName.textContent = getModelFullTitle(state.activeModel);

      const assistantContent = document.createElement('div');
      assistantContent.className = 'message-content';

      // Blinking stream cursor marker
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';

      assistantBody.appendChild(assistantName);
      assistantBody.appendChild(assistantContent);
      assistantContainer.appendChild(assistantAvatar);
      assistantContainer.appendChild(assistantBody);
      assistantWrapper.appendChild(assistantContainer);
      messagesFeed.appendChild(assistantWrapper);

      // Streaming logic Loop
      state.generationTimer = setInterval(() => {
        if (!state.isGenerating) {
          clearInterval(state.generationTimer);
          return;
        }

        if (currentIndex >= fullResponse.length) {
          // Streaming completed successfully
          clearInterval(state.generationTimer);
          saveFinishedAIResponse(activeChat, streamText);
          return;
        }

        // Print character segment
        const endRange = Math.min(currentIndex + incrementChars, fullResponse.length);
        streamText += fullResponse.substring(currentIndex, endRange);
        currentIndex = endRange;

        // Render formatted Markdown live
        assistantContent.innerHTML = renderMarkdown(streamText);
        
        // Auto scroll tracking bottom
        scrollToBottom();
      }, intervalMs);

    }, 850);
  }

  function saveFinishedAIResponse(activeChat, finalText) {
    activeChat.messages.push({
      sender: 'assistant',
      text: finalText,
      timestamp: Date.now()
    });

    activeChat.timestamp = Date.now();
    state.isGenerating = false;
    state.generationTimer = null;
    
    saveStateToStorage();
    updateSendBtnState();
    
    // Full render so hover action elements attach
    loadActiveChat();
  }

  // Cancel generation in progress
  function cancelGeneration() {
    if (state.generationTimer) {
      clearInterval(state.generationTimer);
    }
    
    state.isGenerating = false;
    state.generationTimer = null;
    updateSendBtnState();

    // Find and capture current text inside active streaming wrapper
    const activeGenNode = messagesFeed.querySelector('.active-generation-node');
    const loaderNode = messagesFeed.querySelector('.loader-state');

    let streamText = '*(Simulated streaming cancelled by user)*';

    if (activeGenNode) {
      const msgContent = activeGenNode.querySelector('.message-content');
      // Search for unescaped code blocks indices in buffer
      streamText = msgContent.textContent + ' ⏹️ *(Generation stopped)*';
      activeGenNode.remove();
    } else if (loaderNode) {
      loaderNode.remove();
    }

    // Save stopped response
    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (activeChat) {
      activeChat.messages.push({
        sender: 'assistant',
        text: streamText,
        timestamp: Date.now()
      });
      activeChat.timestamp = Date.now();
      saveStateToStorage();
    }

    loadActiveChat();
    showToast('Generation cancelled.', false);
  }

  // Regenerate Response from index
  function regenerateLLMResponse(msgIndex) {
    if (state.isGenerating) {
      showToast('Generation already active.', false);
      return;
    }

    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (!activeChat) return;

    // Locate the prompt above this message
    let userPromptText = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (activeChat.messages[i].sender === 'user') {
        userPromptText = activeChat.messages[i].text;
        break;
      }
    }

    // Remove old responses after index
    activeChat.messages = activeChat.messages.slice(0, msgIndex);
    
    saveStateToStorage();
    loadActiveChat();
    
    streamMockAIResponse(activeChat, userPromptText);
  }

  // Swap icons of send/stop button during streams
  function updateSendBtnState() {
    if (state.isGenerating) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<svg class="icon" style="color:#ef4444;"><use href="#icon-stop"/></svg>';
      sendBtn.title = 'Stop Generating';
    } else {
      sendBtn.innerHTML = '<svg class="icon"><use href="#icon-send"/></svg>';
      sendBtn.title = 'Send Message';
      sendBtn.disabled = chatTextarea.value.trim().length === 0 && !state.attachedFile;
    }
  }

  // Suggestion Cards listeners
  document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
      if (state.isGenerating) return;
      const prompt = card.getAttribute('data-prompt');
      chatTextarea.value = prompt;
      resizeTextarea();
      sendBtn.disabled = false;
      chatForm.requestSubmit();
    });
  });

  // ==========================================================================
  // 7. Input Extensions (Attach, Voice, Web Search)
  // ==========================================================================

  // Attachment Actions
  attachBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    state.attachedFile = file;
    attachmentFilename.textContent = file.name;
    attachmentPreview.classList.remove('hidden');
    sendBtn.disabled = false;
    
    showToast(`File attached: ${file.name}`);
  });

  removeAttachmentBtn.addEventListener('click', () => {
    clearFileAttachment();
  });

  function clearFileAttachment() {
    state.attachedFile = null;
    fileInput.value = '';
    attachmentPreview.classList.add('hidden');
    sendBtn.disabled = chatTextarea.value.trim().length === 0;
  }

  // Web Search Switcher
  webSearchToggle.addEventListener('click', () => {
    webSearchToggle.classList.toggle('toggled');
    const isToggled = webSearchToggle.classList.contains('toggled');
    
    // Save to active conversation state
    if (state.activeChatId) {
      const activeChat = state.conversations.find(c => c.id === state.activeChatId);
      if (activeChat) {
        activeChat.webSearch = isToggled;
        saveStateToStorage();
      }
    }

    showToast(isToggled ? 'Search mode enabled!' : 'Search mode disabled.');
  });

  // Voice recording (Mocked)
  let voiceRecording = false;
  voiceInputBtn.addEventListener('click', () => {
    if (state.isGenerating) return;

    voiceRecording = !voiceRecording;
    if (voiceRecording) {
      voiceInputBtn.style.color = '#ef4444';
      voiceInputBtn.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
      showToast('Voice transcription active... (Mock)', true);
      
      // Auto write text after 2 seconds
      setTimeout(() => {
        if (voiceRecording) {
          chatTextarea.value = "Draft a creative mind-map outlining 3 core features of an AI code analyzer tool.";
          resizeTextarea();
          sendBtn.disabled = false;
          
          voiceInputBtn.style.color = '';
          voiceInputBtn.style.backgroundColor = '';
          voiceRecording = false;
          showToast('Voice transcribed successfully!');
        }
      }, 2500);
    } else {
      voiceInputBtn.style.color = '';
      voiceInputBtn.style.backgroundColor = '';
      voiceRecording = false;
    }
  });

  // ==========================================================================
  // 8. Custom Dropdown & LLM Models Switches
  // ==========================================================================

  modelSelectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdownMenu.classList.toggle('show');
  });

  // Close dropdown on click outside
  document.addEventListener('click', () => {
    modelDropdownMenu.classList.remove('show');
  });

  modelDropdownMenu.addEventListener('click', (e) => {
    const opt = e.target.closest('.model-option');
    if (!opt) return;

    const modelKey = opt.getAttribute('data-theme') || opt.getAttribute('data-model');
    state.activeModel = modelKey;

    // Update active dropdown element classes
    modelDropdownMenu.querySelectorAll('.model-option').forEach(el => el.classList.remove('active'));
    opt.classList.add('active');

    // If chat is active, update model parameter inside current session
    if (state.activeChatId) {
      const activeChat = state.conversations.find(c => c.id === state.activeChatId);
      if (activeChat) {
        activeChat.model = modelKey;
        saveStateToStorage();
      }
    }

    updateModelSelectorUI();
    showToast(`Switched model to ${getModelFullTitle(modelKey)}`);
  });

  function updateModelSelectorUI() {
    activeModelName.textContent = getModelFullTitle(state.activeModel);
    
    // Select active dropdown card
    modelDropdownMenu.querySelectorAll('.model-option').forEach(el => {
      const model = el.getAttribute('data-model');
      if (model === state.activeModel) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 9. Advanced Settings & Theme Modal Triggers
  // ==========================================================================

  // Open modal
  settingsTriggerBtn.addEventListener('click', () => {
    systemPromptTextarea.value = state.settings.systemPrompt;
    speedSlider.value = state.settings.speed;
    updateSpeedLabel(state.settings.speed);

    // Set theme active card
    themeCards.forEach(c => {
      if (c.getAttribute('data-theme') === state.settings.theme) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    settingsModal.classList.remove('hidden');
  });

  // Close modal
  settingsCloseBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  // Handle Theme Card selections
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const themeName = card.getAttribute('data-theme');
      applyTheme(themeName);
      state.settings.theme = themeName;
    });
  });

  function applyTheme(theme) {
    document.body.className = '';
    document.body.className = `theme-${theme}`;
  }

  // Speed slider changes
  speedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    updateSpeedLabel(val);
  });

  function updateSpeedLabel(val) {
    let text = 'Normal (50 chars/sec)';
    if (val === 1) text = 'Slow (25 chars/sec)';
    if (val === 3) text = 'Fast (120 chars/sec)';
    if (val === 4) text = 'Instant Response';
    
    speedValueDisplay.textContent = text;
  }

  // Save Settings
  settingsSaveBtn.addEventListener('click', () => {
    state.settings.systemPrompt = systemPromptTextarea.value.trim();
    state.settings.speed = parseInt(speedSlider.value, 10);
    
    saveStateToStorage();
    settingsModal.classList.add('hidden');
    showToast('Settings saved successfully!');
    
    // If chat is active and empty, update its local settings copy
    if (state.activeChatId) {
      const activeChat = state.conversations.find(c => c.id === state.activeChatId);
      if (activeChat && activeChat.messages.length === 0) {
        activeChat.systemPrompt = state.settings.systemPrompt;
        saveStateToStorage();
      }
    }
  });

  // Reset defaults
  settingsResetBtn.addEventListener('click', () => {
    state.settings.theme = 'midnight';
    state.settings.systemPrompt = '';
    state.settings.speed = 2;

    applyTheme('midnight');
    systemPromptTextarea.value = '';
    speedSlider.value = 2;
    updateSpeedLabel(2);

    themeCards.forEach(c => {
      if (c.getAttribute('data-theme') === 'midnight') {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    showToast('Restored standard system settings.');
  });

  // Close when overlay clicked
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });

  // ==========================================================================
  // 10. Export System (Markdown & JSON Downloads)
  // ==========================================================================

  exportTriggerBtn.addEventListener('click', () => {
    if (!state.activeChatId) {
      showToast('No active conversation to export.', false);
      return;
    }
    exportModal.classList.remove('hidden');
  });

  exportCloseBtn.addEventListener('click', () => {
    exportModal.classList.add('hidden');
  });

  exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      exportModal.classList.add('hidden');
    }
  });

  // Export to Markdown
  exportMarkdownBtn.addEventListener('click', () => {
    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (!activeChat) return;

    let mdText = `# Chat Session: ${activeChat.title}\n`;
    mdText += `*Date Created*: ${new Date(activeChat.id.split('_')[1] * 1).toLocaleString()}\n`;
    mdText += `*Model Selected*: ${getModelFullTitle(activeChat.model)}\n\n`;
    mdText += `***\n\n`;

    activeChat.messages.forEach(msg => {
      const speaker = msg.sender === 'user' ? '👤 **YOU**' : '🤖 **ASSISTANT**';
      mdText += `### ${speaker}\n\n${msg.text}\n\n`;
      mdText += `***\n\n`;
    });

    downloadFile(mdText, `${activeChat.title.replace(/\s+/g, '_')}_export.md`, 'text/markdown');
    exportModal.classList.add('hidden');
    showToast('Markdown file download started!');
  });

  // Export to JSON
  exportJsonBtn.addEventListener('click', () => {
    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    if (!activeChat) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeChat, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeChat.title.replace(/\s+/g, '_')}_log.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    exportModal.classList.add('hidden');
    showToast('JSON log download started!');
  });

  function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  // ==========================================================================
  // 11. Initial Application Setup
  // ==========================================================================
  
  loadStateFromStorage();
  renderSidebar();
  loadActiveChat();

  // Create default new chat if none exists
  if (state.conversations.length === 0) {
    createNewChat();
  }
});
