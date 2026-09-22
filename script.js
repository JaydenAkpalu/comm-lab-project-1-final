/* =========================================================
   script.js
   The staircase on the film page.

   How it works:
   - The film is one video, split into 6 chapters by time.
   - The plate starts on the top step (chapter 1).
   - The plate is locked while a chapter plays. It unlocks when
     the chapter ends.
   - The visitor drags the plate down to the next step only.
     It can never go back up or skip a step.
   - After the last chapter, the plate can only go into the bin.
   ========================================================= */


// ---------- Chapter data ----------
// start and end are in seconds. The last chapter has end: null
// because it plays until the video finishes on its own.
const chapters = [
  { title: "Chapter I: Chosen",     start: 0,    end: 23 },
  { title: "Chapter II: Paid For",  start: 23,   end: 31 },
  { title: "Chapter III: Seated",   start: 31,   end: 59 },
  { title: "Chapter IV: Forgotten", start: 59,   end: 67 },
  { title: "Chapter V: Cleared",    start: 67,   end: 86.7 },
  { title: "Chapter VI: Wasted",    start: 86.7, end: null }
];

// Roman numerals shown on a step once the plate has reached it
const numerals = ["I", "II", "III", "IV", "V", "VI"];

// Background colors for each chapter, from fresh and warm to cold like the steel bin
const moodColors = ["#edeecd", "#e6e6cf", "#dedfd2", "#d6d9d5", "#cdd2d6", "#c2c8cd"];


// ---------- Get the elements from the page ----------
const video = document.getElementById("film");
const chapterLabel = document.getElementById("chapter-label");
const instructions = document.getElementById("instructions");
const plate = document.getElementById("plate");
const bin = document.getElementById("bin");
const ending = document.getElementById("ending");
const watchAgainButton = document.getElementById("watch-again");
const intro = document.getElementById("intro");
const beginButton = document.getElementById("begin-button");

const steps = [];
for (let i = 0; i < 6; i++) {
  steps.push(document.getElementById("step-" + i));
}


// ---------- Variables that keep track of what is happening ----------
let currentChapter = 0;   // which chapter/step the plate is on (0 to 5)
let isUnlocked = false;   // can the plate be dragged right now?
let isDragging = false;   // is the mouse holding the plate right now?
let grabX = 0;            // where on the plate the mouse grabbed it
let grabY = 0;
const stairs = document.getElementById("stairs");


// ---------- Put the plate on top of a step ----------
function placePlateOnStep(index) {
  const step = steps[index];
  plate.style.left = (step.offsetLeft + 30) + "px";
  plate.style.top = (step.offsetTop - 78) + "px";
}


// ---------- Update how every step looks ----------
// Steps before the plate are "done", the plate's step is "current",
// and steps after it stay blank so nothing is spoiled.
function updateSteps() {
  for (let i = 0; i < steps.length; i++) {
    steps[i].classList.remove("done");
    steps[i].classList.remove("current");

    if (i < currentChapter) {
      steps[i].classList.add("done");
      steps[i].textContent = numerals[i];
    } else if (i === currentChapter) {
      steps[i].classList.add("current");
      steps[i].textContent = numerals[i];
    } else {
      steps[i].textContent = "";
    }
  }
}


// ---------- Start a chapter ----------
function startChapter(index, playNow) {
  currentChapter = index;
  lockPlate();
  updateSteps();
  placePlateOnStep(index);

  chapterLabel.textContent = chapters[index].title;
  document.body.style.backgroundColor = moodColors[index];

  video.currentTime = chapters[index].start;

  if (playNow) {
    video.play();
    instructions.textContent = "Keep watching. The plate can't move until this chapter ends.";
  } else {
    instructions.textContent = "Press play to watch the first chapter.";
  }
}


// ---------- Lock and unlock the plate ----------
function lockPlate() {
  isUnlocked = false;
  plate.classList.remove("unlocked");
}

function unlockPlate() {
  // Only do this once per chapter
  if (isUnlocked) {
    return;
  }
  isUnlocked = true;
  plate.classList.add("unlocked");

  if (currentChapter === chapters.length - 1) {
    instructions.textContent = "It's over. Drag the plate into the bin.";
  } else {
    instructions.textContent = "Chapter over. Drag the plate down one step.";
  }
}


// ---------- Keep the video inside the current chapter ----------
// This runs many times per second while the video plays.
// It stops the video at the end of the chapter, and stops the
// visitor from skipping ahead (or back) into another chapter.
function checkVideoTime() {
  const chapter = chapters[currentChapter];

  // Jumped back before this chapter started: go to the start of the chapter
  if (video.currentTime < chapter.start - 0.5) {
    video.currentTime = chapter.start;
  }

  // The last chapter has no end time, so we stop checking here for it
  if (chapter.end === null) {
    return;
  }

  // Reached the end of the chapter: pause and let the plate move
  if (video.currentTime >= chapter.end) {
    video.pause();

    // If the visitor skipped far ahead, bring them back to the chapter's end
    if (video.currentTime > chapter.end + 0.5) {
      video.currentTime = chapter.end;
    }

    unlockPlate();
  }
}

video.addEventListener("timeupdate", checkVideoTime);

// The last chapter ends when the whole video ends
video.addEventListener("ended", function () {
  if (currentChapter === chapters.length - 1) {
    unlockPlate();
  }
});


// ---------- Dragging the plate ----------

// 1. Mouse pressed on the plate: start dragging (only if unlocked)
plate.addEventListener("mousedown", function (event) {
  event.preventDefault();

  if (!isUnlocked) {
    return;
  }

  isDragging = true;
  plate.classList.add("dragging");

  // Remember where on the plate we grabbed it, so it doesn't jump.
  // getBoundingClientRect() measures from the browser window, same as
  // event.clientX/Y, so both sides of this subtraction match up.
  const plateBox = plate.getBoundingClientRect();
  grabX = event.clientX - plateBox.left;
  grabY = event.clientY - plateBox.top;
});

// 2. Mouse moving: the plate follows it
document.addEventListener("mousemove", function (event) {
  if (!isDragging) {
    return;
  }

  // The plate's left/top CSS values are measured from the stairs box,
  // not from the browser window. So we take the mouse position (window
  // coordinates), then subtract the stairs box's own window position
  // to convert it into "distance from the stairs box" before using it.
  const stairsBox = stairs.getBoundingClientRect();
  const windowLeft = event.clientX - grabX;
  const windowTop = event.clientY - grabY;

  plate.style.left = (windowLeft - stairsBox.left) + "px";
  plate.style.top = (windowTop - stairsBox.top) + "px";
});

// 3. Mouse released: check where the plate was dropped
document.addEventListener("mouseup", function (event) {
  if (!isDragging) {
    return;
  }
  isDragging = false;
  plate.classList.remove("dragging");

  // After the last chapter the only place to go is the bin.
  // Otherwise the only place to go is the next step.
  let target;
  if (currentChapter === chapters.length - 1) {
    target = bin;
  } else {
    target = steps[currentChapter + 1];
  }

  if (isPlateOverTarget(target)) {
    if (target === bin) {
      throwPlateAway();
    } else {
      startChapter(currentChapter + 1, true);
    }
  } else {
    // Wrong place: the plate slides back to where it was
    placePlateOnStep(currentChapter);
  }
});

// Checks if the plate itself (not just the mouse) overlaps a target element.
// This looks at where the plate is actually sitting on screen, so it works
// no matter where on the plate the visitor first clicked to grab it.
// 30px of extra room around the target makes it easier to land on it.
function isPlateOverTarget(target) {
  const plateBox = plate.getBoundingClientRect();
  const targetBox = target.getBoundingClientRect();
  const extra = 30;

  const overlapsSideToSide = plateBox.right > (targetBox.left - extra) &&
                              plateBox.left < (targetBox.right + extra);
  const overlapsTopToBottom = plateBox.bottom > (targetBox.top - extra) &&
                               plateBox.top < (targetBox.bottom + extra);

  return overlapsSideToSide && overlapsTopToBottom;
}


// ---------- The ending ----------
function throwPlateAway() {
  lockPlate();
  instructions.textContent = "";

  // Move the plate onto the bin, then shrink it away
  plate.style.left = (bin.offsetLeft + 15) + "px";
  plate.style.top = (bin.offsetTop - 10) + "px";
  plate.classList.add("thrown-away");

  // Wait a moment, then show the ending screen
  setTimeout(function () {
    ending.classList.add("show");
  }, 1200);
}

// The only way to start over is from the ending screen
watchAgainButton.addEventListener("click", function () {
  location.reload();
});


// ---------- Ready screen ----------
// The visitor must press Begin before anything plays. This is also
// the only place the rules of the staircase are explained.
beginButton.addEventListener("click", function () {
  intro.classList.add("hide");
  startChapter(0, true);
});


// ---------- Start ----------
// Set up chapter 1, but do not play it yet. Playback starts once
// the visitor presses Begin on the ready screen above.
startChapter(0, false);
