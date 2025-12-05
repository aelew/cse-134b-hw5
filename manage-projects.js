const REMOTE_SERVER_API_URL =
  'https://my-json-server.typicode.com/aelew/cse-134b-hw5-data/projects';
const LOCAL_PROJECTS_KEY = 'projects';

let storageMode = 'local'; // 'local' or 'remote'. default to local

// local storage
function getProjectsLocal() {
  const data = localStorage.getItem(LOCAL_PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveProjectsLocal(projects) {
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
}

// remote mock server API (using My JSON Server)
async function getProjectsRemote() {
  try {
    const response = await fetch(REMOTE_SERVER_API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('GET request:', { method: 'GET', url: REMOTE_SERVER_API_URL });
    return await response.json();
  } catch (error) {
    console.error('Error while trying to fetch remote projects:', error);
    return [];
  }
}

function getProjects() {
  return storageMode === 'local' ? getProjectsLocal() : getProjectsRemote();
}

// message display helpers
const infoOutput = document.getElementById('info-message');
const errorOutput = document.getElementById('error-message');

function displayInfo(message) {
  setTimeout(() => infoOutput.scrollIntoView());
  infoOutput.textContent = message;
  errorOutput.textContent = '';
  setTimeout(() => {
    infoOutput.textContent = '';
  }, 5000);
}

function displayError(message) {
  setTimeout(() => errorOutput.scrollIntoView());
  errorOutput.textContent = message;
  infoOutput.textContent = '';
}

// update UI elements
async function updateUI() {
  await updateProjectsList();
  await updateDropdowns();
}

async function updateProjectsList() {
  const projects = await getProjects();
  const listContainer = document.getElementById('projects-list');

  if (!projects.length) {
    listContainer.innerHTML = '<p>No projects yet. Create one above!</p>';
    return;
  }

  listContainer.innerHTML = projects
    .map(
      (project, index) => `
    <li>
      <article>
        <h4>${project.name} (index: ${index})</h4>
        <p>${project.description}</p>
        <p><strong>URL:</strong> <a href="${project.url}" target="_blank">${project.url}</a></p>
      </article>
    </li>
  `
    )
    .join('');
}

async function updateDropdowns() {
  const projects = await getProjects();
  const updateSelect = document.getElementById('update-select');
  const deleteSelect = document.getElementById('delete-select');

  // reset both dropdowns
  updateSelect.innerHTML = '<option value="">-- Select a project --</option>';
  deleteSelect.innerHTML = '<option value="">-- Select a project --</option>';

  projects.forEach((project, i) => {
    const option = new Option(project.name, i);
    updateSelect.add(option);
    deleteSelect.add(option.cloneNode(true));
  });
}

// CREATE - POST method
const createForm = document.getElementById('create-form');
createForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(createForm);
  const newProject = {
    name: formData.get('name'),
    description: formData.get('description'),
    url: formData.get('url'),
    cover: {
      base: formData.get('cover-base'),
      lg: formData.get('cover-lg'),
    },
  };

  try {
    if (storageMode === 'local') {
      // local storage - POST concept
      const projects = await getProjects();
      projects.push(newProject);
      saveProjectsLocal(projects);

      console.log('POST request (localStorage):', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
        method: 'POST',
      });
    } else {
      // remote API - actual POST request
      const response = await fetch(REMOTE_SERVER_API_URL, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
        method: 'POST',
      });

      console.log('POST request (remote):', {
        method: 'POST',
        url: REMOTE_SERVER_API_URL,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
        status: response.status,
      });

      if (!response.ok) {
        throw new Error(`Request failed with HTTP status ${response.status}`);
      }
    }

    displayInfo(
      `Project "${newProject.name}" created!${
        storageMode === 'remote' ? ' (NOTE: Remote changes are not persisted)' : ''
      }`
    );

    createForm.reset();
    await updateUI();
  } catch (error) {
    displayError('Error while trying to create project.');
    console.error('Create error:', error);
  }
});

// UPDATE - PUT method
const updateForm = document.getElementById('update-form');
const updateSelect = document.getElementById('update-select');

// set form values when project is selected
updateSelect.addEventListener('change', async () => {
  const index = updateSelect.value;
  if (!index) {
    return;
  }

  const projects = await getProjects();

  const project = projects[parseInt(index)];
  if (!project) {
    return;
  }

  document.getElementById('update-name').value = project.name;
  document.getElementById('update-description').value = project.description;
  document.getElementById('update-url').value = project.url;
  document.getElementById('update-cover-base').value = project.cover.base;
  document.getElementById('update-cover-lg').value = project.cover.lg;
});

updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const index = parseInt(updateSelect.value);
  if (isNaN(index)) {
    displayError('Please select a project to update.');
    return;
  }

  const formData = new FormData(updateForm);

  const updatedProject = {
    name: formData.get('name'),
    description: formData.get('description'),
    url: formData.get('url'),
    cover: {
      base: formData.get('cover-base'),
      lg: formData.get('cover-lg'),
    },
  };

  try {
    if (storageMode === 'local') {
      // local storage - PUT concept
      const projects = await getProjects();
      projects[index] = updatedProject;
      saveProjectsLocal(projects);

      console.log('PUT request (localStorage):', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
        url: `/projects/${index}`,
        method: 'PUT',
      });
    } else {
      // remote API - actual PUT request
      // remote IDs start at 0, matching array index
      const response = await fetch(`${REMOTE_SERVER_API_URL}/${index}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
        method: 'PUT',
      });

      console.log('PUT request (remote):', {
        method: 'PUT',
        url: `${REMOTE_SERVER_API_URL}/${index}`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
        status: response.status,
      });

      if (!response.ok) {
        throw new Error(`Request failed with HTTP status ${response.status}`);
      }
    }

    displayInfo(
      `Project "${updatedProject.name}" updated!${
        storageMode === 'remote' ? ' (NOTE: Remote changes are not persisted)' : ''
      }`
    );

    updateForm.reset();
    await updateUI();
  } catch (error) {
    displayError('Error while trying to update project.');
    console.error('Update error:', error);
  }
});

// DELETE method
const deleteForm = document.getElementById('delete-form');
deleteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const index = parseInt(document.getElementById('delete-select').value);
  if (isNaN(index)) {
    displayError('Please select a project to delete.');
    return;
  }

  const projects = await getProjects();
  const projectName = projects[index]?.name;

  try {
    if (storageMode === 'local') {
      // local storage - DELETE concept
      projects.splice(index, 1);
      saveProjectsLocal(projects);

      console.log('DELETE request (localStorage):', {
        url: `/projects/${index}`,
        method: 'DELETE',
      });
    } else {
      // remote API - actual DELETE request
      const response = await fetch(`${REMOTE_SERVER_API_URL}/${index}`, {
        method: 'DELETE',
      });

      console.log('DELETE request (remote):', {
        method: 'DELETE',
        url: `${REMOTE_SERVER_API_URL}/${index}`,
        status: response.status,
      });

      if (!response.ok) {
        throw new Error(`Request failed with HTTP status ${response.status}`);
      }
    }

    displayInfo(
      `Project "${projectName}" deleted!${
        storageMode === 'remote' ? ' (NOTE: Remote changes are not persisted)' : ''
      }`
    );

    deleteForm.reset();
    await updateUI();
  } catch (error) {
    displayError('Error while trying to delete project.');
    console.error('Delete error:', error);
  }
});

// storage mode switcher
const storageModeSelect = document.getElementById('storage-mode');
storageModeSelect?.addEventListener('change', async () => {
  storageMode = storageModeSelect.value;
  console.log(`Storage mode switched to: ${storageMode}`);
  await updateUI();
});

document.addEventListener('DOMContentLoaded', async () => {
  // init if empty
  if (!localStorage.getItem(LOCAL_PROJECTS_KEY)) {
    saveProjectsLocal([
      {
        projects: [
          {
            id: 0,
            name: 'DevTerms',
            description: 'Online dictionary curated for developers',
            url: 'https://devterms.com',
            cover: {
              base: 'https://cse-134b-hw5.vercel.app/media/projects/devterms.jpg',
              lg: 'https://cse-134b-hw5.vercel.app/media/projects/devterms-lg.jpg',
            },
          },
          {
            id: 1,
            name: 'Cobalt',
            description: 'Social media downloader extension for Raycast',
            url: 'https://www.raycast.com/aelew/cobalt',
            cover: {
              base: 'https://cse-134b-hw5.vercel.app/media/projects/raycast-cobalt.jpg',
              lg: 'https://cse-134b-hw5.vercel.app/media/projects/raycast-cobalt-lg.jpg',
            },
          },
          {
            id: 2,
            name: 'Mailery',
            description: 'Cross-platform email client',
            url: 'https://mailery.app',
            cover: {
              base: 'https://cse-134b-hw5.vercel.app/media/projects/mailery.jpg',
              lg: 'https://cse-134b-hw5.vercel.app/media/projects/mailery-lg.jpg',
            },
          },
          {
            id: 3,
            name: 'Tech Internship Alerts',
            description: 'Job listing and monitoring bot',
            url: 'https://github.com/aelew/tech-internship-alerts',
            cover: {
              base: 'https://cse-134b-hw5.vercel.app/media/projects/tech-internship-alerts.jpg',
              lg: 'https://cse-134b-hw5.vercel.app/media/projects/tech-internship-alerts-lg.jpg',
            },
          },
        ],
      },
    ]);
  }

  await updateUI();
});
