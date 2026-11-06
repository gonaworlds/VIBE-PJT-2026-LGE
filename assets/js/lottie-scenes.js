const DATA_ROOT = new URL("../../data/lottie_animations_json/", import.meta.url);
const SCENES = [
  ["hero", "header_hero.svg", ["main 30 FPS.json"]],
  ["benefit-1", "benefit_01.svg", ["Loop_30FPS_comp.json"]],
  ["benefit-2", "benefit_02.svg", ["Loop_30FPS_comp_pc.json"]],
  ["benefit-3", "benefit_03.svg", ["04_StayMotivated_30FPS.json"]],
  ["benefit-4", "benefit_04.svg", ["3_LOOP (with ramp up)_30FPS.json"]],
  ["downloads-background", "downloads_01.svg", ["BACKGROUND_Optim_30FPS_Resized.json"]],
  ["downloads-foreground", "downloads_02.svg", ["Dotcom_060_AnytimeAnywhere_TM_30FPS.json"]],
  ["super", "try1week_owl.svg", ["07_Super_Duo_working_30FPS.json"]],
  ["english-test", "englishtest.svg", ["English Test_30FPS.json"]],
  ["ending", "getstarted.svg", ["120_Ending_30FPS.json", "120_Ending_30FPS_assets.json"]],
];
let playerPromise;

const loadPlayer = () => {
  playerPromise ??= import("./vendor/lottie.min.js").then(() => window.lottie);
  return playerPromise;
};

/**
 * Mount visibility-controlled animations with static SVG fallbacks.
 * @returns {() => void} Restores images and releases players and observers.
 */
export const initLottieScenes = () => {
  const controller = new AbortController();
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const records = [];
  let scrollFrame = 0;

  const updateScrollScene = (record) => {
    if (!record.ready || motionQuery.matches || document.hidden) return;
    const { top, height } = record.scrollRoot.getBoundingClientRect();
    // Scrub from first viewport entry to complete exit, in either direction.
    const scrollSpeed = 1.5; // 이 숫자를 바꾸면서 확인하세요.
    const progress = Math.min(1, Math.max(0,
      ((window.innerHeight - top) / (window.innerHeight + height))
      * scrollSpeed,
    ));
    for (const animation of record.animations) {
      animation.goToAndStop(progress * Math.max(0, animation.totalFrames - 1), true);
    }
  };
  const scheduleScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      records.filter((record) => record.isScrollDriven).forEach(updateScrollScene);
    });
  };

  const syncPlayback = (record) => {
    record.host.classList.toggle("is-animated", record.ready && !motionQuery.matches);
    if (record.isScrollDriven) {
      record.animations.forEach((animation) => animation.pause());
      updateScrollScene(record);
      return;
    }
    // 시간 기반 장면: 화면 안에 있는 동안 계속 반복 재생, 화면 밖에서는 일시정지
    const canPlay = canPlayRecord(record);
    for (const animation of record.animations) {
      if (canPlay && !animation.isPaused) continue;
      if (canPlay && !record.completed.has(animation)) animation.play();
      else animation.pause();
    }
  };

  const canPlayRecord = (record) =>
    record.ready && record.visible && !document.hidden && !motionQuery.matches;

  /**
   * 한 바퀴 재생이 끝난 애니메이션 처리 — 같은 장면의 모든 레이어가 끝나면 함께 처음부터 다시 재생
   * (Ending 처럼 JSON 이 여러 개인 장면도 서로 어긋나지 않게 동기화)
   */
  const handleLoopComplete = (record, animation) => {
    record.completed.add(animation);
    if (!record.animations.every((item) => record.completed.has(item))) return;
    record.completed.clear();
    const restart = canPlayRecord(record);
    for (const item of record.animations) {
      if (restart) item.goToAndPlay(0, true);
      else item.goToAndStop(0, true);
    }
  };

  const loadScene = async (record) => {
    if (record.loading || record.ready || motionQuery.matches) return;
    record.loading = true;
    record.host.dataset.lottieState = "loading";
    try {
      const [player, ...data] = await Promise.all([
        loadPlayer(),
        ...record.files.map(async (file) => {
          const response = await fetch(new URL(file, DATA_ROOT), {
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
          });
          if (!response.ok) throw new Error("Animation request failed: " + response.status);
          return response.json();
        }),
      ]);
      if (controller.signal.aborted) return;
      await Promise.all(data.map((animationData) => new Promise((resolve, reject) => {
        const layer = document.createElement("div");
        layer.className = "lottie-scene__layer";
        layer.setAttribute("aria-hidden", "true");
        record.host.append(layer);
        const animation = player.loadAnimation({
          container: layer, animationData, renderer: "svg", autoplay: false, loop: false,
          rendererSettings: {
            preserveAspectRatio: record.id.startsWith("downloads")
              ? "xMidYMid slice" : record.id === "ending" ? "xMidYMax slice" : "xMidYMid meet",
          },
        });
        record.animations.push(animation);
        const timeoutId = window.setTimeout(() => reject(new Error("Animation render timeout")), 20000);
        const handleReady = () => {
          window.clearTimeout(timeoutId);
          resolve();
        };
        const handleFailure = (error) => {
          window.clearTimeout(timeoutId);
          record.ready = false;
          record.host.classList.remove("is-animated");
          record.host.dataset.lottieState = "failed";
          record.animations.forEach((item) => item.pause());
          reject(error);
        };
        controller.signal.addEventListener("abort", () => {
          window.clearTimeout(timeoutId);
          reject(new DOMException("Animation disposed", "AbortError"));
        }, { once: true });
        animation.addEventListener("DOMLoaded", handleReady);
        animation.addEventListener("data_failed", handleFailure);
        animation.addEventListener("error", handleFailure);
        animation.addEventListener("complete", () => {
          if (!record.isScrollDriven) handleLoopComplete(record, animation);
        });
      })));
      if (controller.signal.aborted) return;
      record.ready = true;
      record.host.dataset.lottieState = "ready";
      syncPlayback(record);
    } catch (error) {
      for (const animation of record.animations) animation.destroy();
      record.animations = [];
      record.host.querySelectorAll(".lottie-scene__layer").forEach((layer) => layer.remove());
      record.host.dataset.lottieState = "failed";
      if (!controller.signal.aborted) console.warn("Lottie scene unavailable:", record.id, error);
    }
  };

  const preloadObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const record = records.find((item) => item.host === entry.target);
      record.nearby = entry.isIntersecting;
      if (record.nearby) void loadScene(record);
    }
  }, { rootMargin: "300px" });
  const visibleObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const record = records.find((item) => item.host === entry.target);
      // 시간 기반 장면은 화면에 다시 들어오면 멈췄던 지점부터 이어서 반복 재생
      record.visible = entry.isIntersecting;
      syncPlayback(record);
    }
  });

  for (const [id, , files] of SCENES) {
    const img = document.querySelector('[data-lottie-image="' + id + '"]');
    if (!img) continue;
    const host = document.createElement("div");
    host.className = img.className + " lottie-scene lottie-scene--" + id;
    host.dataset.lottieScene = id;
    if (img.alt) {
      host.setAttribute("role", "img");
      host.setAttribute("aria-label", img.alt);
    } else host.setAttribute("aria-hidden", "true");
    const originalClass = img.className;
    img.replaceWith(host);
    host.append(img);
    img.className = "lottie-scene__fallback";
    const record = {
      id, files, host, img, originalClass, animations: [], completed: new Set(),
      visible: false, nearby: false, ready: false, loading: false,
      isScrollDriven: img.dataset.lottiePlayback === "scroll",
      scrollRoot: host.closest("[data-js-downloads]") || host,
    };
    records.push(record);
    preloadObserver.observe(host);
    visibleObserver.observe(host);
  }

  const handleMotionChange = () => {
    for (const record of records) {
      syncPlayback(record);
      if (record.nearby) void loadScene(record);
    }
  };
  motionQuery.addEventListener("change", handleMotionChange, { signal: controller.signal });
  document.addEventListener("visibilitychange", () => records.forEach(syncPlayback), {
    signal: controller.signal,
  });
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true, signal: controller.signal });
  window.addEventListener("resize", scheduleScrollUpdate, { signal: controller.signal });
  window.addEventListener("pageshow", scheduleScrollUpdate, { signal: controller.signal });
  const resizeObserver = new ResizeObserver(scheduleScrollUpdate);
  resizeObserver.observe(document.body);

  return () => {
    controller.abort();
    preloadObserver.disconnect();
    visibleObserver.disconnect();
    resizeObserver.disconnect();
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    for (const record of records) {
      record.animations.forEach((animation) => animation.destroy());
      record.img.className = record.originalClass;
      record.host.replaceWith(record.img);
    }
  };
};
