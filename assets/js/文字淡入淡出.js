window.addEventListener('load', () => {
    const titleElem = document.getElementById('pageTitle');
    titleElem.classList.add('fade-in');
  });
  function fadeOutAndRemove(elem) {
    elem.classList.add('fade-out');
    // 等待动画结束后再移除
    setTimeout(() => {
      elem.remove(); // 或者切换到新页面
    }, 600); // 时间与CSS中的动画时长相匹配
  }
    