/* Product 3D: gives the collection photos real depth so they turn slightly.
 * Each product <img> with a data-depth attribute gets a WebGL canvas on top of it.
 * The depth map (white = near, black = far) lets the bag move more than the floor behind it.
 *   - Mouse: the bag turns towards the cursor.
 *   - Touch: drag sideways to turn it; while scrolling it tilts gently by itself.
 *   - Nothing happens with "Reduce motion" on or without WebGL: the normal photo stays.
 * Cards only draw while they are on screen and moving, so idle cards cost nothing.
 * Depth maps are made with tools/make-depth.sh (see CLAUDE.md).
 */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const imgs = [...document.querySelectorAll('.product .img img[data-depth]')];
  if (!imgs.length || !window.WebGLRenderingContext) return;

  const STRENGTH = 0.04;          // how far it turns (share of the image)
  const touch = matchMedia('(pointer: coarse)').matches;

  const VS = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}';
  // short ray march: near parts (the bag) move more than far parts (the floor), and the floor is found behind the bag
  const FS = `precision mediump float;varying vec2 uv;uniform sampler2D img,dep;uniform vec2 tilt;uniform float zoom;
    void main(){vec2 c=(uv-.5)/zoom+.5;vec2 s=c-tilt*.5;float hit=0.;
      for(int i=0;i<24;i++){float l=1.-float(i)/23.;vec2 q=c+tilt*(l-.5);
        if(hit<.5&&texture2D(dep,q).r>=l){s=q;hit=1.;}}
      gl_FragColor=texture2D(img,clamp(s,0.,1.));}`;

  const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const imageReady = img => img.complete && img.naturalWidth ? Promise.resolve(img) : new Promise((res, rej) => { img.addEventListener('load', () => res(img), { once: true }); img.addEventListener('error', rej, { once: true }); });

  const cards = [];
  let running = false;

  function setup(img) {
    const fig = img.closest('.img');
    const canvas = document.createElement('canvas');
    canvas.className = 'p3d';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
    if (!gl) return;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = (unit, image) => {
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR));
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    Promise.all([imageReady(img), loadImage(img.dataset.depth)]).then(([photo, depth]) => {
      gl.uniform1i(gl.getUniformLocation(pr, 'img'), 0); tex(0, photo);
      gl.uniform1i(gl.getUniformLocation(pr, 'dep'), 1); tex(1, depth);
      const c = { fig, canvas, gl, uTilt: gl.getUniformLocation(pr, 'tilt'), uZoom: gl.getUniformLocation(pr, 'zoom'),
                  x: 0, y: 0, tx: 0, ty: 0, visible: true, dirty: true };
      fig.append(canvas);
      const size = () => {
        const r = fig.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
        gl.viewport(0, 0, canvas.width, canvas.height); c.dirty = true; wake();
      };
      size(); new ResizeObserver(size).observe(fig);
      bind(c); cards.push(c); seen.observe(fig);
      requestAnimationFrame(() => canvas.classList.add('on'));
      wake();
    }).catch(() => {});
  }

  function bind(c) {
    const f = c.fig;
    let drag = null, moved = false;
    f.addEventListener('pointermove', e => {
      const r = f.getBoundingClientRect();
      if (drag) {
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 6) moved = true;
        c.tx = Math.max(-1, Math.min(1, drag.tx + dx / r.width * 2.2));
      } else if (e.pointerType === 'mouse') {
        c.tx = ((e.clientX - r.left) / r.width - .5) * 2;
        c.ty = ((e.clientY - r.top) / r.height - .5) * 2;
      }
      wake();
    });
    f.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { drag = { x: e.clientX, tx: c.tx }; moved = false; } });
    const release = () => { if (drag) { drag = null; c.tx = 0; wake(); } };
    f.addEventListener('pointerup', release); f.addEventListener('pointercancel', release);
    f.addEventListener('pointerleave', () => { if (!drag) { c.tx = 0; c.ty = 0; wake(); } });
    // a drag should turn the bag, not open the photo zoom
    f.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }

  // only cards on screen are drawn
  const seen = new IntersectionObserver(entries => entries.forEach(en => {
    const c = cards.find(k => k.fig === en.target); if (c) { c.visible = en.isIntersecting; if (c.visible) { c.dirty = true; wake(); } }
  }));

  // on touch screens the bags tilt gently with scrolling, so visitors notice they are 3D
  if (touch) addEventListener('scroll', () => {
    const vh = innerHeight;
    cards.forEach(c => { if (!c.visible) return; const r = c.fig.getBoundingClientRect(); c.ty = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / vh * 1.6)); });
    wake();
  }, { passive: true });

  function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }
  function frame() {
    let busy = false;
    for (const c of cards) {
      if (!c.visible) continue;
      const nx = c.x + (c.tx - c.x) * .09, ny = c.y + (c.ty - c.y) * .09;
      const moving = Math.abs(nx - c.x) > 1e-4 || Math.abs(ny - c.y) > 1e-4;
      if (!moving && !c.dirty) continue;
      c.x = nx; c.y = ny; c.dirty = false; busy = busy || moving;
      c.gl.uniform2f(c.uTilt, -c.x * STRENGTH, -c.y * STRENGTH);
      c.gl.uniform1f(c.uZoom, 1 + STRENGTH * 1.2);
      c.gl.drawArrays(c.gl.TRIANGLE_STRIP, 0, 4);
      c.fig.style.transform = `perspective(1000px) rotateY(${(c.x * 4).toFixed(2)}deg) rotateX(${(-c.y * 3).toFixed(2)}deg)`;
    }
    if (busy) requestAnimationFrame(frame); else running = false;
  }

  // set cards up shortly before they scroll into view
  const near = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { near.unobserve(en.target); setup(en.target); }
  }), { rootMargin: '300px 0px' });
  imgs.forEach(i => near.observe(i));
})();
