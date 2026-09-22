/* =========================================================
   script.js — Step 3
   Chapter data, video locking, and step display.
   The plate moves when the temporary Next button is used;
   real dragging is added in the next step.
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
const nextButton = document.getElementById("next-btn");

const steps = [];
for (let i = 0; i < 6; i++) {
  steps.push(document.getElementById("step-" + i));
}

let currentChapter = 0;
let isUnlocked = false;

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

function startChapter(index, playNow) {
  currentChapter = index;
  isUnlocked = false;
  updateSteps();
  placePlateOnStep(index);
  chapterLabel.textContent = chapters[index].title;
  video.currentTime = chapters[index].start;

  if (playNow) {
    video.play();
    instructions.textContent = "Keep watching. The button unlocks when this chapter ends.";
  } else {
    instructions.textContent = "Press play to watch the first chapter.";
  }
}

function unlockPlate() {
  if (isUnlocked) {
    return;
  }
  isUnlocked = true;
  instructions.textContent = "Chapter over. Press the button to move to the next chapter.";
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

nextButton.addEventListener("click", function () {
  if (!isUnlocked) {
    return;
  }
  if (currentChapter < chapters.length - 1) {
    startChapter(currentChapter + 1, true);
  }
});

startChapter(0, false);
