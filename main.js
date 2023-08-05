const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4
}

// detects a click on buttons mode
const modeButtons = document.querySelector('#js-mode-buttons')
modeButtons.addEventListener('click', handleMode)
function handleMode (e) {
  const { mode } = e.target.dataset
  if (!mode) return
  switchMode(mode)
}

function updateClock () {
  const { remainingTime } = timer
  //  pads them with zeros where necessary so that the number always has a width of two
  const minutes = `${remainingTime.minutes}`.padStart(2, '0')
  const seconds = `${remainingTime.seconds}`.padStart(2, '0')
  document.querySelector('#js-minutes').textContent = minutes
  document.querySelector('#js-seconds').textContent = seconds
  console.log(minutes)
  console.log(seconds)
}

function switchMode (mode) {
  timer.mode = mode
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0
  }
  // remove all 'active' class in the button
  document.querySelectorAll('button[data-mode]').forEach(e => {
    return e.classList.remove('active')
  })
  // add 'active' class to the clicked button and change bg color
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active')
  document.body.style.backgroundColor = `var(--${mode})`
  updateClock()
}
