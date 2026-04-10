# Sakai Nuxt

Sakai Nuxt is a Nuxt-based application template derived from the original [Sakai Vue](https://github.com/primefaces/sakai-vue) project. This template enhances the development experience by leveraging Nuxt features like server-side rendering (SSR), static site generation (SSG), and seamless file-based routing.

Live Demo: [sakai-nuxt.netlify.app](https://sakai-nuxt.netlify.app)

## Overview

### Sakai Vue
The original Sakai Vue template is a Vue-based application starter powered by Vite. It provides a robust foundation for building scalable, performant web applications with features like:
- Minimalistic structure for quick setup.
- PrimeVue integration for UI components.
- Tailwind CSS for responsive and modern styling.

Visit the original Sakai Vue repository [here](https://github.com/primefaces/sakai-vue).

### Sakai Nuxt
Sakai Nuxt builds on this foundation, introducing the power and flexibility of Nuxt.js:
- **Server-Side Rendering (SSR)**: Boosts performance and SEO by rendering pages on the server.
- **Static Site Generation (SSG)**: Enables easy deployment of static pages for fast-loading, SEO-friendly sites.
- **File-Based Routing**: Simplifies route creation with Nuxt's pages directory.
- **Nuxt Modules**: Extend functionality with ready-to-use modules for SEO, analytics, and state management.

## Features
- **Nuxt 3 Framework**
- **PrimeVue Integration** for modern UI components.
- **Tailwind CSS** for utility-first styling.
- Configurable layout and menu through `layouts/` and `pages/`.
- Easily extendable and customizable.

## Getting Started

### Installation

Clone the repository and install dependencies:

```  bash
git clone https://github.com/suprimpoudel/sakai-nuxt  
cd sakai-nuxt  
npm install  
```  

### Running the Development Server

Run the development server with the following command:

```bash  
npm run dev  
```  

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

To build the project for production:

```bash  
npm run build  
```  

Start the production server:

```bash  
npm run start  
```  

### Deploy

Deploy your static site using Nuxt's static generation:

```bash  
npm run generate  
```  

### Docker Image Generation

To build the Docker image, run the build.sh script with a tag name:

```bash
build.sh <TAG_NAME>
```

Run Docker Image

To run the Docker image, use docker-compose:

```bash
docker-compose up
```

### Key Docker Files

	•	Dockerfile: Defines the multi-stage build process for the Docker image.
	•	docker-compose.yaml: Configuration for running the application in Docker.
	•	build.sh: Bash script to build the Docker image.

For more details on the Docker process, review these files in the repository.

## Folder Structure

- `pages/`: Houses application pages, automatically configured for routing.
- `layouts/`: Defines the main layout for the app.
- `composables/`: Contains reusable logic, similar to Vue's `src/layout/composables`.
- `assets/`: Holds static assets such as styles and images.
- `nuxt.config.js`: Centralized configuration file for Nuxt.

## Customization

### Menu
The main menu is defined in the `layouts/AppMenu.vue` file. Update the `model` property to customize menu items.

## Contribution
Contributions are welcome! Feel free to fork the repository, submit issues, or create pull requests.  