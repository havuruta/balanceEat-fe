<template>
  <!-- 히어로 섹션 -->
  <section class="hero-section">
    <div class="hero-overlay">
      <h1>BalanceEat</h1>
      <p>균형 잡힌 식습관으로 건강한 삶을 시작하세요</p>
      <router-link to="/nutrition" class="hero-btn">영양 정보 보기</router-link>
    </div>
  </section>

  <!-- 특징 섹션 -->
  <section class="features-section">
    <h2>BalanceEat의 특징</h2>
    <div class="features-list">
      <div class="feature">
        <span class="feature-icon">🍽️</span>
        <h4>영양 정보 관리</h4>
        <p>음식의 영양 정보를 쉽게 조회하고 관리할 수 있습니다.</p>
      </div>
      <div class="feature">
        <span class="feature-icon">🛡️</span>
        <h4>개인화된 서비스</h4>
        <p>회원가입을 통해 개인화된 영양 정보 관리가 가능합니다.</p>
      </div>
      <div class="feature">
        <span class="feature-icon">📱</span>
        <h4>모바일 친화적</h4>
        <p>어디서든 쉽게 접근할 수 있는 반응형 디자인을 제공합니다.</p>
      </div>
    </div>
  </section>

  <!-- 성과(통계) 섹션 -->
  <section class="stats-section">
    <h2>우리의 성과</h2>
    <div class="stats-list">
      <div class="stat">
        <h3>1000+</h3>
        <p>등록된 음식</p>
      </div>
      <div class="stat">
        <h3>500+</h3>
        <p>활성 사용자</p>
      </div>
      <div class="stat">
        <h3>50+</h3>
        <p>영양 정보 카테고리</p>
      </div>
      <div class="stat">
        <h3>24/7</h3>
        <p>지원 서비스</p>
      </div>
    </div>
  </section>

  <!-- CTA(회원가입) 섹션 -->
  <section class="cta-section">
    <h2>지금 바로 시작하세요</h2>
    <p>건강한 식습관을 위한 첫 걸음을 <b>BalanceEat</b>과 함께하세요</p>
    <router-link to="/register" class="cta-btn">무료 회원가입</router-link>
  </section>
</template>

<script setup>
// 별도 스크립트 필요 없음
</script>

<style scoped>
.hero-section {
  position: relative;
  height: 420px;
  background:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')
      center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.hero-section:hover {
  transform: scale(1.02);
}
.hero-overlay {
  color: #fff;
  text-align: center;
  width: 100%;
}
.hero-overlay h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}
.hero-overlay p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
}
.hero-btn {
  display: inline-block;
  background: #22a366;
  color: #fff;
  font-size: 1.1rem;
  padding: 0.9rem 2.2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}
.hero-btn:hover {
  background: #1e8c5a;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.features-section {
  background: #f8f9fa;
  padding: 3.5rem 0 2.5rem 0;
  text-align: center;
}
.features-section h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2.2rem;
}
.features-list {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
}
.feature {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  width: 260px;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.feature:hover {
  box-shadow: 0 6px 24px rgba(34, 163, 102, 0.13);
  transform: translateY(-6px) scale(1.04);
}
.feature-icon {
  font-size: 2.5rem;
  color: #22a366;
  margin-bottom: 1rem;
  display: block;
  transition:
    transform 0.2s,
    color 0.2s;
}
.feature:hover .feature-icon {
  transform: scale(1.2);
  color: #1e8c5a;
}
.feature h4 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.7rem;
}
.feature p {
  font-size: 1rem;
  color: #444;
}

.stats-section {
  padding: 3.5rem 0 2.5rem 0;
  text-align: center;
}
.stats-section h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2.2rem;
}
.stats-list {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
}
.stat {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  width: 180px;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.stat:hover {
  box-shadow: 0 6px 24px rgba(34, 163, 102, 0.13);
  transform: translateY(-6px) scale(1.04);
}
.stat h3 {
  color: #22a366;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.stat p {
  font-size: 1rem;
  color: #444;
}

.cta-section {
  background: #22a366;
  color: #fff;
  text-align: center;
  padding: 3.5rem 0 3rem 0;
}
.cta-section h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}
.cta-section p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}
.cta-btn {
  display: inline-block;
  background: #fff;
  color: #22a366;
  font-size: 1.1rem;
  padding: 0.9rem 2.2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}
.cta-btn:hover {
  background: #e6f4ea;
  color: #1e8c5a;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 900px) {
  .features-list,
  .stats-list {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  .hero-section {
    height: 260px;
  }
}
</style>
