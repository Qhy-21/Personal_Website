// 设置年份 + 主页轮播 + 头像预览
document.addEventListener("DOMContentLoaded", () => {
  // 年份
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 头像大图预览（仅首页有）
  const avatarTrigger = document.getElementById("avatarPreviewTrigger");
  const avatarModal = document.getElementById("avatarModal");

  if (avatarTrigger && avatarModal) {
    const openModal = () => {
      avatarModal.classList.add("is-open");
      avatarModal.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
      avatarModal.classList.remove("is-open");
      avatarModal.setAttribute("aria-hidden", "true");
    };

    avatarTrigger.addEventListener("click", openModal);

    // 点击背景关闭
    avatarModal.addEventListener("click", (event) => {
      if (event.target === avatarModal) {
        closeModal();
      }
    });

    // Esc 关闭
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  }

  // 仅在首页启用像素轮播图（其它页面没有该区域）
  const carousel = document.querySelector(".pixel-carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const prevBtn = carousel.querySelector("[data-carousel-prev]");
  const nextBtn = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector(".carousel-dots");
  const carouselModal = document.getElementById("carouselModal");
  const carouselModalInner = carouselModal
    ? carouselModal.querySelector(".carousel-modal-inner")
    : null;
  let currentIndex = 0;

  if (!slides.length || !track) return;

  // 诗句大图预览
  const openCarouselModal = () => {
    if (!carouselModal || !carouselModalInner) return;
    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    // 把当前诗句的内容复制到弹窗中
    carouselModalInner.innerHTML = currentSlide.innerHTML;
    carouselModal.classList.add("is-open");
    carouselModal.setAttribute("aria-hidden", "false");
  };

  const closeCarouselModal = () => {
    if (!carouselModal) return;
    carouselModal.classList.remove("is-open");
    carouselModal.setAttribute("aria-hidden", "true");
  };

  if (carouselModal) {
    carouselModal.addEventListener("click", (event) => {
      if (event.target === carouselModal) {
        closeCarouselModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCarouselModal();
      }
    });
  }

  // 创建圆点
  let dots = [];
  if (dotsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot" + (index === 0 ? " is-active" : "");
      dot.setAttribute("data-index", String(index));
      dotsContainer.appendChild(dot);
    });
    dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));
  }

  const updateSlide = (index) => {
    const total = slides.length;
    currentIndex = (index + total) % total;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-current", i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      updateSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      updateSlide(currentIndex + 1);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const index = Number(dot.getAttribute("data-index") || "0");
      updateSlide(index);
    });
  });

  // 点击当前诗句卡片放大预览
  slides.forEach((slide, index) => {
    slide.addEventListener("click", () => {
      currentIndex = index;
      openCarouselModal();
    });
  });

  // 自动轮播（鼠标悬停时暂停）
  let timer = setInterval(() => {
    updateSlide(currentIndex + 1);
  }, 4000);

  carousel.addEventListener("mouseenter", () => {
    clearInterval(timer);
  });

  carousel.addEventListener("mouseleave", () => {
    timer = setInterval(() => {
      updateSlide(currentIndex + 1);
    }, 8000);
  });

  updateSlide(0);
});

