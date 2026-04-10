<template>
  <div class="card">
    <div class="font-semibold text-2xl mb-4">Documentation</div>
    <div class="font-semibold text-xl mb-4">Get Started</div>
    <p class="text-lg mb-4">
      Sakai is an application template originally built for Vue, now migrated to Nuxt for enhanced features such as server-side rendering, static site generation, and improved development experience. The migration was based on the
      <a href="https://github.com/primefaces/sakai-vue" class="font-medium text-primary hover:underline">original Vue template</a>. You can find the Nuxt version in the
      <a href="https://github.com/suprimpoudel/sakai-nuxt" class="font-medium text-primary hover:underline">Sakai Nuxt repository</a>.
    </p>
    <p class="text-lg mb-4">
      To get started, clone the <a href="https://github.com/suprimpoudel/sakai-nuxt" class="font-medium text-primary hover:underline">repository</a> from GitHub and install the dependencies with npm or yarn.
    </p>
    <pre class="app-code">
<code>git clone https://github.com/suprimpoudel/sakai-nuxt
npm install
npm run dev
</code></pre>

    <p class="text-lg mb-4">Navigate to <i class="bg-highlight px-2 py-1 rounded-border not-italic text-base">http://localhost:3000/</i> to view the application in your local environment.</p>

    <pre class="app-code"><code>npm run dev</code></pre>

    <div class="font-semibold text-xl mb-4">Migration Notes</div>
    <p class="text-lg mb-4">
      This project has been migrated to Nuxt to leverage its powerful features, including:
    </p>
    <ul class="leading-normal list-disc pl-8 text-lg mb-4">
      <li>Improved performance with server-side rendering (SSR).</li>
      <li>Support for static site generation (SSG).</li>
      <li>Nuxt modules for features like SEO, state management, and more.</li>
      <li>Simplified routing via file-based system.</li>
      <li>Enhanced developer experience with hot module replacement and better tooling.</li>
    </ul>

    <div class="font-semibold text-xl mb-4">Structure</div>
    <p class="text-lg mb-4">
      The folder structure has been adapted for Nuxt. Key changes include:
    </p>
    <ul class="leading-normal list-disc pl-8 text-lg mb-4">
      <li><span class="text-primary font-medium">pages/</span>: Replaces the <code>src/views</code> folder and follows Nuxt's file-based routing.</li>
      <li><span class="text-primary font-medium">layouts/</span>: Contains the main layout files similar to <code>src/layout</code>.</li>
      <li><span class="text-primary font-medium">assets/</span>: Styles and other assets remain similar to the original Vue template.</li>
      <li><span class="text-primary font-medium">composables/</span>: Houses reusable stateful logic (equivalent to <code>src/layout/composables</code>).</li>
      <li><span class="text-primary font-medium">nuxt.config.js</span>: Configuration file for Nuxt-specific settings.</li>
    </ul>

    <div class="font-semibold text-xl mb-4">Menu</div>
    <p class="text-lg mb-4">
      The main menu is now defined in <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base">layouts/AppMenu.vue</span>. You can update the <i class="bg-highlight px-2 py-1 rounded-border not-italic text-base">model</i> property to define your menu items as before.
    </p>

    <div class="font-semibold text-xl mb-4">Tailwind CSS</div>
    <p class="text-lg mb-4">The demo pages continue to utilize Tailwind CSS, with no significant changes to the integration in the migration.</p>
  </div>
</template>

<style lang="scss" scoped>
@media screen and (max-width: 991px) {
  .video-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
