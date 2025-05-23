<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__left">
        <div class="footer__links">
          <a href="#">이용약관</a>
          <span>|</span>
          <a href="#">개인정보처리방침</a>
        </div>
        <div class="footer__brand">BalanceEat</div>
        <div class="footer__copyright">CopyrightⓒBalanceEat. 밸런스잇. All Rights Reserved.</div>
      </div>
      <div class="footer__right">
        <div>Contact</div>
        <div>ngstjc8@gmail.com<br />1zzimy@naver.com</div>
      </div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background: #222;
  height: 20vh;
  color: #fff;
  padding: 2rem 0 1rem 0;
  font-size: 0.95rem;
}
.footer__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 0 1rem;
}
.footer__left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.footer__links {
  display: flex;
  gap: 0.5rem;
  color: #bbb;
}
.footer__links a {
  color: #bbb;
  text-decoration: none;
}
.footer__brand {
  font-weight: bold;
  font-size: 1.1rem;
}
.footer__copyright {
  color: #aaa;
  font-size: 0.9rem;
}
.footer__right {
  text-align: right;
  color: #bbb;
}
@media (max-width: 700px) {
  .footer__content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .footer__right {
    text-align: left;
  }
}
</style>
