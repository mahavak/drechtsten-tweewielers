(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#hoofdmenu");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var img = dialog.querySelector("img");
  var cap = dialog.querySelector(".lightbox-cap");
  var closeBtn = dialog.querySelector("[data-lightbox-close]");

  function openFrom(button) {
    var photo = button.querySelector("img");
    var figure = button.closest("figure");
    if (!photo || !img) return;
    img.src = photo.currentSrc || photo.src;
    img.alt = photo.alt || "";
    if (cap) {
      cap.textContent = figure && figure.querySelector("figcaption")
        ? figure.querySelector("figcaption").textContent
        : "";
    }
    dialog.showModal();
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (button) {
    button.addEventListener("click", function () {
      openFrom(button);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      dialog.close();
    });
  }

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
})();
