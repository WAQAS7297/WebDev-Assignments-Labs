const megaMenu = document.getElementById('mega-menu');
const btn = document.getElementById('previous-tasks-btn');

// Task Data
const tasks = [
  {
    title: "Assignment 1: CV",
    desc: "Create a CV using HTML and CSS.",
    link: "../../Assignments/Assignment_1/html1.html"
  },
  {
    title: "Assignment 2: E-Commerce Landing Page",
    desc: "Build a landing page with product showcase.",
    link: "../../Assignments/Assignment_2/html2.html"
  },
  {
    title: "Lab Task 1: Bootstrap Landing Page",
    desc: "Add responsiveness and UI plugins.",
    link: "../../Lab_Tasks/Lab_Task_1/html3.html"
  },
  {
    title: "Lab Task 2: Checkout Page",
    desc: "Form validation with JS for a checkout experience.",
    link: "../../Lab_Tasks/Lab_Task_2/html4.html"
  }
];


btn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (megaMenu.style.display === 'block') {
    megaMenu.style.display = 'none';
  } else {
    megaMenu.innerHTML = '';
    tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'mega-menu-entry';
      div.innerHTML = `
        <strong>${task.title}</strong><br>
        ${task.desc}
        <a href="${task.link}" target="_blank">[View]</a>
      `;
      megaMenu.appendChild(div);
    });
    megaMenu.style.display = 'block';
  }
});


document.addEventListener('click', () => {
  megaMenu.style.display = 'none';
});