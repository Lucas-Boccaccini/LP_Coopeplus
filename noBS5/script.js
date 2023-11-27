document.getElementById('menuBtn').addEventListener('click', function () {
    toggleSidebar();
  });

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const overlay = document.getElementById('overlay');
    content.classList.toggle('sidebar-opened'); // Añade o quita la clase según el estado
    if (sidebar.style.width === '400px') { // Cambié el ancho a 400px
      sidebar.style.width = '0';
      //content.style.marginRight = '0';
      overlay.style.display = 'none';
    } else {
      sidebar.style.width = '400px'; // Cambié el ancho a 400px
      // content.style.marginRight = '400px'; // Cambié el ancho a 400px
      overlay.style.display = 'block';
    }
  }

  // Cerrar el sidebar haciendo clic fuera de él
  window.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const overlay = document.getElementById('overlay');
    if (event.target !== sidebar && event.target !== menuBtn && event.target.closest('#sidebar') === null) {
      sidebar.style.width = '0';
      //content.style.marginRight = '0';
      overlay.style.display = 'none';
      content.classList.remove('sidebar-opened');
    }
  });
//   function toggleOption() {
//     const toggleCheckbox = document.getElementById('toggleCheckbox');
//     const optionStatus = toggleCheckbox.checked;
//     console.log('Opción:', optionStatus);
//   }
  document.getElementById("closeBtn").addEventListener("click", function() {
    toggleSidebar();
  })