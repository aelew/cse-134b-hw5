class ProjectCardElement extends HTMLElement {
  project;

  constructor(project) {
    super();
    this.project = project;
  }

  connectedCallback() {
    if (!this.project) {
      return;
    }

    this.innerHTML = `
      <project-card-header>
        <h3>${this.project.name}</h3>
        <p>${this.project.description}</p>
      </project-card-header>

      <picture>
        <source srcset="${this.project.cover.lg}" media="(min-width: 768px)" />
        <img
          alt="Cover for ${this.project.name} project"
          src="${this.project.cover.base}"
          height="173"
          width="330"
        />
      </picture>

      <a href="${this.project.url}" target="_blank">View project</a>
    `;
  }
}

customElements.define('project-card', ProjectCardElement);

function updateProjects(projects) {
  projects.forEach((project) => {
    const card = new ProjectCardElement(project);
    document.getElementById('project-grid')?.appendChild(card);
  });
}

document.getElementById('load-local')?.addEventListener('click', () => {
  const projects = JSON.parse(localStorage.getItem('projects'));
  if (!Array.isArray(projects)) {
    throw new Error('Invalid data');
  }
  updateProjects(projects);
});

document.getElementById('load-remote')?.addEventListener('click', () => {
  fetch('https://my-json-server.typicode.com/aelew/cse-134b-hw5-data/projects')
    .then((r) => r.json())
    .then((projects) => {
      if (!Array.isArray(projects)) {
        throw new Error('Invalid data');
      }
      updateProjects(projects);
    });
});

document.addEventListener('DOMContentLoaded', () => {
  localStorage.setItem(
    'projects',
    JSON.stringify([
      {
        name: 'DevTerms',
        description: 'Online dictionary curated for developers',
        url: 'https://devterms.com',
        cover: {
          base: 'https://cse-134b-hw5.vercel.app/media/projects/devterms.jpg',
          lg: 'https://cse-134b-hw5.vercel.app/media/projects/devterms-lg.jpg',
        },
      },
      {
        name: 'Cobalt',
        description: 'Social media downloader extension for Raycast',
        url: 'https://www.raycast.com/aelew/cobalt',
        cover: {
          base: 'https://cse-134b-hw5.vercel.app/media/projects/raycast-cobalt.jpg',
          lg: 'https://cse-134b-hw5.vercel.app/media/projects/raycast-cobalt-lg.jpg',
        },
      },
      {
        name: 'Mailery',
        description: 'Cross-platform email client',
        url: 'https://mailery.app',
        cover: {
          base: 'https://cse-134b-hw5.vercel.app/media/projects/mailery.jpg',
          lg: 'https://cse-134b-hw5.vercel.app/media/projects/mailery-lg.jpg',
        },
      },
      {
        name: 'Tech Internship Alerts',
        description: 'Job listing and monitoring bot',
        url: 'https://github.com/aelew/tech-internship-alerts',
        cover: {
          base: 'https://cse-134b-hw5.vercel.app/media/projects/tech-internship-alerts.jpg',
          lg: 'https://cse-134b-hw5.vercel.app/media/projects/tech-internship-alerts-lg.jpg',
        },
      },
    ])
  );
});
