<script setup>
import { Facebook, ExternalLink, Heart } from 'lucide-vue-next'
</script>

<template>
  <footer class="app-footer animate-fade">
    <div class="footer-content">
      <div class="footer-brand">
        <h3>Kim's Schedule</h3>
        <p>Trợ lý Công việc</p>
      </div>

      <div class="footer-links">
        <a href="https://www.facebook.com/mtdes233/" target="_blank" class="social-link">
          <Facebook :size="20" />
          <span>Facebook</span>
        </a>
        <a href="http://www.mtdes23.id.vn" target="_blank" class="social-link">
          <ExternalLink :size="20" />
          <span>Website</span>
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <p>Designed with <Heart :size="14" class="heart-icon" /> by <strong>mtdes23</strong></p>
      <p class="copyright">&copy; 2026 www.mtdes23.id.vn</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 4rem;
  padding: 3rem 2rem;
  border-top: 1px solid var(--border);
  background: hsla(var(--bg-h), var(--bg-s), 5%, 0.5);
  border-radius: var(--radius) var(--radius) 0 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-brand h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-brand p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: var(--glass);
  border: 1px solid var(--border);
}

.social-link:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.heart-icon {
  color: var(--danger);
  display: inline;
  vertical-align: middle;
}

.copyright {
  font-family: var(--font-body);
}

@media (max-width: 600px) {
  .footer-content, .footer-bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }
}
</style>
