let interval
const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  sessions: 0
}

const buttonSound = new Audio('button-sound.mp3')
// detects a click on buttons mode
const mainButton = document.querySelector('#js-btn')
mainButton.addEventListener('click', function () {
  buttonSound.play()
  const { action } = mainButton.dataset
  if (action === 'start') {
    startTimer()
  } else {
    stopTimer()
  }
})
const modeButtons = document.querySelector('#js-mode-buttons')
modeButtons.addEventListener('click', handleMode)

function getRemainingTime (endTime) {
  const currentTime = Date.parse(new Date())
  const difference = endTime - currentTime

  // compute the total number of seconds left by dividing by 1000
  const total = Number.parseInt(difference / 1000, 10)
  // The minutes variable contains the number of whole minutes left (if any)
  const minutes = Number.parseInt((total / 60) % 60, 10)
  // the number of seconds left after whole minutes have been accounted for
  // for example if total = 230 = 3 minutes & 50 seconds
  const seconds = Number.parseInt(total % 60, 10)
  return {
    total,
    minutes,
    seconds
  }
}

function startTimer () {
  let { total } = timer.remainingTime
  // get the exact time in the future when the timer will end
  const endTime = Date.parse(new Date()) + total * 1000
  // sessions property is incremented at the start of a pomodoro session
  if (timer.mode === 'pomodoro') timer.sessions++
  mainButton.dataset.action = 'stop'
  mainButton.textContent = 'stop'
  mainButton.classList.add('active')
  interval = setInterval(function () {
    timer.remainingTime = getRemainingTime(endTime)
    updateClock()

    total = timer.remainingTime.total
    if (total <= 0) {
      clearInterval(interval)

      // auto switch to the next session on completion of the current one
      switch (timer.mode) {
        case 'pomodoro':
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode('longBreak')
          } else {
            switchMode('shortBreak')
          }
          break
        default:
          switchMode('pomodoro')
      }
      document.querySelector(`[data-sound="${timer.mode}"]`).play()
      if (Notification.permission === 'granted') {
        const text =
          timer.mode === 'pomodoro' ? 'Get back to work' : 'Take a break'
        new Notification(text)
      }
      startTimer()
    }
  }, 1000)
}

function stopTimer () {
  clearInterval(interval)
  mainButton.dataset.action = 'start'
  mainButton.textContent = 'start'
  mainButton.classList.remove('active')
}

function updateClock () {
  const { remainingTime } = timer
  //  pads them with zeros where necessary so that the number always has a width of two
  const minutes = `${remainingTime.minutes}`.padStart(2, '0')
  const seconds = `${remainingTime.seconds}`.padStart(2, '0')
  document.querySelector('#js-minutes').textContent = minutes
  document.querySelector('#js-seconds').textContent = seconds
  const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!'
  document.title = `${minutes}:${seconds} - ${text}`
  const progress = document.getElementById('js-progress')
  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total
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
  document
    .getElementById('js-progress')
    .setAttribute('max', timer.remainingTime.total)
  updateClock()
}

function handleMode (e) {
  const { mode } = e.target.dataset
  if (!mode) return
  switchMode(mode)
  // stop the timer when the mode is changed by clicking any of the three buttons above the countdown
  stopTimer()
}

// ensure that the mode and remainingTime properties are set on the timer object on page load
document.addEventListener('DOMContentLoaded', function () {
  //  Check if the browser supports notifications
  if ('Notification' in window) {
    // If notification permissions have neither been granted or denied
    if (
      Notification.permission === 'granted' &&
      Notification.permission !== 'denied'
    ) {
      // ask the user for permission
      Notification.requestPermission().then(function (permission) {
        // if permission is granted
        if (permission === 'granted') {
          // create notification
          new Notification(
            'Awesome, you will notified at the start of each session'
          )
        }
      })
    }
  }
  switchMode('pomodoro')
})
