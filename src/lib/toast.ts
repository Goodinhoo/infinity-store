import Swal from 'sweetalert2'

export const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0d0d14',
  color: '#fff',
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

export const ConfirmAlert = {
  fire: async (title: string, text: string = '') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#bc13fe',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      background: '#0d0d14',
      color: '#fff'
    }).then(res => res.isConfirmed)
  }
}
