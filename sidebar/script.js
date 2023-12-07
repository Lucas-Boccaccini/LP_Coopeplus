document.getElementById('menuBtn').addEventListener('click', function () {
  toggleSidebar();
});
function toggleSidebar() {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  //const content = document.getElementById('content');
  const overlay = document.getElementById('overlay');
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (screenWidth <= 576) {
    if (sidebar.style.width === '100%') {
      sidebar.style.width = '0';
      overlay.style.display = 'none';
      body.classList.remove('sidebar-opened');
    } else {
      sidebar.style.width = '100%';
      overlay.style.display = 'block';
      body.classList.add('sidebar-opened');
    }
  } else {
    //body.classList.toggle('sidebar-opened');
    if (sidebar.style.width === '400px') {
      sidebar.style.width = '0';
      overlay.style.display = 'none';
      body.classList.remove('sidebar-opened');
    } else {
      sidebar.style.width = '400px';
      overlay.style.display = 'block';
      body.classList.add('sidebar-opened');
    }
  }
}

window.addEventListener('click', function (event) {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const overlay = document.getElementById('overlay');
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (screenWidth <= 576 && event.target !== sidebar && event.target !== menuBtn && event.target.closest('#sidebar') === null) {
    sidebar.style.width = '0';
    overlay.style.display = 'none';
    body.classList.remove('sidebar-opened');
  } else if (screenWidth > 576 && event.target !== sidebar && event.target !== menuBtn && event.target.closest('#sidebar') === null) {
    sidebar.style.width = '0';
    overlay.style.display = 'none';
    content.classList.remove('sidebar-opened');
    body.classList.remove('sidebar-opened');
  }
});

document.getElementById("closeBtn").addEventListener("click", function () {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  sidebar.style.width = '0';
  overlay.style.display = 'none';
  body.classList.remove('sidebar-opened');
});
