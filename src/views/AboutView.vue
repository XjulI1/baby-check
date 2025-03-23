<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="about">
    <AppHeader />

    <div class="about-content">
      <h2>À propos de Baby Check</h2>

      <section class="about-section">
        <h3>Le projet</h3>
        <p>
          Baby Check est une application conçue pour aider les parents à suivre les événements
          quotidiens de leur bébé, comme les changes (pipi, caca), les biberons et les périodes de
          sommeil.
        </p>
      </section>

      <section class="about-section">
        <h3>Créé avec l'IA</h3>
        <p>
          Ce projet a été généré initialement via <code>npm create vue@latest</code>, puis développé
          entièrement avec Claude 3.7 Sonnet (via GitHub Copilot) sans modification manuelle du code
          généré.
        </p>
        <p>
          L'application utilise Vue.js 3 avec les Composition API et script setup pour le frontend,
          et Express.js avec MariaDB pour le backend.
        </p>
      </section>

      <section class="about-section">
        <h3>Technologies utilisées</h3>
        <ul class="tech-list">
          <li><strong>Frontend:</strong> Vue 3, TypeScript, Vue Router, Pinia</li>
          <li><strong>Backend:</strong> Express.js, MariaDB</li>
          <li><strong>Tests:</strong> Vitest</li>
          <li><strong>Déploiement:</strong> Docker</li>
        </ul>
      </section>

      <section class="about-section">
        <h3>Fonctionnalités</h3>
        <ul>
          <li>Suivi des événements pipi, caca, biberon et sommeil</li>
          <li>Gestion de plusieurs enfants</li>
          <li>Statistiques quotidiennes et sur plusieurs périodes</li>
          <li>Installation en tant qu'application web progressive (PWA)</li>
          <li>Support du mode sombre/clair automatique</li>
        </ul>
      </section>

      <section class="about-section">
        <h3>Version</h3>
        <p>1.0.0</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.about-content {
  background-color: var(--surface-variant-color);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

h2 {
  color: var(--primary-color);
  margin-bottom: 24px;
  text-align: center;
}

.about-section {
  margin-bottom: 24px;
}

h3 {
  color: var(--primary-color);
  margin-bottom: 12px;
  font-size: 1.2rem;
}

p {
  margin: 8px 0;
  line-height: 1.5;
  color: var(--text-primary-color);
}

ul {
  padding-left: 20px;
  margin: 12px 0;
}

li {
  margin-bottom: 6px;
  color: var(--text-primary-color);
}

.tech-list {
  list-style-type: none;
  padding-left: 0;
}

code {
  background-color: var(--surface-color);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
