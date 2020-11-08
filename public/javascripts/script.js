const modal = document.getElementById('code-modal');
const content = document.getElementById('code-modal-content');

let open = false;

document.getElementById('close').addEventListener('click', () => {
  open = false;
  content.classList.add('animate__animated', 'animate__fadeOut', 'animate__faster');
});

document.getElementById('join').addEventListener('click', () => {
  open = true;
  modal.classList.add('is-active');
  content.classList.add('animate__animated', 'animate__fadeIn', 'animate__faster');
});

content.addEventListener('animationend', () => {
  if (open) {
    content.classList.remove('animate__animated', 'animate__fadeIn', 'animate__faster');
  } else {
    modal.classList.remove('is-active');
    content.classList.remove('animate__animated', 'animate__fadeOut', 'animate__faster');
  }
});

document.getElementById('code').addEventListener('change', e =>
  window.location.assign(`/room/${ e.target.value }`)
);