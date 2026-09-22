/* =========================================================
   script.js — Step 4
   Same chapter locking as before, but the plate now moves
   by real mouse dragging instead of a button.
   Only moves between the 6 chapter steps for now — dropping
   on the bin after the last chapter is added in the next step.
   ========================================================= */

const chapters = [
  { title: "Chapter I: Chosen",     start: 0,    end: 23 },
  { title: "Chapter II: Paid For",  start: 23,   end: 31 },
  { title: "Chapter III: Seated",   start: 31,   end: 59 },
  { title: "Chapter IV: Forgotten", start: 59,   end: 67 },
  { title: "Chapter V: Cleared",    start: 67,   end: 86.7 },
  { title: "Chapter VI: Wasted",    start: 86.7, end: null }
];

const numerals = ["I", "II", "III", "IV", "V", "VI"];

const video = document.getElementById("film");
const chapterLabel = document.getElementById("chapter-label");
const instructions = document.getElementById("instructions");
const plate = document.getElementById("plate");
const stairs = document.getElementById("stairs");

const steps = [];
for (let i = 0; i < 6; i++) {
  steps.push(document.getElementById("step-" + i));
}

let currentChapter = 0;
let isUnlocked = false;
let isDragging = false;
let grabX = 0;
let grabY = 0;

function placePlateOnStep(index) {
  const step = steps[index];
  plate.style.left = (step.offsetLeft + 30) + "px";
  plate.style.top = (step.offsetTop - 78) + "px";
}

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

function lockPlate() {
  isUnlocked = false;
  plate.classList.remove("unlocked");
}

function unlockPlate() {
  if (isUnlocked) {
    return;
  }
  isUnlocked = true;
  plate.classList.add("unlocked");
  if (currentChapter === chapters.length - 1) {
    instructions.textContent = "End of chapter 6. Bin interaction isn't built yet.";
  } else {
    instructions.textContent = "Chapter over. Drag the plate down one step.";
  }
}

function startChapter(index, playNow) {
  currentChapter = index;
  lockPlate();
  updateSteps();
  placePlateOnStep(index);
  chapterLabel.textContent = chapters[index].title;
  video.currentTime = chapters[index].start;

  if (playNow) {
    video.play();
    instructions.textContent = "Keep watching. The plate can't move until this chapter ends.";
  } else {
    instructions.textContent = "Press play to watch the first chapter.";
  }
}

function checkVideoTime() {
  const chapter = chapters[currentChapter];
  if (video.currentTime < chapter.start - 0.5) {
    video.currentTime = chapter.start;
  }
  if (chapter.end === null) {
    return;
  }
  if (video.currentTime >= chapter.end) {
    video.pause();
    if (video.currentTime > chapter.end + 0.5) {
      video.currentTime = chapter.end;
    }
    unlockPlate();
  }
}

video.addEventListener("timeupdate", checkVideoTime);
video.addEventListener("ended", function () {
  if (currentChapter === chapters.length - 1) {
    unlockPlate();
  }
});

plate.addEventListener("mousedown", function (event) {
  event.preventDefault();
  if (!isUnlocked) {
    return;
  }
  isDragging = true;
  plate.classList.add("dragging");
  const plateBox = plate.getBoundingClientRect();
  grabX = event.clientX - plateBox.left;
  grabY = event.clientY - plateBox.top;
});

document.addEventListener("mousemove", function (event) {
  if (!isDragging) {
    return;
  }
  const stairsBox = stairs.getBoundingClientRect();
  const windowLeft = event.clientX - grabX;
  const windowTop = event.clientY - grabY;
  plate.style.left = (windowLeft - stairsBox.left) + "px";
  plate.style.top = (windowTop - stairsBox.top) + "px";
});

document.addEventListener("mouseup", function () {
  if (!isDragging) {
    return;
  }
  isDragging = false;
  plate.classList.remove("dragging");

  // No bin yet — only a next step (if there is one) is a valid target
  if (currentChapter < chapters.length - 1) {
    const target = steps[currentChapter + 1];
    if (isPlateOverTarget(target)) {
      startChapter(currentChapter + 1, true);
      return;
    }
  }
  placePlateOnStep(currentChapter);
});

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

startChapter(0, false);
