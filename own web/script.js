particlesJS("particles-js", {
    particles: {
      number: { value: 120, density: { enable: true, value_area: 800 } },
      color: { value: "#6c8cff" },
      shape: { type: "circle" },
      opacity: { value: 0.3 },
      size: { value: 3 },
      line_linked: { enable: true, color: "#ccc", opacity: 0.2 },
      move: { enable: true, speed: 2 }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" }
      },
      modes: {
        grab: { distance: 150, line_linked: { opacity: 0.4 } },
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  });
  