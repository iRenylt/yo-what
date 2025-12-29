const openLetter = document.getElementById("openLetter");
const closeLetter = document.getElementById("closeLetter");
const letter = document.getElementById("letter");
const toggleMusic = document.getElementById("toggleMusic");
const bgMusic = document.getElementById("bgMusic");

openLetter.addEventListener("click", () => {
  letter.classList.add("visible");
});

closeLetter.addEventListener("click", () => {
  letter.classList.remove("visible");
});

toggleMusic.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusic.textContent = "❤️";
  } else {
    bgMusic.pause();
    toggleMusic.textContent = "💓";
  }

  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");

  menuBtn.addEventListener("click", () => {
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  });

  function goTo(section) {
    document.getElementById(section).scrollIntoView({ behavior: "smooth" });
    menu.style.display = "none";
  }

});
