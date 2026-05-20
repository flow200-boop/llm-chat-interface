/**
 * Antigravity AI - Mock streaming response engine
 * Generates rich markdown structures, tables, and code snippets based on keywords and model selection
 */

const MOCK_RESPONSES = {
  // 1. Default Welcome / standard greeting
  greeting: {
    pro: `Hello! I'm **Antigravity Pro**, your high-reasoning, advanced AI partner. 

I'm ready to assist you today. Here's a quick look at what we can accomplish:
* 💻 **Advanced Engineering**: Custom software design, logic optimization, and refactoring.
* ✍️ **Creative Design**: In-depth explanations, copy generation, and conceptual analysis.
* 🔬 **Analytical Problem Solving**: Architecture comparisons and detailed data breakdowns.

How can I help you excel today? Please enter your query below!`,
    flash: `Hi there! I'm **Antigravity Flash**, optimized for maximum speed and efficiency. ⚡

What quick task can I knock out for you? I can write code snippets, summarize long texts, check logic, or translate languages in a flash. Let's get started!`,
    ultra: `Greetings. I am **Antigravity Ultra**, the heavy-computing architecture designed for deep multi-layered reasoning and large-scale mathematical computations.

*Current Status*: Systems fully calibrated. 
*Context Window*: Extended mathematical mode active.

Please present your analytical dataset, algorithmic puzzle, or system architecture review. How shall we begin our calculations?`
  },

  // 2. CSS Grid Prompt Card response
  css_grid: {
    pro: `Designing a modern neon-accented grid layout with CSS Grid and Subgrid is a fantastic way to build robust, visually stunning dashboards. Below, I've crafted a comprehensive guide and full code module.

### Core Concepts Used
1. **CSS Grid**: For the macro 3-column layout.
2. **CSS Subgrid**: To align the header and footer of individual cards perfectly with each other, regardless of card content height.
3. **Glassmorphism & Neon Shadows**: Ultra-premium aesthetic styles.

Here is your production-ready CSS snippet:

\`\`\`css
/* Clean Reset & Variable Definition */
:root {
  --neon-cyan: #00f0ff;
  --neon-pink: #ff007f;
  --bg-dark: #0a0516;
  --card-bg: rgba(25, 18, 48, 0.4);
  --border-glow: rgba(0, 240, 255, 0.2);
}

/* Grid Container Styles */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 32px;
  background-color: var(--bg-dark);
}

/* Modern Card Layout leveraging CSS Subgrid */
.glass-card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* Header, Body, Footer aligned */
  background: var(--card-bg);
  border: 1px solid var(--border-glow);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

/* Stunning Interactive Neon Hover Effect */
.glass-card:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.4),
              0 0 30px rgba(255, 0, 127, 0.15);
}

/* Subgrid child items alignment */
.card-header {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 12px;
}

.card-body {
  color: #c4b5fd;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 16px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
}
\`\`\`

### Responsive Advice
Using \`repeat(auto-fit, minmax(300px, 1fr))\` ensures cards wrap automatically onto new lines on tablet or mobile dimensions without complex media queries.`,
    
    flash: `Here is a lightning-fast CSS grid layout with neon visual shadows:

\`\`\`css
/* Rapid 3-Column Glass Neon Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

.neon-card {
  background: rgba(15, 10, 30, 0.8);
  border: 1px solid #39ff14;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.1);
}

.neon-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
}
\`\`\`

*Usage tip*: Assign this to any dashboard template to give it a cyberpunk neon look immediately!`,
    
    ultra: `[Computation Thread: UI/UX Layout Frameworks]
[Process ID: 9481]
[Task: Grid Alignment and subgrid calculation details]

The implementation of CSS Grid with subgrid coordinates resolves a major layout disparity where sibling elements (such as titles and buttons inside card components) do not align across independent columns. By inheriting the row definition from the parent element (\`grid-template-rows: subgrid\`), we achieve mechanical alignment in two dimensions.

Below is the calculated optimal structural blueprint:

\`\`\`css
.matrix-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.matrix-card {
  grid-column: span 4;
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
  background: #000000;
  border: 1px solid #1a1a1a;
  box-shadow: 0 0 1px #ff007f;
}

.matrix-card:hover {
  border-color: #ff007f;
  box-shadow: 0 0 8px rgba(255, 0, 127, 0.3);
}
\`\`\``
  },

  // 3. JavaScript helper input prompt card
  js_helper: {
    pro: `Building clean, optimized helper functions for event handling is critical for high-performance applications. Here are fully-commented JavaScript functions for both **Debounce** and **Throttle**, along with an explanation of when to use which.

### 1. Debounce Function
*Use case*: Triggering an action only *after* the user has stopped typing (e.g., search autocomplete, autosave).

\`\`\`javascript
/**
 * Limits the rate at which a function fires.
 * Delay begins anew on each consecutive trigger request.
 * @param {Function} func - The callback function to run.
 * @param {number} delay - Timeout in milliseconds.
 * @returns {Function} - The debounced closure.
 */
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    const context = this;
    
    // Clear the active timer on every interaction
    clearTimeout(timeoutId);
    
    // Start a new countdown
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Example usage on input event:
const handleSearch = debounce((event) => {
  console.log('Fetching database results for:', event.target.value);
}, 300);
document.getElementById('search-box').addEventListener('input', handleSearch);
\`\`\`

### 2. Throttle Function
*Use case*: Executing a callback at a maximum of once every X milliseconds (e.g., handling window resize, heavy scroll listeners).

\`\`\`javascript
/**
 * Guarantees a function executes at most once per designated interval.
 * @param {Function} func - The callback function.
 * @param {number} limit - Interval limit in milliseconds.
 * @returns {Function} - The throttled function closure.
 */
function throttle(func, limit) {
  let inThrottle = false;
  
  return function(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      // Prevent execution until the limit expires
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Example usage on window scroll:
const handleScroll = throttle(() => {
  console.log('User is scrolling, updating sticky headers at:', Date.now());
}, 100);
window.addEventListener('scroll', handleScroll);
\`\`\`

### Summary Comparison Table
| Feature | Debounce | Throttle |
| :--- | :--- | :--- |
| **Strategy** | Delay execution until idle | Execute regularly at fixed intervals |
| **Reset Trigger** | Yes, restarts the timer | No, runs immediately on cooldown |
| **Best for** | Text Inputs, Autosave, Resize stops | Scrolling, Dragging, Resize loops |`,
    
    flash: `Here are short, super-efficient JS helper snippets for Debounce and Throttle:

\`\`\`javascript
// Debounce: Wait until inactivity before running
const debounce = (fn, delay = 250) => {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), delay);
  };
};

// Throttle: Fire once per time block
const throttle = (fn, limit = 100) => {
  let waiting = false;
  return (...args) => {
    if (!waiting) {
      fn(...args);
      waiting = true;
      setTimeout(() => waiting = false, limit);
    }
  };
};
\`\`\`

Use these functions in your scroll handler, autocomplete box, or window resizing events to ensure browser CPU usage remains minimal!⚡`,
    
    ultra: `[Computing Mathematical Optimization]
[Logic Engine: Events and Throttling Limits]

The primary performance bottleneck under high-frequency event rates (like \`window.onscroll\`) lies in the browser reflow pipeline. A raw listener executing DOM transformations can trigger layout thrashing at 100+ frames per second, far exceeding standard monitor refresh rates.

Below is an mathematically stable, non-overlapping scheduling wrapper utilizing \`requestAnimationFrame\` as a high-performance alternative to standard timers, ensuring synchronization with the browser draw interval:

\`\`\`javascript
/**
 * Throttles scroll/resize logic to match layout draws
 */
function rAFThrottle(func) {
  let ticking = false;
  
  return function(...args) {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        func(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}
\`\`\``
  },

  // 4. Brainstorm features suggestion prompt card
  brainstorm: {
    pro: `Here are **5 groundbreaking, unique features** for a next-generation collaborative markdown document editor application. These concepts are designed to exceed existing tool sets like Notion, Obsidian, or Google Docs.

---

### 1. 🌐 Contextual Multi-Caret Semantic Sub-spaces
- **Description**: Standard real-time editing allows users to see each other's typing carets. A semantic sub-space allows users to highlight a paragraph and spin up a collaborative "micro-sandbox" to iterate on changes asynchronously.
- **Workflow**: Highlighting text reveals a "Fork Selection" badge. Two collaborators edit alternative phrasing side-by-side, then vote or run an automated diff check before merging back into the parent document.

### 2. ⚡ Inline Interactive Code Sandbox & Variable Bindings
- **Description**: Render code blocks as live execution outputs. Allow variables inside code blocks to be referenced directly inside the Markdown text dynamically.
- **Example**: If a Python block defines \`revenue = 50000\`, a writer can type \`{{py.revenue * 0.2}}\` in a paragraph, and the document displays **$10,000** automatically. Changing the code updates the text instantly.

### 3. 🧠 Neural Multi-User Mind-Mapping & Document Outliner
- **Description**: An AI system that reads your documents in real-time and constructs a visual three-dimensional mind map of core concepts, linking sections together based on semantic relationships.
- **Feature**: Click on a node in the 3D outline graph to slide that document section side-by-side with your active viewing window. Ideal for keeping huge, complex knowledge bases organized.

### 4. 🔒 Zero-Knowledge Cryptographic Section Locking
- **Description**: Collaborative apps struggle with permission layers inside individual files. This permits granular, key-based cryptographic locking of specific headings or sections.
- **Use Case**: HR managers and executives editing a single file can lock financial paragraphs with a key. External team members see encrypted, unreadable text blocks (\`████████\`) unless they present the correct key credential.

### 5. 🎤 Ambient Voice-to-Structure Document Drafting
- **Description**: Continuous active voice transcription that doesn't just print raw text, but parses spoken commands into perfect markdown syntax.
- **Workflow**: Saying *"Insert standard table with columns Framework, Rating, Speed"* automatically renders an empty markdown table, allowing you to speak data values row by row hands-free.`,
    
    flash: `Here are 5 killer collaborative markdown editor feature ideas:
1. **Interactive Sandbox Blocks**: Render runnable code (JS, Python) directly in code snippets.
2. **Granular Local Locks**: Lock down specific paragraphs or headings so others can't overwrite them.
3. **Smart Autolinker**: Highlights terms and automatically links them to matching files in your system.
4. **Bi-directional Floating Graphs**: Visual map of related notes floating in a side pane.
5. **Real-time Revisions Split**: Multi-carets that let you collaborate on individual sentences in small isolated sandboxes.`,
    
    ultra: `[Brainstorming Phase: Collaborative Markdown Ecosystem]
[Analysis: Competitive Advantage, Technical Viability]

The collaborative document editor domain is highly saturated. To compete, a new entry must provide architectural paradigm shifts:

1. **Reactive Reactive-Document Engine (RDE)**: Elements inside markdown are treated as active components with dependency graph states.
2. **Ephemeral Git-style Branches**: Every sentence retains a light commit graph, enabling seamless branching/merging of prose.
3. **Decentralized Local-First Synced Nodes**: Direct webRTC client communication, synchronizing files with CRDTs (Conflict-Free Replicated Data Types) without central servers.
4. **Cryptographically Sealed Sections**: High-security, key-based local encryption of text paragraphs.
5. **Generative Layout Templates**: Generates custom tables, graphs, and task cards automatically by interpreting written natural language notes.`
  },

  // 5. SPA vs SSR Comparison suggestion prompt card
  spa_vs_ssr: {
    pro: `Choosing the right architecture in 2026 is critical for balancing user experience, SEO viability, and developer velocity. Below is a deep, comprehensive architectural analysis comparing **Single-Page Applications (SPAs)** and **Server-Side Rendered (SSR) websites**.

### Comparative Analysis Table

| Feature Dimension | Single Page Apps (SPA) | Server-Side Rendered (SSR) |
| :--- | :--- | :--- |
| **Initial Page Load** | Slow (requires downloading entire JS bundle) | **Very Fast** (ready-to-render HTML served) |
| **Subsequent Navigation** | **Instantaneous** (fluid client-side route swaps) | Moderate (requires page transition cycles) |
| **SEO Indexability** | Complicated (crawlers must run Javascript) | **Excellent** (pre-rendered metadata readable) |
| **Server Load** | **Extremely Low** (static asset delivery CDN) | High (dynamic render computation per hit) |
| **State Management** | Simple (persistent client state in memory) | Complex (syncing client and server states) |

---

### Architectural Recommendations

#### When to choose an SPA (e.g., React SPA, Vite + vanilla JS):
- You are building highly interactive dashboards, email clients, or SaaS applications where state must be preserved across actions.
- The web application is placed behind a login gate, meaning SEO indexability is a non-issue.
- You want to completely offload server rendering costs, relying on client CPUs.

#### When to choose SSR (e.g., Next.js, Remix, Nuxt):
- You are developing public websites like blogs, e-commerce stores, or informational portals where Search Engine Optimization is key.
- Initial load speed is directly tied to business revenue metrics.
- Content changes frequently and must reflect immediately to index bots.`,
    
    flash: `Here is a quick comparison of SPA and SSR for 2026:

**Single Page App (SPA)**
* *Pros*: Fluid interactions, instant transitions after load, zero server rendering load.
* *Cons*: Heavy initial bundle size, poor default SEO indexability.
* *Best for*: SaaS dashboards, administrative panels, secure portals.

**Server Side Rendering (SSR)**
* *Pros*: Extremely fast initial paint, excellent SEO crawl, immediate load.
* *Cons*: Higher server CPU costs, more complex state management.
* *Best for*: Landing pages, marketing websites, public e-commerce sites.

⚡ *Verdict*: Use Hybrid frameworks (like Next.js) to leverage the advantages of both models within a single application!`,
    
    ultra: `[Architectural Analysis: Client-Side Hydration vs Server Composition]
[System Load Optimization Graph calculations]

Executing a comparative layout review on Single Page Application (SPA) vs Server-Side Rendered (SSR) models reveals standard CPU utilization tradeoffs. 

The SPA model offloads HTML structural computation entirely to the Client virtual machine, freeing Server thread pools but imposing a Time-To-Interactive (TTI) penalty during initial bundle downloading. SSR minimizes TTI through server-side compilation, but introduces a hydration latency phase where user events may fire before JS hydration is active.

Calculated trade-off vectors:
- **SPA Hydration Constant**: 0ms (no hydration required, full initial render paint)
- **SSR Hydration Constant**: 120ms to 600ms (latency window prior to interactive bindings)
- **Core Recommendation**: Implement Partial Hydration (Islands Architecture) via modern compilation frameworks to limit DOM binding overhead.`
  }
};

/**
 * Procedural response generator for any query not covered by presets.
 * Analyzes words and outputs structured markdown context-aware thoughts.
 */
function generateProceduralResponse(prompt, model, hasWebSearch) {
  const normalized = prompt.toLowerCase();
  
  // Model specific headings
  let introduction = "";
  if (model === 'pro') {
    introduction = `Based on my advanced analysis, here is an organized breakdown of your request regarding **"${prompt}"**:\n\n`;
  } else if (model === 'flash') {
    introduction = `⚡ Quick insights on **"${prompt}"**:\n\n`;
  } else {
    introduction = `[Antigravity Ultra Logic Core v4.1 - Procedural Reasoning Run]\n[Query Vector: "${prompt}"]\n\n`;
  }

  // Generate web search context if enabled
  let searchContext = "";
  if (hasWebSearch) {
    searchContext = `> 🌐 **Web Search Active**: Scanning global databases for real-time information. Verified sources retrieved.\n\n`;
  }

  let body = "";
  if (normalized.includes('code') || normalized.includes('write a program') || normalized.includes('function')) {
    body = `Here is a custom code snippet addressing your requirements. I have optimized the performance profile:

\`\`\`javascript
// Procedurally generated optimization routine
function processUserData(dataStream) {
  if (!dataStream || dataStream.length === 0) return [];
  
  // High-performance filter mapping
  return dataStream
    .filter(item => item.isActive && item.rating > 4.2)
    .map(item => ({
      id: item.uid,
      displayName: item.name.toUpperCase(),
      score: Math.round(item.rating * 100)
    }));
}

// Example usage:
const mockData = [
  { uid: 'u01', name: 'Alice', isActive: true, rating: 4.8 },
  { uid: 'u02', name: 'Bob', isActive: false, rating: 4.5 },
  { uid: 'u03', name: 'Charlie', isActive: true, rating: 3.9 }
];
console.log(processUserData(mockData)); 
// Output: [ { id: 'u01', displayName: 'ALICE', score: 480 } ]
\`\`\`

### Key Features of this code:
- **Type safety check**: Prevents empty array runtime crashes.
- **Functional design**: Chaining \`filter\` and \`map\` avoids complex loop state variables.
- **Score scalar scale**: Amplifies floating-point scores to integer factors.`;
  } else if (normalized.includes('why') || normalized.includes('explain') || normalized.includes('how')) {
    body = `To understand this topic thoroughly, let's break it down into core principles:

1. **The Fundamental Mechanism**: Everything functions based on local interaction rules, where data models propagate state updates down through a clean top-down hierarchy.
2. **Key Dependencies**: Several structural components must be aligned to ensure stability under load.
3. **Best Practices**:
   * Always design interfaces around user-driven workflows.
   * Maintain a robust separation of concerns between presentation and core business layers.
   * Regularly audit code complexity indices to prevent architectural decay.

Would you like me to dive deeper into any of these specific points?`;
  } else if (normalized.includes('list') || normalized.includes('ideas') || normalized.includes('steps')) {
    body = `Here is a structured overview of the key concepts you requested:

* 🚀 **Step 1: Inception & Scoping** — Clearly define the boundaries, requirements, and key performance indicators of the system.
* 🛠️ **Step 2: Architecture Setup** — Establish the data models, layout schemes, and boundary services.
* 📈 **Step 3: Iteration & Polish** — Add interactive controls, visual transitions, and debug performance bottlenecks.
* 🛡️ **Step 4: Hardening & Security** — Apply cryptographic layers, access controls, and performance caching.

Let me know if you would like an expanded implementation checklist for any of these steps.`;
  } else {
    // Fallback general response
    body = `I've evaluated your request and compiled the essential considerations:

- **Primary Consideration**: Ensure your implementations remain modular, allowing future components to hook in seamlessly.
- **Context Analysis**: The query outlines a standard architectural challenge that can be solved with modular components and clean data contracts.
- **Next Steps**: Focus on building a minimal working system first, then layer on advanced visual polishing and interactive mechanics.

Please let me know if you have a specific code request, architectural question, or brainstorm topic you would like to explore next!`;
  }

  return introduction + searchContext + body;
}

/**
 * Main exposed function of the mock engine.
 * Selects the correct answer block or procedurally generates one, then streams it.
 * 
 * @param {string} prompt - User input query
 * @param {string} model - 'pro' | 'flash' | 'ultra'
 * @param {boolean} webSearch - Web search active
 * @param {string} systemPrompt - Custom instructions
 * @returns {string} - The full response string
 */
function getLLMResponse(prompt, model, webSearch, systemPrompt) {
  const norm = prompt.toLowerCase();
  let baseAnswer = "";

  // Check matching template keywords
  if (norm.includes('css grid') || norm.includes('neon') || norm.includes('subgrid')) {
    baseAnswer = MOCK_RESPONSES.css_grid[model];
  } else if (norm.includes('javascript') || norm.includes('debounce') || norm.includes('throttle')) {
    baseAnswer = MOCK_RESPONSES.js_helper[model];
  } else if (norm.includes('brainstorm') || norm.includes('markdown document') || norm.includes('collaborative')) {
    baseAnswer = MOCK_RESPONSES.brainstorm[model];
  } else if (norm.includes('spa vs ssr') || norm.includes('server-side') || norm.includes('single page')) {
    baseAnswer = MOCK_RESPONSES.spa_vs_ssr[model];
  } else if (norm.trim() === 'hello' || norm.trim() === 'hi' || norm.includes('welcome')) {
    baseAnswer = MOCK_RESPONSES.greeting[model];
  } else {
    // Generate procedurally if no keyword match
    baseAnswer = generateProceduralResponse(prompt, model, webSearch);
  }

  // Prepend system prompt context if user customize it
  if (systemPrompt && systemPrompt.trim().length > 0) {
    baseAnswer = `> ⚙️ **System Prompt Active**: *"${systemPrompt.trim()}"*\n\n` + baseAnswer;
  }

  return baseAnswer;
}

// Expose variables globally
window.AntigravityMockEngine = {
  getLLMResponse: getLLMResponse
};
