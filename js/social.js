// ========================================
// MY LIFE HUB - SOCIAL MEDIA LINKS
// ========================================

const SOCIAL_STORAGE_KEY = "myLifeHub_social_links";

// ========================================
// المنصات المدعومة
// ========================================

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", placeholder: "username", urlPrefix: "https://instagram.com/" },
  { id: "facebook", name: "Facebook", icon: "📘", placeholder: "username", urlPrefix: "https://facebook.com/" },
  { id: "telegram", name: "Telegram", icon: "📱", placeholder: "@username", urlPrefix: "https://t.me/" },
  { id: "twitter", name: "X (Twitter)", icon: "🐦", placeholder: "username", urlPrefix: "https://x.com/" },
  { id: "discord", name: "Discord", icon: "💬", placeholder: "username", urlPrefix: "https://discord.com/users/" },
  { id: "snapchat", name: "Snapchat", icon: "👻", placeholder: "username", urlPrefix: "https://snapchat.com/add/" },
  { id: "reddit", name: "Reddit", icon: "🤖", placeholder: "username", urlPrefix: "https://reddit.com/user/" },
  { id: "tiktok", name: "TikTok", icon: "🎵", placeholder: "@username", urlPrefix: "https://tiktok.com/@" },
  { id: "youtube", name: "YouTube", icon: "▶️", placeholder: "channel", urlPrefix: "https://youtube.com/@" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", placeholder: "username", urlPrefix: "https://linkedin.com/in/" },
  { id: "github", name: "GitHub", icon: "🐙", placeholder: "username", urlPrefix: "https://github.com/" },
  { id: "whatsapp", name: "WhatsApp", icon: "💚", placeholder: "phone", urlPrefix: "https://wa.me/" },
  { id: "threads", name: "Threads", icon: "🧵", placeholder: "username", urlPrefix: "https://threads.net/@" }
];

// ========================================
// دوال التخزين
// ========================================

function getAllSocialLinks() {
  try {
    const raw = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error loading social links:", error);
    return {};
  }
}

function saveSocialLinks(links) {
  try {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(links));
  } catch (error) {
    console.error("Error saving social links:", error);
  }
}

function updateSocialLink(platformId, username) {
  const links = getAllSocialLinks();
  if (username.trim() === "") {
    delete links[platformId];
  } else {
    links[platformId] = username.trim();
  }
  saveSocialLinks(links);
}

function getSocialLink(platformId) {
  const links = getAllSocialLinks();
  return links[platformId] || "";
}

function getFullUrl(platformId, username) {
  if (!username) return "";
  const platform = PLATFORMS.find(p => p.id === platformId);
  if (!platform) return "";
  return platform.urlPrefix + username;
}

// ========================================
// توليد QR Code
// ========================================

function generateQRCode(url) {
  if (!url) return null;
  
  // استخدام API خارجي لتوليد QR Code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  return qrUrl;
}

// ========================================
// عرض صفحة Social Media
// ========================================

function renderSocialPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const links = getAllSocialLinks();

  app.innerHTML = `
    <div id="social-container">
      <!-- Header -->
      <div class="social-header">
        <h2 class="social-title">🌐 Social Media</h2>
        <p class="social-subtitle">Connect your social accounts</p>
      </div>

      <!-- Social Grid -->
      <div class="social-grid" id="social-grid">
        ${PLATFORMS.map(platform => {
          const username = links[platform.id] || "";
          return `
            <div class="social-card" data-platform="${platform.id}">
              <div class="social-card-header">
                <span class="social-card-icon">${platform.icon}</span>
                <span class="social-card-name">${platform.name}</span>
                ${username ? '<span class="social-card-connected">✅</span>' : ''}
              </div>
              <div class="social-card-body">
                <input 
                  type="text" 
                  class="social-card-input" 
                  id="social-input-${platform.id}"
                  placeholder="${platform.placeholder}"
                  value="${username}"
                  data-platform="${platform.id}"
                />
                <div class="social-card-actions">
                  <button class="social-card-save-btn" data-platform="${platform.id}">💾 Save</button>
                  ${username ? `<button class="social-card-qr-btn" data-platform="${platform.id}">📱 QR Code</button>` : ''}
                  ${username ? `<button class="social-card-visit-btn" data-platform="${platform.id}">🔗 Visit</button>` : ''}
                  ${username ? `<button class="social-card-remove-btn" data-platform="${platform.id}">✕</button>` : ''}
                </div>
                <div class="social-card-qr-container" id="qr-${platform.id}" style="display: none;">
                  <div class="social-qr-wrapper">
                    <img class="social-qr-image" id="qr-img-${platform.id}" src="" alt="QR Code" />
                    <button class="social-qr-close-btn" data-platform="${platform.id}">Close</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // ===== إضافة الأحداث =====
  document.querySelectorAll('.social-card-save-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const platformId = this.dataset.platform;
      const input = document.getElementById(`social-input-${platformId}`);
      const username = input.value.trim();
      updateSocialLink(platformId, username);
      renderSocialPage();
    });
  });

  document.querySelectorAll('.social-card-remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const platformId = this.dataset.platform;
      if (confirm('Remove this social link?')) {
        updateSocialLink(platformId, '');
        renderSocialPage();
      }
    });
  });

  document.querySelectorAll('.social-card-qr-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const platformId = this.dataset.platform;
      const username = getSocialLink(platformId);
      const url = getFullUrl(platformId, username);
      const qrContainer = document.getElementById(`qr-${platformId}`);
      const qrImg = document.getElementById(`qr-img-${platformId}`);
      
      if (qrContainer.style.display === 'block') {
        qrContainer.style.display = 'none';
        return;
      }
      
      const qrUrl = generateQRCode(url);
      if (qrUrl) {
        qrImg.src = qrUrl;
        qrContainer.style.display = 'block';
      }
    });
  });

  document.querySelectorAll('.social-qr-close-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const platformId = this.dataset.platform;
      document.getElementById(`qr-${platformId}`).style.display = 'none';
    });
  });

  document.querySelectorAll('.social-card-visit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const platformId = this.dataset.platform;
      const username = getSocialLink(platformId);
      const url = getFullUrl(platformId, username);
      if (url) {
        window.open(url, '_blank');
      }
    });
  });

  // حفظ بالضغط على Enter
  document.querySelectorAll('.social-card-input').forEach(input => {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const platformId = this.dataset.platform;
        const username = this.value.trim();
        updateSocialLink(platformId, username);
        renderSocialPage();
      }
    });
  });
}

// ========================================
// تصدير الدالة للاستخدام من main.js
// ========================================

window.renderSocialPage = renderSocialPage;

console.log("✅ Social Media loaded successfully!");