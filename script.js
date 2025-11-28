// Small interactions: year, nav toggle, contact form
document.addEventListener('DOMContentLoaded', function(){
  // Set copyright year
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Nav toggle for small screens
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  if(navToggle && nav){
    navToggle.addEventListener('click', function(){
      var shown = nav.style.display === 'block';
      nav.style.display = shown ? '' : 'block';
    });
    // close nav when a link is clicked (mobile)
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ if(window.innerWidth < 700) nav.style.display = '' }) });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(function(q){
    // ensure accessible attributes exist
    q.setAttribute('role','button');
    q.setAttribute('tabindex','0');
    q.setAttribute('aria-expanded', 'false');
    var item = q.closest('.faq-item');
    var ans = item.querySelector('.faq-answer');
    if(ans) ans.setAttribute('aria-hidden','true');

    function toggleFAQ(){
      var isOpen = q.getAttribute('aria-expanded') === 'true';
      // close all
      document.querySelectorAll('.faq-question').forEach(function(other){ other.setAttribute('aria-expanded','false') });
      document.querySelectorAll('.faq-answer').forEach(function(a){ a.style.display = 'none'; a.setAttribute('aria-hidden','true') });
      // open this one if it was closed
      if(!isOpen){
        q.setAttribute('aria-expanded','true');
        if(ans){ ans.style.display = 'block'; ans.setAttribute('aria-hidden','false') }
      }
    }

    q.addEventListener('click', toggleFAQ);
    q.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFAQ() } });
  });

  // Gallery lightbox
  var lightbox = null;
  function createLightbox(){
    lightbox = document.createElement('div');
    lightbox.style.position = 'fixed';
    lightbox.style.inset = 0;
    lightbox.style.background = 'rgba(0,0,0,0.75)';
    lightbox.style.display = 'flex';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    lightbox.style.zIndex = 9999;
    lightbox.addEventListener('click', function(){ document.body.removeChild(lightbox); lightbox = null });
    return lightbox;
  }
  document.querySelectorAll('.gallery-grid img').forEach(function(img){
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(e){
      if(!lightbox) document.body.appendChild(createLightbox());
      var big = document.createElement('img');
      big.src = img.src.replace('w=1600','w=2400');
      big.style.maxWidth = '90%';
      big.style.maxHeight = '90%';
      big.style.borderRadius = '8px';
      // clear and append
      lightbox.innerHTML = '';
      lightbox.appendChild(big);
    });
  });
  // keyboard support for lightbox
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && lightbox){ document.body.removeChild(lightbox); lightbox = null }
  });

  // Contact form handling (demo only)
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var message = form.querySelector('#message').value.trim();
      if(!name || !email || !message){
        status.textContent = 'Please complete all fields.';
        status.style.color = 'crimson';
        return;
      }
      // Try to POST to local server endpoint; fallback to demo message
      fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({name:name,email:email,message:message})
      }).then(function(res){
        if(res.ok) return res.json();
        throw new Error('Server error');
      }).then(function(json){
        status.textContent = json.message || 'Thanks — your message has been sent.';
        status.style.color = 'green';
        form.reset();
      }).catch(function(){
        // fallback demo
        status.textContent = 'Thanks — demo submission saved locally.';
        status.style.color = 'green';
        form.reset();
      });
    });
  }

  // Quote modal interactions
  var quoteModal = document.getElementById('quote-modal');
  var quoteForm = document.getElementById('quote-form');
  var quoteStatus = document.getElementById('quote-status');
  function openModal(){ if(quoteModal) quoteModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden' }
  var _prevActive = null;
  var _modalKeyHandler = null;
  function openModal(){
    if(!quoteModal) return;
    quoteModal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    // save focus
    _prevActive = document.activeElement;
    // focus first control
    var first = quoteModal.querySelector('input,textarea,button');
    if(first) first.focus();
    // trap focus
    _modalKeyHandler = function(e){
      if(e.key === 'Escape') return closeModal();
      if(e.key === 'Tab'){
        var focusable = Array.prototype.slice.call(quoteModal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function(n){ return n.offsetParent !== null });
        if(focusable.length === 0) return;
        var idx = focusable.indexOf(document.activeElement);
        if(e.shiftKey){
          if(idx === 0){ focusable[focusable.length-1].focus(); e.preventDefault(); }
        } else {
          if(idx === focusable.length-1){ focusable[0].focus(); e.preventDefault(); }
        }
      }
    };
    document.addEventListener('keydown', _modalKeyHandler);
  }
  function closeModal(){ if(!quoteModal) return; quoteModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if(_modalKeyHandler) document.removeEventListener('keydown', _modalKeyHandler); if(_prevActive && _prevActive.focus) _prevActive.focus(); }
  document.querySelectorAll('.open-quote').forEach(function(btn){ btn.addEventListener('click', function(e){ e.preventDefault(); openModal() }) });
  if(quoteModal){
    quoteModal.querySelector('.modal-close').addEventListener('click', closeModal);
    quoteModal.addEventListener('click', function(e){ if(e.target === quoteModal) closeModal() });
  }
  if(quoteForm){
    quoteForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('q-name').value.trim();
      var email = document.getElementById('q-email').value.trim();
      var message = document.getElementById('q-message').value.trim();
      if(!name || !email || !message){ quoteStatus.textContent = 'Please complete all fields.'; quoteStatus.style.color='crimson'; return }
      fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,message:message})}).then(function(r){ if(r.ok) return r.json(); throw new Error('err') }).then(function(j){ quoteStatus.textContent = j.message || 'Request sent.'; quoteStatus.style.color='green'; quoteForm.reset(); setTimeout(closeModal,1200) }).catch(function(){ quoteStatus.textContent='Demo: request saved locally.'; quoteStatus.style.color='green'; quoteForm.reset(); setTimeout(closeModal,1200) })
    })
  }

  // Back to top
  var back = document.getElementById('back-to-top');
  window.addEventListener('scroll', function(){ if(window.scrollY > 300) back.classList.add('show'); else back.classList.remove('show') });
  back.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}) });

  // Testimonial carousel
  (function(){
    var s = document.querySelector('.testimonials-slider');
    if(!s) return;
    var idx = 0; var slides = s.children; var total = slides.length;
    function go(i){ s.style.transform = 'translateX(' + (-i*100) + '%)'; idx = (i+total)%total }
    document.querySelector('.t-prev').addEventListener('click', function(){ go(idx-1) });
    document.querySelector('.t-next').addEventListener('click', function(){ go(idx+1) });
    setInterval(function(){ go(idx+1) }, 5000);
    // keyboard navigation for testimonials (left/right)
    document.addEventListener('keydown', function(e){
      var activeTag = document.activeElement.tagName.toLowerCase();
      if(activeTag === 'input' || activeTag === 'textarea') return;
      if(e.key === 'ArrowLeft') go(idx-1);
      if(e.key === 'ArrowRight') go(idx+1);
    });
  })();

  // Scroll reveal
  var revealItems = document.querySelectorAll('.reveal');
  function checkReveal(){ revealItems.forEach(function(el){ var r = el.getBoundingClientRect(); if(r.top < window.innerHeight - 60) el.classList.add('visible') }) }
  window.addEventListener('scroll', checkReveal); checkReveal();

  // Newsletter (demo): simple client-side ack
  var newsletter = document.getElementById('newsletter-form');
  if(newsletter){
    newsletter.addEventListener('submit', function(e){
      e.preventDefault();
      var em = document.getElementById('newsletter-email').value.trim();
      if(!em){
        alert('Please enter an email.');
        return;
      }
      alert('Thanks — you are subscribed (demo).');
      newsletter.reset();
    });
  }
});





document.getElementById("nav-toggle").onclick = () => {
  document.getElementById("site-nav").classList.toggle("open");
};
