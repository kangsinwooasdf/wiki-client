function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.classList.toggle("show");
}

document.addEventListener('click', function (e) {
  const dropdown = document.querySelector('.sidebar-dropdown');
  const menu = document.getElementById('dropdownMenu');
  const toggle = dropdown.querySelector('.dropdown-toggle');

  if (!dropdown.contains(e.target)) {
    menu.classList.remove('show');
  }
});